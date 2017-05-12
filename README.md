# Umzug MySQL Storage

Custom storage engine for [Umzug](https://github.com/sequelize/umzug) to store migrations history in MySQL.

[![Build Status](https://travis-ci.org/controlly/umzug-mysql-storage.svg?branch=master)](https://travis-ci.org/controlly/umzug-mysql-storage)

#### Why?

* Inception; it allows you to store the migration logs within the same MySQL database you are migrating;
* Umzug's default JSON storage engine produces a local JSON file that does not persist with ephemeral file-systems, such as Heroku;
* Makes team collaboration easier with devs that use the same db server.

## Installation

```
$ npm install umzug-mysql-storage
```

#### Requirements

* Node.js v.4+
* MySQL v.5+

## Quick start

Install `umzug-mysql-storage` and `umzug` v.2+, which is listed as a peer dependency.

```
$ npm install umzug-mysql-storage --save
$ npm install umzug --save
```

Setup storage engine with umzug.

```javascript
const path = require('path');
const Umzug = require('umzug');
const MySQLStorage = require('umzug-mysql-storage');

const umzug = new Umzug({
  storage: new MySQLStorage({
    database: 'foo',
    table: 'migration', // will be automatically created
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
  }),
  // ... specify additional umzug options - if any
});
```

## Storage properties

* `database` _(string)_ the name of the database to store migration logs into (required).
* `table` _(string)_ the name of the table to store migration logs into; defaults to "migration" (optional).
* `host` _(string)_ mysql server hostname (optional; defaults to "localhost").
* `port` _(integer)_ mysql server port (optional; defaults to 3306).
* `user` _(string)_ mysql server username (optional; defaults to "root").
* `password` _(string)_ mysql server password (optional; defaults to empty string).

## Contribute

Source code contributions are most welcome. The following rules apply:

1. Follow the [Airbnb Style Guide](https://github.com/airbnb/javascript);
2. Make sure not to break the tests.

## License

[MIT](LICENSE)
