package dex_engine

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/connection"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/models"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/engine"
	"github.com/HydroProtocol/hydro-sdk-backend/sdk/ethereum"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"os"
	"strings"
	"sync"
)

type RedisOrderBookSnapshotHandler struct {
	kvStore common.IKVStore
}

func (handler RedisOrderBookSnapshotHandler) Update(key string, bookSnapshot *common.SnapshotV2) sync.WaitGroup {
	bts, err := json.Marshal(bookSnapshot)
	if err != nil {
		panic(err)
	}

	_ = handler.kvStore.Set(key, string(bts), 0)

	return sync.WaitGroup{}
}

type RedisOrderBookActivitiesHandler struct {
}

func (handler RedisOrderBookActivitiesHandler) Update(webSocketMessages []common.WebSocketMessage) sync.WaitGroup {
	for _, msg := range webSocketMessages {
		if strings.HasPrefix(msg.ChannelID, "Market#") {
			pushMessage(msg)
		}
	}

	return sync.WaitGroup{}
}

type DexEngine struct {
	// global ctx, if this ctx is canceled, queue handlers should exit in a short time.
	ctx context.Context

	// all redis queues handlers
	marketHandlerMap map[string]*MarketHandler
	eventQueue       common.IQueue

	// Wait for all queue handler exit gracefully
	Wg sync.WaitGroup

	HydroEngine *engine.Engine
}

func NewDexEngine(ctx context.Context) *DexEngine {
	// init redis
	redis := connection.NewRedisClient(os.Getenv("HSK_REDIS_URL"))

	// init websocket queue
	wsQueue, _ := common.InitQueue(
		&common.RedisQueueConfig{
			Name:   common.HYDRO_WEBSOCKET_MESSAGES_QUEUE_KEY,
			Ctx:    ctx,
			Client: redis,
		},
	)
	InitWsQueue(wsQueue)

	// init event queue
	eventQueue, _ := common.InitQueue(
		&common.RedisQueueConfig{
			Name:   common.HYDRO_ENGINE_EVENTS_QUEUE_KEY,
			Client: redis,
			Ctx:    ctx,
		})

	e := engine.NewEngine(context.Background())

	// setup handler for hydro engine
	kvStore, _ := common.InitKVStore(&common.RedisKVStoreConfig{Ctx: ctx, Client: redis})
	snapshotHandler := RedisOrderBookSnapshotHandler{kvStore: kvStore}
	e.RegisterOrderBookSnapshotHandler(snapshotHandler)

	activityHandler := RedisOrderBookActivitiesHandler{}
	e.RegisterOrderBookActivitiesHandler(activityHandler)

	engine := &DexEngine{
		ctx:              ctx,
		eventQueue:       eventQueue,
		marketHandlerMap: make(map[string]*MarketHandler),
		Wg:               sync.WaitGroup{},

		HydroEngine: e,
	}

	markets := models.MarketDao.FindPublishedMarkets()
	for _, market := range markets {
		_, err := engine.newMarket(market.ID)
		if err != nil {
			panic(err)
		}
	}

	return engine
}

func (e *DexEngine) newMarket(marketId string) (marketHandler *MarketHandler, err error) {
	_, ok := e.marketHandlerMap[marketId]

	if ok {
		err = fmt.Errorf("open market fail, market [%s] already exist", marketId)
		return
	}

	market := models.MarketDao.FindMarketByID(marketId)
	if market == nil {
		err = fmt.Errorf("open market fail, market [%s] not found", marketId)
		return
	}

	if !market.IsPublished {
		err = fmt.Errorf("open market fai