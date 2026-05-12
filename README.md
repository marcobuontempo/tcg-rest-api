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

#### Open Pack

`POST: /packs/open`

#### Get All Cards Information

`GET: /cards`

#### Battle Cards

`POST: /battle/play`

`body: { "cards": [ "foo", "bar", "baz", "quux", "corge" ] }`

_Note: `"cards"` must contain the name of cards that the user actually owns_

#### Create Card Listing

`POST: /market`

`body: { "name": "foo", "quantity": 5, price: 100 }`

_Note: `"cards"` must contain the name of cards that the user actually owns_

### Admin Routes
