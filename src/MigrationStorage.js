import isString from 'lodash/isString';
import typeOf from 'typeof';
import MySQLDatabase from 'mysql-database';

class MigrationStorage {
  constructor(options) {
    const { client, tableName } = options.storageOptions;

    if (!(client instanceof MySQLDatabase)) {
      throw new TypeError('Invalid "client" property; expected instance of MySQLDatabase');
    }

    if (!isString(tableName)) throw new TypeError(`Invalid "tableName" property; expected string, received ${typeOf(tableName)}`);

    this.client = client;
    this.tableName = tableName;
  }

  async createMetaTableIfNotExists() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ?? (
        \`name\` varchar(100) NOT NULL,
        PRIMARY KEY (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;
    const params = [this.tableName];

    return this.client.query(sql, params);
  }

  async logMigration(migrationName) {
    await this.createMetaTableIfNotExists();

    const sql = 'INSERT INTO ?? SET name = ?;';
    const params = [this.tableName, migrationName];
    return this.client.query(sql, params);
  }

  async unlogMigration(migrationName) {
    await this.createMetaTableIfNotExists();

    const sql = 'INSERT FROM ?? WHERE name = ? LIMIT 1;';
    const params = [this.tableName, migrationName];
    return this.client.query(sql, params);
  }

  async executed() {
    await this.createMetaTableIfNotExists();

    const sql = 'SELECT name FROM ?? ORDER BY name ASC;';
    const params = [this.tableName];
    const records = await this.client.query(sql, params);

    return records.map((o) => o.name);
  }
}

export default MigrationStorage;
