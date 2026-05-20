# Trading Card Game: REST API

_Stateless design: Each request contains all necessary information to process it. No server-side session state is stored; all persistent data is in the database._

## Quick Start

1.  Request
    - `GET: /api/register`

    Response
    - `{ "seed": "ABCDEFGH12345678" }`

2.  Request
    - `POST: /packs/open`
    - `Headers: x-user-seed = "ABCDEFGH12345678"`

    Response
    - `{ "cards": [ { card1 }, { card2 }, { card3 }, { card4 }, { card5 } ] }`

3.  Request
    - `POST: /battle/play`
    - `Headers: x-user-seed = "ABCDEFGH12345678"`
    - `body: { "cards": [ card1_name, card2_name, card3_name, card4_name, card5_name ] }`

    Response
    - `{ "result": "win", "balance_gain": 100, "xp_gain": 100 }`

## Routes

Note: All routes must be prefixed with `/api`

### Non-Registered Routes

#### Register

`POST: /register`: returns a new account's user seed

### Registered Routes

Note: must include seed in request headers `x-user-seed`

#### Get User

`GET: /users/me`

#### Update Username

`PATCH: /users/me`

`body: { "username": "new_username" }`

#### Delete User

`DELETE: /users/me`

#### Get All Packs Information

`GET: /packs`

#### Claim Daily Pack

`POST: /packs/daily/open`

_Note: opens 2x 'basic' pack for free_
_Note: can be claimed once per day, UTC time_

#### Open Pack

`POST: /packs/:pack_name/open`

#### Get All Cards Information

`GET: /cards`

`params: name, type, rarity, min_attack, max_attack, min_defense, max_defense, sort_by`

#### Battle Cards

`POST: /battle`

`body: { "cards": [ "foo", "bar", "baz", "quux", "corge" ], "difficulty: 10 }`

_Note: `"cards"` must contain the name of cards that the user actually owns_
_Note: `"difficulty"` must be between 1-10_

#### Create Market Listing

`POST: /market`

`body: { "name": "foo", "quantity": 5, price_per_card: 100 }`

_Note: `"cards"` must contain the name of cards that the user actually owns_

#### Get Market Listing By Id

`GET: /market/:listing_id`

#### Get User Market Listings

`GET: /market/me`

#### Get All User Market Listings

`GET: /market/me`

#### Get All Market Listings

`GET: /market`

`query: name, type, rarity, min_price, max_price, sort_by`

_Note: only the first 10 matching results are returned_

#### Delete Market Listing

`DELETE: /market/:listing_id`

#### Buy Market Listing

`POST: /market/:listing_id`

`body: { "quantity": 5 }`

#### Auto Buy Card From Market

`POST: /market/auto-buy`

`body: { "name": "foo", "max_price": 100 }`

### Admin Routes

## Rate Limiting

- Global Requests: 60 per minute
- Burst: 3 per second
- Registration: 1 per 10 seconds
