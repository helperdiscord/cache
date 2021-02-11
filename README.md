# @helperdiscord/cache

This is a caching library for discord based on the pg-native library.

```ts
const { Cache } = require('@helperdiscord/cache');
const { REST } = require('@klasa/rest'); // a rest client you can use 

const rest = new REST({ version: 8 });
rest.token = process.env.DISCORD_TOKEN;

const cache = new Cache(process.env.POSTGRES_URI, { cache: true, rest: rest });

const doge = cache.users.get('395782478192836608'); // will return a user object (from cache) or null

const forceDoge = await cache.users.fetch('395782478192836608'); // will return a user object or null

cache.users.del('395782478192836608'); // will remove the user with the id "395782478192836608" from the user cache

```


Note: You need libpq bindings for this to work