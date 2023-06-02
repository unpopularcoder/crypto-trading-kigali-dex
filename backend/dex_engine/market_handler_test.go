package dex_engine

import (
	"context"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/models"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/engine"
	"github.com/HydroProtocol/hydro-sdk-backend/sdk/ethereum"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"math/rand"
	"os"
	"testing"
	"time"
)

type marketHandlerSuite struct {
	suite.Suite
	marketHandler *MarketHandler
}

const fakeAccount1 = "0x31ebd457b999bf99759602f5ece5aa5033cb56b3"
const fakeAccount2 = "0x3eb06f432ae8f518a957852aa44776c234b4a84a"

func (s *marketHandlerSuite) SetupSuite() {
}

func (s *marketHandlerSuite) TearDownSuite() {
}

func (s *marketHandlerSuite) SetupTest() {
	setEnvs()
	models.InitTestDBPG()
	//models.MockMarketDao()
	market := &models.Market{
		ID:                 "HOT-DAI",
		BaseTokenSymbol:    "HOT",
		BaseTokenAddress:   os.Getenv("HSK_WETH_TOKEN_ADDRESS"),
		BaseTokenDecimals:  18,
		QuoteTokenSymbol:   "DAI",
		QuoteTokenAddress:  os.Getenv("HSK_USD_TOKEN_ADDRESS"),
		QuoteTokenDecimals: 18,
		MinOrderSize:       decimal.NewFromFloat(0.1),
		PricePrecision:     5,
		PriceDecimals:      5,
		AmountDecimals:     5,
		MakerFeeRate:       decimal.NewFromFloat(0.001),
		TakerFeeRate:       decimal.NewFromFloat(0.003),
		GasUsedEstimation:  250000,
	}

	err := models.MarketDao.InsertMarket(market)
	if err != nil {
		panic(err)
	}

	token := &models.Token{
		Name:     "HOT",
		Symbol:   "HOT",
		Address:  os.Getenv("HSK_WETH_TOKEN_ADDRESS"),
		Decimals: 18,
	}

	_ = models.TokenDao.InsertToken(token)

	wsQueue = &common.MockQueue{}
	kvStore := &common.MockKVStore{}

	wsQueue.(*common.MockQueue).On("Push", mock.Anything).Return(nil)
	kvStore.On("Set", mock.Anything, mock.Anything, mock.Anything).Return(nil)
	kvStore.On("Get", mock.Anything).Return("", common.KVStoreEmpty)
	marketHotDai := models.MarketHotDai()
	marketHandler, _ := NewMarketHandler(context.Background(), marketHotDai, engine.NewEngine(context.Background()))
	s.marketHandler = marketHandler

	s.marketHandler.hydroEngine.RegisterOrderBookActivitiesHandler(RedisOrderBookActivitiesHandler{})
}

func (s *marketHandlerSuite) TearDownTest() {
}

func (s *marketHandlerSuite) AssertChange(realTestFunc func(), counterFunc func() int, expectedDiff int, msgAndArgs ...interface{}) {
	resBefore := counterFunc()
	realTestFunc()
	resAfter := counterFunc()
	s.Equal(expectedDiff, resAfter-resBefore, msgAndArgs...)
}

func (s *marketHandlerSuite) TestHandleNewOrder() {
	sellOrder := newModelOrder("buy", decimal.New(140, 0), decimal.New(140, 0))

	sellOrderEvent := &common.NewOrderEvent{
		Event: common.Event{},
		Order: utils.ToJsonString(sellOrder),
	}

	//s.Nil(s.marketHandler.orderbook.MaxBid())

	s.AssertChange(func() {
		_, _ = s.marketHandler.handleNewOrder(sellOrderEvent)
	}, func() int {
		return models.OrderDao.Count()
	}, 1)

	//s.Equal("140", s.marketHandler.orderbook.MaxBid().String())
}

type batchMatchOrdersTest struct {
	takerOrderParams          *buildOrderParams
	makerOrdersParams         []*buildOrderParams
	expectedTradesCount       int
	expectedTransactionsCount int

	whenPending *expectedResult
	whenSuccess *expectedResult
	whenFailed  *expectedResult

	takerOrder  *models.Order
	makerOrders []*models.Order
}

func (b *batchMatchOrdersTest) Reset() {
	b.takerOrder = b.takerOrderParams.toModelOrder()
	b.makerOrders = make([]*models.Order, 0, 10)

	for i := range b.makerOrdersParams {
		params := b.makerOrdersParams[i]
		b.makerOrders = append(b.makerOrders, params.toModelOrder())
	}

}

type buildOrderParams struct {
	side   string
	price  string
	amount string
}

func (p *buildOrderParams) toModelOrder() *models.Order {
	return newModelOrder(
		p.side,
		utils.StringToDecimal(p.price),
		utils.StringToDecimal(p.amount),
	)
}

type expectedResult struct {
	expectedAmounts               [][]string
	expectedStatus                []string
	expectedMarketChannelPayloads []*common.WebsocketMarketOrderChangePayload
}

func contains(s [][]byte, e []byte) bool {
	for _, a := range s {
		if string(a) == string(e) {
			return true
		}
	}
	return false
}

func (s *marketHandlerSuite) newBatchMatchOrdersTest(
	takerOrderParams *buildOrderParams,
	makerOrdersParams []*buildOrderParams,
	expectedTradesCount int,
	expectedTransactionsCount int,
	whenPending *expectedResult,
	whenSuccess *expectedResult,
	whenFailed *expectedResult,
) {
	testConfig := &batchMatchOrdersTest{
		takerOrderParams,
		makerOrdersParams,
		expectedTradesCount,
		expectedTransactionsCount,
		whenPending,
		whenSuccess,
		whenFailed,
		nil,
		nil,
	}

	s.batchNewOrderTest(