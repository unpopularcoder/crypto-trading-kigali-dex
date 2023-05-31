package adminapi

import (
	"context"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/connection"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/models"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/sdk/ethereum"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"net/http"
	"os"
	"time"
)

var queueService common.IQueue
var healthCheckService IHealthCheckMonitor
var erc20Service ethereum.IErc20

func loadRoutes(e *echo.Echo) {
	e.Add("GET", "/markets", ListMarketsHandler)
	e.Add("POST", "/markets", CreateMarketHandler)
	e.Add("POST", "/markets/approve", ApproveMarketHandler)
	e.Add("PUT", "/markets", EditMarketHandler)
	e.Add("DELETE", "/orders/:order_id", DeleteOrderHandler)
	e.Add("GET", "/orders", GetOrdersHandler)
	e.Add("GET", "/trades", GetTradesHandler)
	e.Add("GET", "/balances", GetBalancesHandler)
	e.Add("GET", "/status", GetStatusHandler)
	e.Add("POST", "/restart_engine", RestartEngineHandler)
}

func newEchoServer() *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: 