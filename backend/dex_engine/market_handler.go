package dex_engine

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/HydroProtocol/hydro-sdk-backend/engine"
	"math/big"
	"os"
	"runtime"
	"time"

	"github.com/HydroProtocol/hydro-scaffold-dex/backend/models"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/sdk"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/shopspring/decimal"
)

type MarketHandler struct {
	ctx         context.Context
	market      *models.Market
	eventChan   chan []byte
	hydroEngine *engine.Engine
}

// Run is synchronous, it will be improved in the later releases.
func (m *MarketHandler) Run() {
	for data := range m.eventChan {
		_ = handleEvent(m, string(data))
	}
	utils.Infof("market %s stopped", m.market.ID)
}

func (m *MarketHandler) Stop() {
	close(m.eventChan)
}

// handleEvent recover any panic which is caused by event.
// It will log event and response as well.
func handleEvent(marketHandler *MarketHandler, eventJSON string) (err error) {
	var event common.Event

	defer func() {
		if rcv := recover(); rcv != nil {
			err = rcv.(error)
		}

		if err != nil {
			buf := make([]byte, 2048)
			n := runtime.Stack(buf, false)
			stackInfo := fmt.Sprintf("%s", buf[:n])

			utils.Errorf("Errorf: %+v", err)
			utils.Errorf(stackInfo)
		}

	}()

	err = json.Unmarshal([]byte(eventJSON), &event)

	if err != nil {
		utils.Errorf("Unmarshal event failed %s", eventJSON)
		return err
	}

	_, err = marketHandler.handleEvent(event, eventJSON)

	return err
}

func (m *MarketHandler) handleEvent(event common.Event, eventJSON string) (interface{}, error) {
	switch event.Type {
	case common.EventNewOrder:
		var e common.NewOrderEvent
		_ = json.Unmarshal([]byte(eventJSON), &e)
		res, _ := m.handleNewOrder(&e)
		return res, nil
	case common.EventCancelOrder:
		var e common.CancelOrderEvent
		_ = json.Unmarshal([]byte(eventJSON), &e)
		res, err := m.handleCancelOrder(&e)
		return res, err
	case common.EventConfirmTransaction:
		var e common.ConfirmTransactionEvent
		_ = json.Unmarshal([]byte(eventJSON), &e)
		res, err := m.handleTransactionResult(&e)
		return res, err
	default:
		return nil, fmt.Errorf("unsupport event for market %s %s", m.market.ID, eventJSON)
	}
}

func (m MarketHandler) handleNewOrder(event *common.NewOrderEvent) (transaction *models.Transaction, launchLog *models.LaunchLog) {
	eventOrderString := event.Order
	var eventOrder models.Order
	_ = json.Unmarshal([]byte(eventOrderString), &eventOrder)

	eventMemoryOrder := &common.MemoryOrder{
		ID:           eventOrder.ID,
		MarketID:     eventOrder.MarketID,
		Price:        eventOrder.Price,
		Amount:       eventOrder.Amount,
		Side:         eventOrder.Side,
		GasFeeAmount: eventOrder.GasFeeAmount,
		MakerFeeRate: eventOrder.MakerFeeRate,
		TakerFeeRate: eventOrder.TakerFeeRate,
	}

	utils.Debugf("%s NEW_ORDER  price: %s amount: %s %4s", event.MarketID, eventOrder.Price.StringFixed(5), eventOrder.Amount.StringFixed(5), eventOrder.Side)

	matchResult, hasMatch := 