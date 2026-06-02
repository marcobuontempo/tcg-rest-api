# Trading Card Game: REST API

_A gamified REST API built with Node.js and SQLite, designed to run as a single lightweight instance with no external database dependencies._

## Contents

- [Quick Start](#quick-start)
- [Routes](#routes)
  - [Main Routes](#main-routes)
  - [Admin Routes](#admin-routes)
- [Rate Limiting](#rate-limiting)
- [Administrator Account](#administrator-account)
- [Game Details](#game-details)
  - [Card Types](#card-types)
  - [Card Rarities](#card-rarities)
  - [Packs](#packs)
- [Benchmarking](#benchmarking)

## Quick Start

### 1. Register

```http
POST /api/register
```

```json
Response:
{ "seed": "ABCDEFGH12345678" }
```

> ⚠️ Save your seed — it is your account key and cannot be retrieved later

### 2. Open a Pack (claim free daily)

```http
POST /api/packs/daily/open
x-user-seed: ABCDEFGH12345678
```

```json
Response:
[ { card1 }, { card2 }, { card3 }, { card4 }, { card5 }, { card6 }, { card7 }, { card8 }, { card9 }, { card10 } ]
```

### 3. Battle

```http
POST /api/battle
x-user-seed: ABCDEFGH12345678

Body:
{
    "cards": [ "card1_name", "card2_name", "card3_name", "card4_name", "card5_name" ],
    "difficulty": 1
}
```

```json
Response:
{
    "result": "win",
    "burned_card": null,
    "win_amount": 100,
    "xp_gain": 150,
    "current_balance": 100,
    "current_xp": 150,
    "battle_log": [ ... ]
}
```

## Routes

> All routes must be prefixed with `/api`

### Main Routes

| Method   | Route                    | Request Body                                              | Query                                                                           | Requires x-user-seed | Description                                                    |
| -------- | ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| `POST`   | `/register`              |                                                           |                                                                                 | ✗                    | Register a new account and receive a user seed                 |
| `GET`    | `/users/me`              |                                                           |                                                                                 | ✓                    | Get current user                                               |
| `GET`    | `/users/me/cards`        |                                                           |                                                                                 | ✓                    | Get user's owned cards                                         |
| `PATCH`  | `/users/me`              | `{ "username": "new_username" }`                          |                                                                                 | ✓                    | Update username                                                |
| `DELETE` | `/users/me`              |                                                           |                                                                                 | ✓                    | Delete current user                                            |
| `GET`    | `/packs`                 |                                                           |                                                                                 | ✗                    | Get information on all packs                                   |
| `POST`   | `/packs/daily/open`      |                                                           |                                                                                 | ✓                    | Claim daily pack (2x Basic, once per day, resets UTC midnight) |
| `POST`   | `/packs/:pack_name/open` |                                                           |                                                                                 | ✓                    | Open a specific pack type                                      |
| `GET`    | `/cards`                 |                                                           | `name, type, rarity, min_attack, max_attack, min_defence, max_defence, sort_by` | ✗                    | Get information on all cards                                   |
| `POST`   | `/battle`                | `{ "cards": [...], "difficulty": 1 }`                     |                                                                                 | ✓                    | Play a battle (requires 5 card names, and difficulty 1-10)     |
| `POST`   | `/market`                | `{ "name": "foo", "quantity": 5, "price_per_card": 100 }` |                                                                                 | ✓                    | Create a market listing                                        |
| `GET`    | `/market`                |                                                           | `name, type, rarity, min_price, max_price, sort_by`                             | ✗                    | Get all market listings (max 10)                               |
| `GET`    | `/market/me`             |                                                           |                                                                                 | ✓                    | Get user's own market listings                                 |
| `GET`    | `/market/:listing_id`    |                                                           |                                                                                 | ✗                    | Get a specific market listing                                  |
| `DELETE` | `/market/:listing_id`    |                                                           |                                                                                 | ✓                    | Delete a specific market listing                               |
| `POST`   | `/market/:listing_id`    | `{ "quantity": 5 }`                                       |                                                                                 | ✓                    | Buy a market listing                                           |

### Admin Routes

> All admin routes (except `/admin/login`) require `Authorization: Bearer <JWT>`

| Method   | Route                   | Body                                                                         | Description                                            |
| -------- | ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| `POST`   | `/admin/login`          | `{ "username": "admin", "password": "tcg_admin" }`                           | Login and receive a JWT (valid duration of 10 minutes) |
| `PATCH`  | `/admin/password`       | `{ "current_password": "tcg_admin", "new_password": "my_updated_password" }` | Update admin password                                  |
| `DELETE` | `/admin/users/:user_id` |                                                                              | Delete a user                                          |

## Rate Limiting

| Rule                  | Limit (per user)       |
| --------------------- | ---------------------- |
| Global                | 10 requests per minute |
| Burst                 | 1 request per second   |
| Registration          | 1 per minute           |
| Administrator Actions | 5 per minute           |

> Rate limiting is disabled in development environments by default

## Administrator Account

On first server start, a default admin account is created:

```
Username: admin
Password: tcg_password
```

Login via `POST: /api/admin/login` and change the password immediately using `PATCH: /api/admin/password`

## Game Details

> This game is a trading card system themed around computer science and software engineering concepts. All in-game terminology is derived from real-world technical ideas, reinterpreted into a stylised card battler.
>
> - **Card names** are based on metasyntactic variables commonly used in programming (e.g. foo, bar, baz).
> - **Card types** use terms that have both technical and real-world meanings.
> - **Rarities** are inspired by data storage size prefixes.
> - **Pack names** are related to increasing levels of computational complexity.

### Card Types

| Type    | Strong Against |
| ------- | -------------- |
| `bug`   | tree           |
| `tree`  | cloud          |
| `cloud` | shell          |
| `shell` | bug            |

### Card Rarities

`kilo` < `mega` < `giga` < `tera` < `peta` < `exa`

### Packs

| Pack          | Rarities              | Price |
| ------------- | --------------------- | ----- |
| `basic`       | kilo                  | 10    |
| `boosted`     | kilo, mega            | 50    |
| `turbo`       | kilo, mega, giga      | 210   |
| `quantum`     | kilo, giga, tera      | 520   |
| `singularity` | kilo, giga, tera, exa | 1000  |

## Benchmarking

Start the server in development mode:

```bash
npm run dev
```

Run a benchmark:

```bash
# any of the following
npm run benchmark:register
npm run benchmark:pack
npm run benchmark:market
npm run benchmark:battle
npm run benchmark:custom
```

**Results (full saturation using autocannon):**

- ~1,000–4,000 requests per second
- ~10% failure rate (SQLite busy errors under extreme load)

> Database locking is mostly caused by conflicting transactions with rollback. <br>
> Real-world failure rate should be ~0%, especially with rate limiting enabled, under expected user levels.
