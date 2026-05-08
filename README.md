# Trading Card Game: REST API

Note: All routes must be prefixed with `/api`

## Non-Registered Routes

### Register

`POST: /register`: returns a new account's user seed

## Registered Routes

Note: must include seed in request headers `x-user-seed`

### Get User

`GET: /users/me`

### Update Username

`PUT: /users/me` `body: { "username": "new_username" }`

### Delete User

`DELETE: /users/me`

## Admin Routes
