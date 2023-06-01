
package api

import (
	"encoding/json"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/models"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/shopspring/decimal"
	"time"
)

type SnapshotV2 struct {
	Sequence uint64      `json:"sequence"`
	Bids     [][2]string `json:"bids"`
	Asks     [][2]string `json:"asks"`
}

func GetOrderBook(p Param) (interface{}, error) {
	params := p.(*OrderBookReq)
	marketID := params.MarketID
	var snapshot SnapshotV2

	orderBookStr, err := CacheService.Get(common.GetMarketOrderbookSnapshotV2Key(marketID))

	if err == common.KVStoreEmpty {
		orderBookStr = utils.ToJsonString(&SnapshotV2{
			Sequence: 0,
			Bids:     [][2]string{},
			Asks:     [][2]string{},
		})
	} else if err != nil {
		return nil, err
	}

	err = json.Unmarshal([]byte(orderBookStr), &snapshot)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"orderBook": snapshot,
	}, nil
}

func GetMarkets(_ Param) (interface{}, error) {
	var markets []Market
	dbMarkets := models.MarketDao.FindPublishedMarkets()

	for _, dbMarket := range dbMarkets {
		marketStatus := GetMarketStatus(dbMarket.ID)

		gasFeeAmount := getGasFeeAmount(dbMarket)

		markets = append(markets, Market{
			ID:                     dbMarket.ID,
			BaseToken:              dbMarket.BaseTokenSymbol,
			BaseTokenName:          dbMarket.BaseTokenName,
			BaseTokenDecimals:      dbMarket.BaseTokenDecimals,
			BaseTokenAddress:       dbMarket.BaseTokenAddress,
			QuoteToken:             dbMarket.QuoteTokenSymbol,
			QuoteTokenDecimals:     dbMarket.QuoteTokenDecimals,
			QuoteTokenAddress:      dbMarket.QuoteTokenAddress,
			MinOrderSize:           dbMarket.MinOrderSize,
			PricePrecision:         dbMarket.PricePrecision,
			PriceDecimals:          dbMarket.PriceDecimals,
			AmountDecimals:         dbMarket.AmountDecimals,
			AsMakerFeeRate:         dbMarket.MakerFeeRate,
			AsTakerFeeRate:         dbMarket.TakerFeeRate,
			GasFeeAmount:           gasFeeAmount,
			SupportedOrderTypes:    []string{"limit", "market"},
			MarketOrderMaxSlippage: utils.StringToDecimal("0.1"),
			MarketStatus:           *marketStatus,
		})
	}
