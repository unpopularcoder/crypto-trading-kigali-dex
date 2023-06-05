
package models

import (
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/shopspring/decimal"
	"time"
)

type ITradeDao interface {
	FindTradesByMarket(marketID string, startTime time.Time, endTime time.Time) []*Trade
	FindAllTrades(marketID string) (int64, []*Trade)
	FindTradesByHash(hash string) []*Trade
	FindTradeByID(id int64) *Trade
	FindAccountMarketTrades(account, marketID, status string, limit, offset int) (int64, []*Trade)

	InsertTrade(trade *Trade) error
	UpdateTrade(trade *Trade) error
	Count() int
	FindTradeByTransactionID(transactionID int64) []*Trade
}

type Trade struct {
	ID              int64           `json:"id"               db:"id" primaryKey:"true" autoIncrement:"true" gorm:"primary_key"`
	TransactionID   int64           `json:"transactionID"    db:"transaction_id"`
	TransactionHash string          `json:"transactionHash"  db:"transaction_hash"`
	Status          string          `json:"status"           db:"status"`
	MarketID        string          `json:"marketID"         db:"market_id"`
	Maker           string          `json:"maker"            db:"maker"`
	Taker           string          `json:"taker"            db:"taker"`
	TakerSide       string          `json:"takerSide"        db:"taker_side"`
	MakerOrderID    string          `json:"makerOrderID"     db:"maker_order_id"`
	TakerOrderID    string          `json:"takerOrderID"     db:"taker_order_id"`