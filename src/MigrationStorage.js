import isString from 'lodash/isString';
import isInteger from 'lodash/isInteger';
import isPlainObject from 'lodash/isPlainObject';
import typeOf from 'typeof';
import mysql from 'mysql';
import Connection from 'mysql/lib/Connection';
import Promise from 'bluebird';

Promise.promisifyAll(Connection.prototype);

class MigrationStorage {

  /**
   * Creates a new MigrationStorage instance with the designated properties.
   * @param {Object} props umzug passed properties
   * @param {Object} props.storageOptions storage-specific options
   * @param {string} props.storageOptions.database the name of the database
   * @param {string} [props.storageOptions.host=localhost] optional hostname; defaults to "localhost"
   * @param {number} [props.storageOptions.port=3306] optional port number; defaults to 3306
   * @param {string} [props.storageOptions.user=root] optional user name to access the database; defaults to "root"
   * @param {string} [props.storageOptions.password] optional password to access the database; defaults to "" (i.e. empty string)
   * @param {string} [props.storageOptions.table=migration] optional table name to store migration log; defaults to "migration"
   * @param {string} [props.storageOptions.column=name] optional column name to store migration log; defaults to "name"
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(props) {
    if (!isPlainObject(props)) throw new TypeError(`Invalid "props" param; expected plain object, received ${typeOf(props)}`);

    // convert props from umzug v1- to v2+
    if (props.storageOptions) {
      const { storageOptions } = props;
      if (!isPlainObject(storageOptions)) throw new TypeError(`Invalid "storageOptions" property; expected plain object, received ${typeOf(storageOptions)}`);

      props = storageOptions; // overwrite props
    }

    const {
      database,
      host = 'localhost',
      port = 3306,
      user = 'root',
      password = '',
      table = 'migration',
      column = 'name'
    } = props;

    if (!isString(database)) throw new TypeError(`Invalid "database" storage option; expected string, received ${typeOf(database)}`);
    if (!isString(host)) throw new TypeError(`Invalid "host" storage option; expected string, received ${typeOf(host)}`);
    if (!isInteger(port)) throw new TypeError(`Invalid "port" storage option; expected integer, received ${typeOf(port)}`);
    if (!isString(user)) throw new TypeError(`Invalid "user" storage option; expected string, received ${typeOf(user)}`);
    if (!isString(password)) throw new TypeError(`Invalid "password" storage option; expected string, received ${typeOf(password)}`);
    if (!isString(table)) throw new TypeError(`Invalid "table" storage option; expected string, received ${typeOf(table)}`);
    if (!isString(column)) throw new TypeError(`Invalid "column" storage option; expected string, received ${typeOf(column)}`);

    this.connectionProperties = { host, port, user, password, database };
    this.tableName = table;
    this.columnName = column;
    this.tableExists = false;
  }

  /**
   * Executes the supplied query.
   * @see {@link https://github.com/mysqljs/mysql#performing-queries} for further info
   * @returns Promise
   * @private
   */
  query(sql, values) {
    const conn = mysql.createConnection(this.connectionProperties);

    return conn.connectAsync()
      .then(() => conn.queryAsync(sql, values))
      .finally(() => conn.end());
  }

  createMetaTableIfNotExists() {
    // do not try to create table every time if you already know it's been created
    if (this.tableExists) {
      return Promise.resolve(); // exit
    }

    const sql = `
      CREATE TABLE IF NOT EXISTS ?? (
        \`${this.columnName}\` varchar(100) NOT NULL,
        PRIMARY KEY (\`${this.columnName}\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;
    const params = [this.tableName];

    return this.query(sql, params)
      .then(() => {
        this.tableExists = true; // mark table as created - optimization
      });
  }

  logMigration(migrationName) {
    const sql = `INSERT INTO ?? SET ${this.columnName} = ?;`;
    const params = [this.tableName, migrationName];

    return this.createMetaTableIfNotExists()
      .then(() => this.query(sql, params));
  }

  unlogMigration(migrationName) {
    const sql = `DELETE FROM ?? WHERE ${this.columnName} = ? LIMIT 1;`;
    const params = [this.tableName, migrationName];

    return this.createMetaTableIfNotExists()
      .then(() => this.query(sql, params));
  }

  executed() {
    const sql = `SELECT ${this.columnName} FROM ?? ORDER BY ${this.columnName} ASC;`;
    const params = [this.tableName];

    return this.createMetaTableIfNotExists()
      .then(() => this.query(sql, params))
      .map((o) => o[this.columnName]);
  }
}

export default MigrationStorage;
