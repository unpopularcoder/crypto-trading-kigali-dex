package main

import (
	"context"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/cli"
	"github.com/HydroProtocol/hydro-scaffold-dex/backend/connection"
	"github.com/HydroProtocol/hydro-sdk-backend/common"
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/HydroProtocol/hydro-sdk-backend/websocket"
	"os"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	os.Exit(run())
}

func run() int {
	ctx, stop := context.WithCancel(context.Background())

	redisClient := connection.NewRedisClient(os.G