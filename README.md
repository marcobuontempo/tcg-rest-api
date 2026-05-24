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

_Note: ensure you save the seed as this is your account's key, and cannot be retrieved later_

### Registered Routes

Note: must include seed in request headers `x-user-seed`

#### Get User

`GET: /users/me`

#### Update Username

`PATCH: /users/me`

`body: { "username": "new_username" }`

_Note: to protect the user's private seed, it is not possible to set it as the username_

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

Note: all admin requests, except `/login`, require header `Authorization: Bearer <JWT>`

#### Login

`POST: /admin/login`

`body: { "username": "admin", "password": "tcg_admin" }`

_Note: returns a JWT that must be attached as `Authorization: Bearer <JWT>` to all subsequent admin requests. Default JWT lifetime is 10 minutes_

#### Update Password

`PATCH: /admin/password`

`body: { "current_password": "tcg_admin", "new_password": "my_updated_password" }`

#### Delete User

`DELETE: /admin/users/:user_id`

## Rate Limiting

- Global Requests: 10 per minute
- Burst: 1 per second
- Registration: 1 per minute
- Administrator Actions: 5 per minute
  _Note: by default, the rate limiter is disabled in development environments_

## Administrator Account

- On first server start (or when no admin exists), an automatic account is created:
  - username: admin
  - password: tcg_password
- Login using `/api/admin/login` and change the password immediately using `/api/admin/password`

## Benchmarking

- start server in development mode: `npm run dev`
- start benchmark test: `npm run benchmark:pack`, `npm run benchmark:market`, or `npm run benchmark:battle`
- Results (full saturation):
  - ~1000-4000 requests per second
  - ~10% fail rate (sqlite_busy errors)

_Note: real-world results should have close to 0% fail rate, especially with server-side rate limiting_

## Types

- Bug
- Tree
- Cloud
- Shell

- Uses circular type advantages: bug -> tree -> cloud -> shell -> bug -> ...

## Rarities

- Kilo
- Mega
- Giga
- Tera
- Peta
- Exa

## Packs

- basic: kilo [10]
- boosted: kilo, mega [50]
- turbo: kilo, mega, giga [210]
- quantum: kilo, giga, tera [520]
- singularity: kilo, giga, tera, exa [1000]

_Note: prices scale based on config min/max prices set_
