package models

import (
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/davecgh/go-spew/spew"
	uuid2 "github.com/satori/go.uuid"
	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/assert"
	"math/rand"
	"os"
	"testing"
	"time"
)

func Test_PG_GetAccountOrders(t *testing.T) {
	setEnvs()
	InitTestDBPG()

	orders := OrderDaoPG.FindMarketPendingOrders("WETH-DAI")
	assert.EqualValues(t, 0, len(orders))

	order1 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order2 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order3 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order4 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order5 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order6 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order7 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order8 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order9 := NewOrder(TestUser1, "WETH-DAI", "buy", false)

	order10 := NewOrder(TestUser2, "WETH-DAI", "buy", false)

	err := OrderDaoPG.InsertOrder(order1)
	spew.Dump(err)

	_ = OrderDaoPG.InsertOrder(order2)
	_ = OrderDaoPG.InsertOrder(order3)
	_ = OrderDaoPG.InsertOrder(order4)
	_ = OrderDaoPG.InsertOrder(order5)
	_ = OrderDaoPG.InsertOrder(order6)
	_ = OrderDaoPG.InsertOrder(order7)
	_ = OrderDaoPG.InsertOrder(order8)
	_ = OrderDaoPG.InsertOrder(order9)
	_ = OrderDaoPG.InsertOrder(order10)

	var count int64
	count, orders = OrderDaoPG.FindByAccount(TestUser1, "WETH-DAI", common.ORDER_PENDING, 3, 9)
	assert.EqualValues(t, 6, len(orders))
	assert.EqualValues(t, 9, count)

	count, orders = OrderDaoPG.FindByAccount(TestUser1, "WETH-DAI", common.ORDER_PENDING, 0, 10)
	assert.EqualValues(t, 9, len(orders))
	assert.EqualValues(t, 9, count)

	count, orders = OrderDaoPG.FindByAccount(TestUser1, "WETH-DAI", common.ORDER_PENDING, 0, 9)
	assert.EqualValues(t, 9, len(orders))
	assert.EqualValues(t, 9, count)

	count, orders = OrderDaoPG.FindByAccount(TestUser1, "WETH-DAI", common.ORDER_FULL_FILLED, 0, 9)
	assert.EqualValues(t, 0, len(orders))
	assert.EqualValues(t, 0, count)
}

func Test_PG_GetMarketPendingOrders(t *testing.T) {
	setEnvs()
	InitTestDBPG()

	orders := OrderDaoPG.FindMarketPendingOrders("WETH-DAI")
	assert.EqualValues(t, 0, len(orders))

	order1 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order2 := NewOrder(TestUser1, "WETH-DAI", "buy", false)
	order3 := NewOrder(TestUser1, "WETH-DAI", "buy", false)

	_ = OrderDaoPG.InsertOrder(order1)
	_ = OrderDaoPG.InsertOrder(order2)
	_ = OrderDaoPG.InsertOrder(order3)

	orders = OrderDaoPG.FindMarketPendingOrders("WETH-DAI")
	assert.EqualValues(t, 3, len(orders))
}

func Test_PG_FindNotExistOrder(t *testing.T) {
	setEnvs()
	InitTestDBPG()

	dbOrder := OrderDaoPG.FindByID("empty_id")
	assert.Nil(t, dbOrder)

}

func Test_PG_InsertAndFindOneAndUpdateOrders(t *testing.T) {
	setEnvs()
	InitTestDBPG()

	order := RandomOrder()

	err := OrderDaoPG.InsertOrder(order)
	assert.Nil(t, err)

	dbOrder := OrderDaoPG.FindByID(order.ID)
	assert.EqualValues(t, dbOrder.ID, order.ID)
	assert.EqualValues(t, dbOrder.Status, order.Status)
	assert.EqualValues(t, dbOrder.Amount.String(), order.Amount.String())
	assert.EqualValues(t, dbOrder.Price.String(), order.Price.String())
	assert.EqualValues(t, dbOrder.AvailableAmount.String(), order.AvailableAmount.String())
	assert.EqualValues(t, dbOrder.PendingAmount.String(), order.PendingAmount.String())

	dbOrder.PendingAmount.Add(dbOrder.AvailableAmount)
	dbOrder.AvailableAmount = decimal.Zero
	err = OrderDaoPG.UpdateOrder(dbOrder)
	dbOrder2 := OrderDaoPG.FindByID(order.ID)

	assert.EqualValues(t, dbOrder.AvailableAmount.String(), dbOrder2.AvailableAmount.String())
	assert.EqualValues(t, dbOrder.PendingAmount.String(), dbOrder2.PendingAmount.String())
}

func Test_PG_Order_GetOrderJson(t *testing.T) {
	json := OrderJSON{
		Trader:                  TestUser1,
		Relayer:                 os.Getenv("HSK_RELAYER_ADDRESS"),
		BaseCurrencyHugeAmount:  utils.StringToDecimal("100000000000000000000000000000000000"),
		QuoteCurrencyHugeAmount: utils.StringToDecimal("200000000000000000000000000000000000"),
		BaseCurrency:            os.Getenv("HSK_HYDRO_TOKEN_ADDRESS"),
		QuoteCurrency:           os.Getenv("HSK_USD_TOKEN_ADDRESS"),
		GasTokenHugeAmount:      utils.StringToDecimal("1000000000")