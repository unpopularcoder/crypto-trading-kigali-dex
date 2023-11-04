
Hydro DEX's provide an Admin API: a RESTful interface for operating and configuring your DEX.

Hydro also provides a basic CLI to make configuring your DEX simple and easy. This document:

- Summarizes the [key details of the Admin API](https://github.com/HydroProtocol/hydro-scaffold-dex/blob/master/manual/admin-api-and-cli.md#admin-api)
- Provides a [guide for CLI functions](https://github.com/HydroProtocol/hydro-scaffold-dex/blob/master/manual/admin-api-and-cli.md#cli-guide-admin-cli)

*Note that because this API controls important fundamental elements of Hydro dex, it is important to secure this API against unwanted access.*

***

# Configuring Your Hydro Relayer

## Admin API

### Supported Content Types

The Admin API accepts `application/json` types on every endpoint

### Information routes

#### List all markets

```
GET /markets
```

##### Response

```json
{	
	"status": "success",
	"data": [
		{
			"id": "HOT-DAI",
			"baseTokenSymbol": "HOT",
			"BaseTokenName": "HOT",
			"baseTokenAddress": "0x4c4fa7e8ea4cfcfc93deae2c0cff142a1dd3a218",
			"baseTokenDecimals": 18,
			"quoteTokenSymbol": "DAI",
			"QuoteTokenName": "DAI",
			"quoteTokenAddress": "0xbc3524faa62d0763818636d5e400f112279d6cc0",
			"quoteTokenDecimals": 18,
			"minOrderSize": "0.001",
			"pricePrecision": 5,
			"priceDecimals": 5,
			"amountDecimals": 5,
			"makerFeeRate": "0.003",
			"takerFeeRate": "0.001",
			"gasUsedEstimation": 1,
			"isPublished": true
		}
	]
}
```

#### Create a market

```
POST /markets
```

##### Request body

```js
{
	"id": "HOT-WETH",                                                  // required
	"baseTokenAddress": "0x4c4fa7e8ea4cfcfc93deae2c0cff142a1dd3a218",  // required
	"quoteTokenAddress": "0xbc3524faa62d0763818636d5e400f112279d6cc0", // required
	"minOrderSize": "0.001",                                           // optional default 0.01
	"pricePrecision": 5,                                               // optional default 5
	"priceDecimals": 5,                                                // optional default 5
	"amountDecimals": 5,                                               // optional default 5
	"makerFeeRate": "0.003",                                           // optional default 0.003
	"takerFeeRate": "0.001",                                           // optional default 0.001
	"gasUsedEstimation": 1,                                            // optional default 190000
	"isPublished": true                                                // optional default false
}
```

##### Response on success

```json
{
	"status": "success"
}
```

##### Response on fail

```json
{
	"status": "fail",
	"error_message": "reason"
}
```

#### Approve market tokens

```
POST /markets/approve?marketID=HOT-WETH
```

##### Response on success

```json
{
	"status": "success"
}
```

##### Response on fail

```json
{
	"status": "fail",
	"error_message": "reason"
}
```

#### Update a market

```
PUT /markets
```

##### Request body

```json
{
	"id": "HOT-WETH",
	"minOrderSize": "0.001",
	"isPublished": true
}
```

##### Response on success

```json
{
	"status": "success"
}
```

##### Response on fail

```json
{
	"status": "fail",
	"error_message": "reason"
}
```

***

## CLI Guide (admin-cli)

If you are using docker-compose to run your hydro relayer, you can login into the admin service by entering: 

		docker-compose exec admin sh

This enters the Admin CLI. Once you are logged in, you can use the commands detailed below to configure your DEX. To exit the CLI, type `exit`

### Commands

#### Show help

```
hydro-dex-ctl help
```

#### Get dex status

```
hydro-dex-ctl status
```

#### Manage markets

```
hydro-dex-ctl market help
```

#### Get all markets
```
hydro-dex-ctl market list
```

#### Create a new market

When creating a new market, you can choose to either:

- use default options for the majority of the parameters
- specify all parameters

To use default options, you only need to specify the base and quote token addresses for your trading pair. You can always edit these parameters later.

```
// Default market creation: specify the token addresses for your trading pair
hydro-dex-ctl market new HOT-WWW \
  --baseTokenAddress=0x4c4fa7e8ea4cfcfc93deae2c0cff142a1dd3a218 \