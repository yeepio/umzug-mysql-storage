/* eslint-env jest */

require('dotenv').config();
const MigrationStorage = require('./MigrationStorage');

describe('Umzug MySQL Storage', () => {
  describe('constructor()', () => {
    it('throws error when "props" is unspecified', () => {
      expect(() => new MigrationStorage())
        .toThrowError('Invalid "props" param; expected plain object, received undefined');
    });

    it('throws error when "storageOptions" property is invalid', () => {
      expect(() =>
        new MigrationStorage({
          storageOptions: 'abc'
        })
      ).toThrowError('Invalid "storageOptions" property; expected plain object, received string');

      expect(() =>
        new MigrationStorage({
          storageOptions: 123
        })
      ).toThrowError('Invalid "storageOptions" property; expected plain object, received number');

      expect(() =>
        new MigrationStorage({
          storageOptions: true
        })
      ).toThrowError('Invalid "storageOptions" property; expected plain object, received boolean');
    });

    it('throws error when "database" storage option is unspecified', () => {
      expect(() =>
        new MigrationStorage({
          storageOptions: {}
        })
      ).toThrowError('Invalid "database" storage option; expected string, received undefined');
    });

    it('does not require optional storage options', () => {
      expect(() =>
        new MigrationStorage({
          storageOptions: {
            database: process.env.MYSQL_DATABASE
          }
        })
      ).not.toThrow();
    });

    it('supports umzug v.2 options format', () => {
      expect(() =>
        new MigrationStorage({
          database: process.env.MYSQL_DATABASE
        })
      ).not.toThrow();
    });
  });

  const storage = new MigrationStorage({
    database: process.env.MYSQL_DATABASE,
    table: 'migration_log',
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

  describe('executed()', () => {
    it('returns empty array when migration table is empty', () => {
      expect(storage.executed()).resolves.toEqual([]);
    });
  });

  describe('logMigration()', () => {
    it('adds new migration to table', () =>
      storage.logMigration('test-1').then(() =>
        expect(storage.executed()).resolves.toEqual(['test-1'])
      )
    );

    it('can be called multiple times', () =>
      storage.logMigration('test-2').then(() =>
        expect(storage.executed()).resolves.toEqual(['test-1', 'test-2'])
      )
    );
  });

  describe('unlogMigration()', () => {
    it('removes migration from table', () =>
      storage.unlogMigration('test-1').then(() =>
        expect(storage.executed()).resolves.toEqual(['test-2'])
      )
    );

    it('can be called multiple times', () =>
      storage.unlogMigration('test-2').then(() =>
        expect(storage.executed()).resolves.toEqual([])
      )
    );
  });
});
