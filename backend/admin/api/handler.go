package adminapi

import (
	"fmt"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/models"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/labstack/echo"
	"github.com/shopspring/decimal"
	"math/big"
	"net/http"
	"os"
	"time"
)

func RestartEngineHandler(e echo.Context) (err error) {
	restartEngineEvent := common.Event{
		Type: common.EventRestartEngine,
	}

	err = queueService.Push([]byte(utils.ToJsonString(restartEngineEvent)))
	return response(e, nil, err)
}

func GetStatusHandler(e echo.Context) (err error) {
	return response(e, map[string]interface{}{
		"web":       healthCheckService.CheckWeb(),
		"api":       healthCheckService.CheckApi(),
		"engine":    healthCheckService.CheckEngine(),
		"watcher":   healthCheckService.CheckWatcher(),
		"launcher":  healthCheckService.CheckLauncher(),
		"websocket": healthCheckService.CheckWebSocket(),
	}, err)
}

func GetBalancesHandler(e echo.Context) (err error) {
	var req struct {
		Address string `json:"address" query:"address" validate:"required"`
		Limit   int    `json:"limit"`
		Offset  int    `json:"offset"`
	}

	var resp []struct {
		Symbol        string          `json:"symbol"`
		LockedBalance decimal.Decimal `json:"lockedBalance"`
	}

	err = e.Bind(&req)
	if err == nil {
		tokens := models.TokenDao.GetAllTokens()

		for _, token := range tokens {
			lockedBalance := models.BalanceDao.GetByAccountAndSymbol(req.Address, token.Symbol, token.Decimals)
			resp = append(resp, struct {
				Symbol        string          `json:"symbol"`
				LockedBalance decimal.Decimal `json:"lockedBalance"`
			}{
				Symbol:        token.Symbol,
				LockedBalance: lockedBalance,
			},
			)
		}

		rLen := len(resp)
		if req.Offset < rLen {
			if req.Offset+req.Limit < rLen {
				resp = resp[req.Offset : req.Offset+req.Limit]
			} else {
				resp = resp[req.Offset:]
			}
		}
	}

	return response(e, map[string]interface{}{"balances": resp}, err)
}

func GetTradesHandler(e echo.Context) (err error) {
	var req struct {
		Address  string `json:"address"   query:"address"   validate:"required"`
		MarketID string `json:"market_id" query:"market_id" validate:"required"`
		Status   string `json:"status"    query:"status"`
		Offset   int    `json:"offset"    query:"offset"`
		Limit    int    `json:"limit "    query:"limit"`
	}

	var trades []*models.Trade
	var count int64
	err = e.Bind(&req)
	if err == nil {
		count, trades = models.TradeDao.FindAccountMarketTrades(req.Address, req.MarketID, req.Status, req.Offset, req.Limit)
	}

	return response(e, map[string]interface{}{"count": count, "trades": trades}, err)
}

func GetOrdersHandler(e echo.Context) (err error) {
	var req struct {
		Address  string `json:"address"   query:"address"   validate:"required"`
		MarketID string `json:"market_id" query:"market_id" validate:"required"`
		Status   string `json:"status"    query:"status"`
		Offset   int    `json:"offset"    query:"offset"`
		Limit    int    `json:"limit "    query:"limit"`
	}

	var orders []*models.Order
	var count int64

	err = e.Bind(&req)
	if err == nil {
		count, orders = models.OrderDao.FindByAccount(req.Address, req.MarketID, req.Status, req.Offset, req.Limit)
	}

	return response(e, map[string]interface{}{"count": count, "orders": orders}, err)
}

func DeleteOrderHandler(e echo.Context) (err error) {
	orderID := e.Param("order_id")

	if orderID == "" {
		err = fmt.Errorf("orderID is blank, check param")
	} else {
		order := models.OrderDao.FindByID(orderID)
		if order == nil {
			err = fmt.Errorf("cannot find order by ID %s", orderID)
		} else {
			cancelOrderEvent := common.CancelOrderEvent{
				Event: common.Event{
					Type:     common.EventCancelOrder,
					MarketID: 