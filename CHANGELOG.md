## 1.3.0 - 2017-06-07

* Added option to configure column name ([#1](https://github.com/controlly/umzug-mysql-storage/pull/1) by [@tezmaster](https://github.com/tezmaster)).
* Escape column name using sqlstring@2.2.0.

## 1.2.0 - 2017-05-12

* Add support for umzug v.2+.
* Update dev dependencies: jest-cli@20.0.1, babel-jest@20.0.1.

## 1.1.1 - 2017-05-11

* Optimization: do not try to create table every time if you already know it's been created.

## 1.1.0 - 2017-05-10

* Bugfix: use DELETE SQL statement with unlogMigration().
* Replace custom mysql-database module dependency with mysql + bluebird.
* Add umzug as peer dependency.
* Publish under MIT licence.
* Add support for node v.5+.
* Setup unit tests using Jest.
* Setup travis CI.

## 1.0.1 - 2017-05-05

* Run build script before publication; published compiled code to npm.
* Add .npmignore.

## 1.0.0 - 2017-05-04

* Copy source code from acm-api@eda388f65d35d07a5b7bf73a28fc1e970b059b0c.
