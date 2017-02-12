(function() {
  var Emitter, QuickQueryPostgresColumn, QuickQueryPostgresConnection, QuickQueryPostgresDatabase, QuickQueryPostgresSchema, QuickQueryPostgresTable, pg;

  pg = require('pg');

  Emitter = require('atom').Emitter;

  pg.types.setTypeParser(1082, function(x) {
    return x;
  });

  pg.types.setTypeParser(1183, function(x) {
    return x;
  });

  pg.types.setTypeParser(1114, function(x) {
    return x;
  });

  pg.types.setTypeParser(1184, function(x) {
    return x;
  });

  QuickQueryPostgresColumn = (function() {
    QuickQueryPostgresColumn.prototype.type = 'column';

    QuickQueryPostgresColumn.prototype.child_type = null;

    function QuickQueryPostgresColumn(table1, row) {
      var m;
      this.table = table1;
      this.connection = this.table.connection;
      this.name = row['column_name'];
      this.primary_key = row['constraint_type'] === 'PRIMARY KEY';
      if (row['character_maximum_length']) {
        this.datatype = row['data_type'] + " (" + row['character_maximum_length'] + ")";
      } else {
        this.datatype = row['data_type'];
      }
      this["default"] = row['column_default'];
      if (this["default"] === 'NULL' || this["default"] === ("NULL::" + row['data_type'])) {
        this["default"] = null;
      }
      if (this["default"] !== null) {
        m = this["default"].match(/'(.*?)'::/);
        if (m && m[1]) {
          this["default"] = m[1];
        }
      }
      this.nullable = row['is_nullable'] === 'YES';
      this.id = parseInt(row['ordinal_position']);
    }

    QuickQueryPostgresColumn.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresColumn.prototype.parent = function() {
      return this.table;
    };

    QuickQueryPostgresColumn.prototype.children = function(callback) {
      return callback([]);
    };

    return QuickQueryPostgresColumn;

  })();

  QuickQueryPostgresTable = (function() {
    QuickQueryPostgresTable.prototype.type = 'table';

    QuickQueryPostgresTable.prototype.child_type = 'column';

    function QuickQueryPostgresTable(schema1, row, fields) {
      this.schema = schema1;
      this.connection = this.schema.connection;
      this.name = row["table_name"];
    }

    QuickQueryPostgresTable.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresTable.prototype.parent = function() {
      return this.schema;
    };

    QuickQueryPostgresTable.prototype.children = function(callback) {
      return this.connection.getColumns(this, callback);
    };

    return QuickQueryPostgresTable;

  })();

  QuickQueryPostgresSchema = (function() {
    QuickQueryPostgresSchema.prototype.type = 'schema';

    QuickQueryPostgresSchema.prototype.child_type = 'table';

    function QuickQueryPostgresSchema(database1, row, fields) {
      this.database = database1;
      this.connection = this.database.connection;
      this.name = row["schema_name"];
    }

    QuickQueryPostgresSchema.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresSchema.prototype.parent = function() {
      return this.database;
    };

    QuickQueryPostgresSchema.prototype.children = function(callback) {
      return this.connection.getTables(this, callback);
    };

    return QuickQueryPostgresSchema;

  })();

  QuickQueryPostgresDatabase = (function() {
    QuickQueryPostgresDatabase.prototype.type = 'database';

    QuickQueryPostgresDatabase.prototype.child_type = 'schema';

    function QuickQueryPostgresDatabase(connection2, row) {
      this.connection = connection2;
      this.name = row["datname"];
    }

    QuickQueryPostgresDatabase.prototype.toString = function() {
      return this.name;
    };

    QuickQueryPostgresDatabase.prototype.parent = function() {
      return this.connection;
    };

    QuickQueryPostgresDatabase.prototype.children = function(callback) {
      return this.connection.getSchemas(this, callback);
    };

    return QuickQueryPostgresDatabase;

  })();

  module.exports = QuickQueryPostgresConnection = (function() {
    QuickQueryPostgresConnection.prototype.fatal = false;

    QuickQueryPostgresConnection.prototype.connection = null;

    QuickQueryPostgresConnection.prototype.protocol = 'postgres';

    QuickQueryPostgresConnection.prototype.type = 'connection';

    QuickQueryPostgresConnection.prototype.child_type = 'database';

    QuickQueryPostgresConnection.prototype.timeout = 5000;

    QuickQueryPostgresConnection.prototype.n_types = 'bigint bigserial bit boolean box bytea circle integer interval json line lseg money numeric path point polygon real smallint smallserial timestamp tsquery tsvector uuid xml'.split(/\s+/).concat(['bit varying']);

    QuickQueryPostgresConnection.prototype.s_types = ['character', 'character varying', 'date', 'inet', 'cidr', 'time', 'macaddr', 'text'];

    QuickQueryPostgresConnection.prototype.allowEdition = true;

    QuickQueryPostgresConnection.defaultPort = 5432;

    function QuickQueryPostgresConnection(info1) {
      var base;
      this.info = info1;
      this.emitter = new Emitter();
      if ((base = this.info).database == null) {
        base.database = 'postgres';
      }
      this.connections = {};
    }

    QuickQueryPostgresConnection.prototype.connect = function(callback) {
      this.defaultConnection = new pg.Client(this.info);
      return this.defaultConnection.connect((function(_this) {
        return function(err) {
          _this.connections[_this.info.database] = _this.defaultConnection;
          _this.defaultConnection.on('error', function(err) {
            console.log(err);
            _this.connections[_this.info.database] = null;
            return _this.fatal = true;
          });
          return callback(err);
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.serialize = function() {
      var c;
      c = this.defaultConnection;
      return {
        host: c.host,
        port: c.port,
        ssl: c.ssl,
        protocol: this.protocol,
        database: c.database,
        user: c.user,
        password: c.password
      };
    };

    QuickQueryPostgresConnection.prototype.getDatabaseConnection = function(database, callback) {
      var newConnection;
      if (this.connections[database]) {
        if (callback) {
          return callback(this.connections[database]);
        }
      } else {
        this.info.database = database;
        newConnection = new pg.Client(this.info);
        return newConnection.connect((function(_this) {
          return function(err) {
            if (err) {
              return console.log(err);
            } else {
              newConnection.on('error', function(err) {
                console.log(err);
                _this.connections[database] = null;
                if (newConnection === _this.defaultConnection) {
                  return _this.fatal = true;
                }
              });
              _this.connections[database] = newConnection;
              if (callback) {
                return callback(newConnection);
              }
            }
          };
        })(this));
      }
    };

    QuickQueryPostgresConnection.prototype.setDefaultDatabase = function(database) {
      return this.getDatabaseConnection(database, (function(_this) {
        return function(connection) {
          _this.defaultConnection = connection;
          return _this.emitter.emit('did-change-default-database', connection.database);
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getDefaultDatabase = function() {
      return this.defaultConnection.database;
    };

    QuickQueryPostgresConnection.prototype.dispose = function() {
      return this.close();
    };

    QuickQueryPostgresConnection.prototype.close = function() {
      var connection, database, ref, results;
      ref = this.connections;
      results = [];
      for (database in ref) {
        connection = ref[database];
        results.push(connection.end());
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype.queryDatabaseConnection = function(text, connection, callback, recursive) {
      if (recursive == null) {
        recursive = false;
      }
      return connection.query({
        text: text,
        rowMode: 'array'
      }, (function(_this) {
        return function(err, result) {
          var database, field, i, l, len, ref;
          if (err) {
            if (err.code === '0A000' && err.message.indexOf('cross-database') !== -1 && !recursive) {
              database = err.message.match(/"(.*?)"/)[1].split('.')[0];
              return _this.getDatabaseConnection(database, function(connection1) {
                return _this.queryDatabaseConnection(text, connection1, callback, true);
              });
            } else {
              return callback({
                type: 'error',
                content: err.message
              });
            }
          } else if (result.command !== 'SELECT') {
            if (isNaN(result.rowCount)) {
              return callback({
                type: 'success',
                content: "Success"
              });
            } else {
              return callback({
                type: 'success',
                content: result.rowCount + " row(s) affected"
              });
            }
          } else {
            ref = result.fields;
            for (i = l = 0, len = ref.length; l < len; i = ++l) {
              field = ref[i];
              field.db = connection.database;
            }
            return callback(null, result.rows, result.fields);
          }
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.query = function(text, callback) {
      if (this.fatal) {
        return this.getDatabaseConnection(this.defaultConnection.database, (function(_this) {
          return function(connection) {
            _this.defaultConnection = connection;
            _this.fatal = false;
            return _this.queryDatabaseConnection(text, _this.defaultConnection, callback);
          };
        })(this));
      } else {
        return this.queryDatabaseConnection(text, this.defaultConnection, callback);
      }
    };

    QuickQueryPostgresConnection.prototype.objRowsMap = function(rows, fields, callback) {
      return rows.map((function(_this) {
        return function(r, i) {
          var field, j, l, len, row;
          row = {};
          for (j = l = 0, len = fields.length; l < len; j = ++l) {
            field = fields[j];
            row[field.name] = r[j];
          }
          if (callback != null) {
            return callback(row);
          } else {
            return row;
          }
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.parent = function() {
      return this;
    };

    QuickQueryPostgresConnection.prototype.children = function(callback) {
      return this.getDatabases(function(databases, err) {
        if (err == null) {
          return callback(databases);
        } else {
          return console.log(err);
        }
      });
    };

    QuickQueryPostgresConnection.prototype.getDatabases = function(callback) {
      var text;
      text = "SELECT datname FROM pg_database " + "WHERE datistemplate = false";
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var databases;
          if (!err) {
            databases = _this.objRowsMap(rows, fields, function(row) {
              return new QuickQueryPostgresDatabase(_this, row);
            });
            databases = databases.filter(function(database) {
              return !_this.hiddenDatabase(database.name);
            });
          }
          return callback(databases, err);
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getSchemas = function(database, callback) {
      return this.getDatabaseConnection(database.name, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT schema_name FROM information_schema.schemata " + ("WHERE catalog_name = '" + database.name + "' ") + "AND schema_name NOT IN ('pg_toast','pg_temp_1','pg_toast_temp_1','pg_catalog','information_schema')";
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var schemas;
            if (!err) {
              schemas = _this.objRowsMap(rows, fields, function(row) {
                return new QuickQueryPostgresSchema(database, row);
              });
              return callback(schemas);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getTables = function(schema, callback) {
      return this.getDatabaseConnection(schema.database.name, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT table_name " + "FROM information_schema.tables " + ("WHERE table_catalog = '" + schema.database.name + "' ") + ("AND table_schema = '" + schema.name + "'");
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var tables;
            if (!err) {
              tables = _this.objRowsMap(rows, fields, function(row) {
                return new QuickQueryPostgresTable(schema, row);
              });
              return callback(tables);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.getColumns = function(table, callback) {
      return this.getDatabaseConnection(table.schema.database.name, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT  pk.constraint_type ,c.*" + " FROM information_schema.columns c" + " LEFT OUTER JOIN (" + "  SELECT" + "   tc.constraint_type," + "   kc.column_name," + "   tc.table_catalog," + "   tc.table_name," + "   tc.table_schema" + "  FROM information_schema.table_constraints tc" + "  INNER JOIN information_schema.CONSTRAINT_COLUMN_USAGE kc" + "  ON kc.constraint_name = tc.constraint_name" + "  AND kc.table_catalog = tc.table_catalog" + "  AND kc.table_name = tc.table_name" + "  AND kc.table_schema = tc.table_schema" + "  WHERE tc.constraint_type = 'PRIMARY KEY'" + " ) pk ON pk.column_name = c.column_name" + "  AND pk.table_catalog = c.table_catalog" + "  AND pk.table_name = c.table_name" + "  AND pk.table_schema = c.table_schema" + (" WHERE c.table_name = '" + table.name + "' ") + (" AND c.table_schema = '" + table.schema.name + "' ") + (" AND c.table_catalog = '" + table.schema.database.name + "'");
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var columns;
            if (!err) {
              columns = _this.objRowsMap(rows, fields, function(row) {
                return new QuickQueryPostgresColumn(table, row);
              });
              return callback(columns);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype.hiddenDatabase = function(database) {
      return database === "postgres";
    };

    QuickQueryPostgresConnection.prototype.simpleSelect = function(table, columns) {
      var database_name, schema_name, table_name;
      if (columns == null) {
        columns = '*';
      }
      if (columns !== '*') {
        columns = columns.map((function(_this) {
          return function(col) {
            return _this.defaultConnection.escapeIdentifier(col.name);
          };
        })(this));
        columns = "\n " + columns.join(",\n ") + "\n";
      }
      table_name = this.defaultConnection.escapeIdentifier(table.name);
      schema_name = this.defaultConnection.escapeIdentifier(table.schema.name);
      database_name = this.defaultConnection.escapeIdentifier(table.schema.database.name);
      return "SELECT " + columns + " FROM " + database_name + "." + schema_name + "." + table_name + " LIMIT 1000";
    };

    QuickQueryPostgresConnection.prototype.createDatabase = function(model, info) {
      var database;
      database = this.defaultConnection.escapeIdentifier(info.name);
      return "CREATE DATABASE " + database + ";";
    };

    QuickQueryPostgresConnection.prototype.createSchema = function(model, info) {
      var schema;
      schema = this.defaultConnection.escapeIdentifier(info.name);
      this.setDefaultDatabase(model.name);
      return "CREATE SCHEMA " + schema + ";";
    };

    QuickQueryPostgresConnection.prototype.createTable = function(model, info) {
      var database, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.name);
      table = this.defaultConnection.escapeIdentifier(info.name);
      return ("CREATE TABLE " + database + "." + schema + "." + table + " ( \n") + " \"id\" INT NOT NULL ,\n" + (" CONSTRAINT \"" + info.name + "_pk\" PRIMARY KEY (\"id\") );");
    };

    QuickQueryPostgresConnection.prototype.createColumn = function(model, info) {
      var column, dafaultValue, database, nullable, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.name);
      column = this.defaultConnection.escapeIdentifier(info.name);
      nullable = info.nullable ? 'NULL' : 'NOT NULL';
      dafaultValue = info["default"] === null ? 'NULL' : this.escape(info["default"], info.datatype);
      return ("ALTER TABLE " + database + "." + schema + "." + table + " ADD COLUMN " + column) + (" " + info.datatype + " " + nullable + " DEFAULT " + dafaultValue + ";");
    };

    QuickQueryPostgresConnection.prototype.alterTable = function(model, delta) {
      var database, newName, oldName, query, schema;
      database = this.defaultConnection.escapeIdentifier(model.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.schema.name);
      newName = this.defaultConnection.escapeIdentifier(delta.new_name);
      oldName = this.defaultConnection.escapeIdentifier(delta.old_name);
      return query = "ALTER TABLE " + database + "." + schema + "." + oldName + " RENAME TO " + newName + ";";
    };

    QuickQueryPostgresConnection.prototype.alterColumn = function(model, delta) {
      var database, defaultValue, newName, nullable, oldName, result, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.table.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.table.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.table.name);
      newName = this.defaultConnection.escapeIdentifier(delta.new_name);
      oldName = this.defaultConnection.escapeIdentifier(delta.old_name);
      nullable = delta.nullable ? 'DROP NOT NULL' : 'SET NOT NULL';
      defaultValue = delta["default"] === null ? 'NULL' : this.escape(delta["default"], delta.datatype);
      result = ("ALTER TABLE " + database + "." + schema + "." + table) + ("\nALTER COLUMN " + oldName + " SET DATA TYPE " + delta.datatype + ",") + ("\nALTER COLUMN " + oldName + " " + nullable + ",") + ("\nALTER COLUMN " + oldName + " SET DEFAULT " + defaultValue);
      if (oldName !== newName) {
        result += ("\nALTER TABLE " + database + "." + schema + "." + table) + (" RENAME COLUMN " + oldName + " TO " + newName + ";");
      }
      return result;
    };

    QuickQueryPostgresConnection.prototype.dropDatabase = function(model) {
      var database;
      database = this.defaultConnection.escapeIdentifier(model.name);
      return "DROP DATABASE " + database + ";";
    };

    QuickQueryPostgresConnection.prototype.dropSchema = function(model) {
      var schema;
      schema = this.defaultConnection.escapeIdentifier(model.name);
      this.setDefaultDatabase(model.database.name);
      return "DROP SCHEMA " + schema + ";";
    };

    QuickQueryPostgresConnection.prototype.dropTable = function(model) {
      var database, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.name);
      return "DROP TABLE " + database + "." + schema + "." + table + ";";
    };

    QuickQueryPostgresConnection.prototype.dropColumn = function(model) {
      var column, database, schema, table;
      database = this.defaultConnection.escapeIdentifier(model.table.schema.database.name);
      schema = this.defaultConnection.escapeIdentifier(model.table.schema.name);
      table = this.defaultConnection.escapeIdentifier(model.table.name);
      column = this.defaultConnection.escapeIdentifier(model.name);
      return "ALTER TABLE " + database + "." + schema + "." + table + " DROP COLUMN " + column + ";";
    };

    QuickQueryPostgresConnection.prototype.updateRecord = function(row, fields, values) {
      var oid, results, t, tables;
      tables = this._tableGroup(fields);
      results = [];
      for (oid in tables) {
        t = tables[oid];
        results.push(this.getTableByOID(t.database, t.oid, (function(_this) {
          return function(table) {
            return table.children(function(columns) {
              var allkeys, assings, database, i, k, key, keys, l, len, schema, update, where;
              keys = (function() {
                var l, len, results1;
                results1 = [];
                for (i = l = 0, len = columns.length; l < len; i = ++l) {
                  key = columns[i];
                  if (key.primary_key) {
                    results1.push({
                      ix: i,
                      key: key
                    });
                  }
                }
                return results1;
              })();
              allkeys = true;
              for (l = 0, len = keys.length; l < len; l++) {
                k = keys[l];
                allkeys &= row[k.ix] != null;
              }
              if (allkeys && keys.length > 0) {
                _this._matchColumns(t.fields, columns);
                assings = t.fields.filter(function(field) {
                  return field.column != null;
                }).map(function(field) {
                  return (_this.defaultConnection.escapeIdentifier(field.column.name)) + " = " + (_this.escape(values[field.name], field.column.datatype));
                });
                database = _this.defaultConnection.escapeIdentifier(table.schema.database.name);
                schema = _this.defaultConnection.escapeIdentifier(table.schema.name);
                table = _this.defaultConnection.escapeIdentifier(table.name);
                where = keys.map(function(k) {
                  return (_this.defaultConnection.escapeIdentifier(k.key.name)) + " = " + (_this.escape(row[k.ix], k.key.datatype));
                });
                update = ("UPDATE " + database + "." + schema + "." + table) + (" SET " + (assings.join(','))) + " WHERE " + where.join(' AND ') + ";";
                return _this.emitter.emit('sentence-ready', update);
              }
            });
          };
        })(this)));
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype.insertRecord = function(fields, values) {
      var oid, results, t, tables;
      tables = this._tableGroup(fields);
      results = [];
      for (oid in tables) {
        t = tables[oid];
        results.push(this.getTableByOID(t.database, t.oid, (function(_this) {
          return function(table) {
            return table.children(function(columns) {
              var aryfields, aryvalues, database, insert, schema, strfields, strvalues;
              _this._matchColumns(t.fields, columns);
              aryfields = t.fields.filter(function(field) {
                return field.column != null;
              }).map(function(field) {
                return _this.defaultConnection.escapeIdentifier(field.column.name);
              });
              strfields = aryfields.join(',');
              aryvalues = t.fields.filter(function(field) {
                return field.column != null;
              }).map(function(field) {
                return _this.escape(values[field.column.name], field.column.datatype);
              });
              strvalues = aryvalues.join(',');
              database = _this.defaultConnection.escapeIdentifier(table.schema.database.name);
              schema = _this.defaultConnection.escapeIdentifier(table.schema.name);
              table = _this.defaultConnection.escapeIdentifier(table.name);
              insert = ("INSERT INTO " + database + "." + schema + "." + table) + (" (" + strfields + ") VALUES (" + strvalues + ");");
              return _this.emitter.emit('sentence-ready', insert);
            });
          };
        })(this)));
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype.deleteRecord = function(row, fields) {
      var oid, results, t, tables;
      tables = this._tableGroup(fields);
      results = [];
      for (oid in tables) {
        t = tables[oid];
        results.push(this.getTableByOID(t.database, t.oid, (function(_this) {
          return function(table) {
            return table.children(function(columns) {
              var allkeys, database, del, i, k, key, keys, l, len, schema, where;
              keys = (function() {
                var l, len, results1;
                results1 = [];
                for (i = l = 0, len = columns.length; l < len; i = ++l) {
                  key = columns[i];
                  if (key.primary_key) {
                    results1.push({
                      ix: i,
                      key: key
                    });
                  }
                }
                return results1;
              })();
              allkeys = true;
              for (l = 0, len = keys.length; l < len; l++) {
                k = keys[l];
                allkeys &= row[k.ix] != null;
              }
              if (allkeys && keys.length > 0) {
                database = _this.defaultConnection.escapeIdentifier(table.schema.database.name);
                schema = _this.defaultConnection.escapeIdentifier(table.schema.name);
                table = _this.defaultConnection.escapeIdentifier(table.name);
                where = keys.map(function(k) {
                  return (_this.defaultConnection.escapeIdentifier(k.key.name)) + " = " + (_this.escape(row[k.ix], k.key.datatype));
                });
                del = ("DELETE FROM " + database + "." + schema + "." + table) + " WHERE " + where.join(' AND ') + ";";
                return _this.emitter.emit('sentence-ready', del);
              }
            });
          };
        })(this)));
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype.getTableByOID = function(database, oid, callback) {
      return this.getDatabaseConnection(database, (function(_this) {
        return function(connection) {
          var text;
          text = "SELECT s.nspname AS schema_name," + " t.relname AS table_name" + " FROM pg_class t" + " INNER JOIN pg_namespace s ON t.relnamespace = s.oid" + (" WHERE t.oid = " + oid);
          return _this.queryDatabaseConnection(text, connection, function(err, rows, fields) {
            var db, row, schema, table;
            db = {
              name: database,
              connection: _this
            };
            if (!err && rows.length === 1) {
              row = _this.objRowsMap(rows, fields)[0];
              schema = new QuickQueryPostgresSchema(db, row, fields);
              table = new QuickQueryPostgresTable(schema, row);
              return callback(table);
            }
          });
        };
      })(this));
    };

    QuickQueryPostgresConnection.prototype._matchColumns = function(fields, columns) {
      var column, field, l, len, results;
      results = [];
      for (l = 0, len = fields.length; l < len; l++) {
        field = fields[l];
        results.push((function() {
          var len1, n, results1;
          results1 = [];
          for (n = 0, len1 = columns.length; n < len1; n++) {
            column = columns[n];
            if (column.id === field.columnID) {
              results1.push(field.column = column);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    };

    QuickQueryPostgresConnection.prototype._tableGroup = function(fields) {
      var field, l, len, oid, tables;
      tables = {};
      for (l = 0, len = fields.length; l < len; l++) {
        field = fields[l];
        if (field.tableID != null) {
          oid = field.tableID.toString();
          if (tables[oid] == null) {
            tables[oid] = {
              oid: field.tableID,
              database: field.db,
              fields: []
            };
          }
          tables[oid].fields.push(field);
        }
      }
      return tables;
    };

    QuickQueryPostgresConnection.prototype.sentenceReady = function(callback) {
      return this.emitter.on('sentence-ready', callback);
    };

    QuickQueryPostgresConnection.prototype.onDidChangeDefaultDatabase = function(callback) {
      return this.emitter.on('did-change-default-database', callback);
    };

    QuickQueryPostgresConnection.prototype.getDataTypes = function() {
      return this.n_types.concat(this.s_types);
    };

    QuickQueryPostgresConnection.prototype.toString = function() {
      return this.protocol + "://" + this.defaultConnection.user + "@" + this.defaultConnection.host;
    };

    QuickQueryPostgresConnection.prototype.escape = function(value, type) {
      var l, len, ref, t1;
      if (value === null) {
        return 'NULL';
      }
      ref = this.s_types;
      for (l = 0, len = ref.length; l < len; l++) {
        t1 = ref[l];
        if (type.search(new RegExp(t1, "i")) !== -1) {
          return this.defaultConnection.escapeLiteral(value);
        }
      }
      return value.toString();
    };

    return QuickQueryPostgresConnection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LXBvc3RncmVzLWNvbm5lY3Rpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUosVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFHWixFQUFFLENBQUMsS0FBSyxDQUFDLGFBQVQsQ0FBd0IsSUFBeEIsRUFBK0IsU0FBQyxDQUFEO1dBQU87RUFBUCxDQUEvQjs7RUFDQSxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQVQsQ0FBd0IsSUFBeEIsRUFBK0IsU0FBQyxDQUFEO1dBQU87RUFBUCxDQUEvQjs7RUFDQSxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQVQsQ0FBd0IsSUFBeEIsRUFBK0IsU0FBQyxDQUFEO1dBQU87RUFBUCxDQUEvQjs7RUFDQSxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQVQsQ0FBd0IsSUFBeEIsRUFBK0IsU0FBQyxDQUFEO1dBQU87RUFBUCxDQUEvQjs7RUFFTTt1Q0FDSixJQUFBLEdBQU07O3VDQUNOLFVBQUEsR0FBWTs7SUFDQyxrQ0FBQyxNQUFELEVBQVEsR0FBUjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsUUFBRDtNQUNaLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQztNQUNyQixJQUFDLENBQUEsSUFBRCxHQUFRLEdBQUksQ0FBQSxhQUFBO01BQ1osSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFJLENBQUEsaUJBQUEsQ0FBSixLQUEwQjtNQUN6QyxJQUFHLEdBQUksQ0FBQSwwQkFBQSxDQUFQO1FBQ0UsSUFBQyxDQUFBLFFBQUQsR0FBZSxHQUFJLENBQUEsV0FBQSxDQUFMLEdBQWtCLElBQWxCLEdBQXNCLEdBQUksQ0FBQSwwQkFBQSxDQUExQixHQUFzRCxJ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QU5GOztBQURGO2FBUUE7SUFWVzs7MkNBWWIsYUFBQSxHQUFlLFNBQUMsUUFBRDthQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGdCQUFaLEVBQThCLFFBQTlCO0lBRGE7OzJDQUdmLDBCQUFBLEdBQTRCLFNBQUMsUUFBRDthQUMxQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSw2QkFBWixFQUEyQyxRQUEzQztJQUQwQjs7MkNBRzVCLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxPQUFqQjtJQURZOzsyQ0FHZCxRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxRQUFELEdBQVUsS0FBVixHQUFnQixJQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkMsR0FBd0MsR0FBeEMsR0FBNEMsSUFBQyxDQUFBLGlCQUFpQixDQUFDO0lBRHZEOzsyQ0FHVixNQUFBLEdBQVEsU0FBQyxLQUFELEVBQU8sSUFBUDtBQUNOLFVBQUE7TUFBQSxJQUFHLEtBQUEsS0FBUyxJQUFaO0FBQ0UsZUFBTyxPQURUOztBQUVBO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFHLElBQUksQ0FBQyxNQUFMLENBQWdCLElBQUEsTUFBQSxDQUFPLEVBQVAsRUFBVyxHQUFYLENBQWhCLENBQUEsS0FBb0MsQ0FBQyxDQUF4QztBQUNFLGlCQUFPLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxhQUFuQixDQUFpQyxLQUFqQyxFQURUOztBQURGO2FBR0EsS0FBSyxDQUFDLFFBQU4sQ0FBQTtJQU5NOzs7OztBQTdiViIsInNvdXJjZXNDb250ZW50IjpbInBnID0gcmVxdWlyZSAncGcnXG5cbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbiMgZG9uJ3QgcGFyc2UgZGF0ZXMgYW5kIHRpbWVzLlxucGcudHlwZXMuc2V0VHlwZVBhcnNlciAgMTA4MiAsICh4KSAtPiB4XG5wZy50eXBlcy5zZXRUeXBlUGFyc2VyICAxMTgzICwgKHgpIC0+IHhcbnBnLnR5cGVzLnNldFR5cGVQYXJzZXIgIDExMTQgLCAoeCkgLT4geFxucGcudHlwZXMuc2V0VHlwZVBhcnNlciAgMTE4NCAsICh4KSAtPiB4XG5cbmNsYXNzIFF1aWNrUXVlcnlQb3N0Z3Jlc0NvbHVtblxuICB0eXBlOiAnY29sdW1uJ1xuICBjaGlsZF90eXBlOiBudWxsXG4gIGNvbnN0cnVjdG9yOiAoQHRhYmxlLHJvdykgLT5cbiAgICBAY29ubmVjdGlvbiA9IEB0YWJsZS5jb25uZWN0aW9uXG4gICAgQG5hbWUgPSByb3dbJ2NvbHVtbl9uYW1lJ11cbiAgICBAcHJpbWFyeV9rZXkgPSByb3dbJ2NvbnN0cmFpbnRfdHlwZSddID09ICdQUklNQVJZIEtFWSdcbiAgICBpZiByb3dbJ2NoYXJhY3Rlcl9tYXhpbXVtX2xlbmd0aCddXG4gICAgICBAZGF0YXR5cGUgPSBcIiN7cm93WydkYXRhX3R5cGUnXX0gKCN7cm93WydjaGFyYWN0ZXJfbWF4aW11bV9sZW5ndGgnXX0pXCJcbiAgICBlbHNlXG4gICAgICBAZGF0YXR5cGUgPSByb3dbJ2RhdGFfdHlwZSddXG4gICAgQGRlZmF1bHQgPSByb3dbJ2NvbHVtbl9kZWZhdWx0J11cbiAgICBpZiBAZGVmYXVsdCA9PSAnTlVMTCcgfHwgQGRlZmF1bHQgPT0gXCJOVUxMOjoje3Jvd1snZGF0YV90eXBlJ119XCJcbiAgICAgIEBkZWZhdWx0ID0gbnVsbFxuICAgIGlmIEBkZWZhdWx0ICE9IG51bGxcbiAgICAgIG0gPSAgQGRlZmF1bHQubWF0Y2goLycoLio/KSc6Oi8pXG4gICAgICBpZiBtICYmIG1bMV0gdGhlbiBAZGVmYXVsdCA9IG1bMV1cbiAgICBAbnVsbGFibGUgPSByb3dbJ2lzX251bGxhYmxlJ10gPT0gJ1lFUydcbiAgICBAaWQgPSBwYXJzZUludChyb3dbJ29yZGluYWxfcG9zaXRpb24nXSlcbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEB0YWJsZVxuICBjaGlsZHJlbjogKGNhbGxiYWNrKS0+XG4gICAgY2FsbGJhY2soW10pXG5cbmNsYXNzIFF1aWNrUXVlcnlQb3N0Z3Jlc1RhYmxlXG4gIHR5cGU6ICd0YWJsZSdcbiAgY2hpbGRfdHlwZTogJ2NvbHVtbidcbiAgY29uc3RydWN0b3I6IChAc2NoZW1hLHJvdyxmaWVsZHMpIC0+XG4gICAgQGNvbm5lY3Rpb24gPSBAc2NoZW1hLmNvbm5lY3Rpb25cbiAgICBAbmFtZSA9IHJvd1tcInRhYmxlX25hbWVcIl1cbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBzY2hlbWFcbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIEBjb25uZWN0aW9uLmdldENvbHVtbnMoQCxjYWxsYmFjaylcblxuY2xhc3MgUXVpY2tRdWVyeVBvc3RncmVzU2NoZW1hXG4gIHR5cGU6ICdzY2hlbWEnXG4gIGNoaWxkX3R5cGU6ICd0YWJsZSdcbiAgY29uc3RydWN0b3I6IChAZGF0YWJhc2Uscm93LGZpZWxkcykgLT5cbiAgICBAY29ubmVjdGlvbiA9IEBkYXRhYmFzZS5jb25uZWN0aW9uXG4gICAgQG5hbWUgPSByb3dbXCJzY2hlbWFfbmFtZVwiXVxuICB0b1N0cmluZzogLT5cbiAgICBAbmFtZVxuICBwYXJlbnQ6IC0+XG4gICAgQGRhdGFiYXNlXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBAY29ubmVjdGlvbi5nZXRUYWJsZXMoQCxjYWxsYmFjaylcblxuY2xhc3MgUXVpY2tRdWVyeVBvc3RncmVzRGF0YWJhc2VcbiAgdHlwZTogJ2RhdGFiYXNlJ1xuICBjaGlsZF90eXBlOiAnc2NoZW1hJ1xuICBjb25zdHJ1Y3RvcjogKEBjb25uZWN0aW9uLHJvdykgLT5cbiAgICBAbmFtZSA9IHJvd1tcImRhdG5hbWVcIl1cbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBjb25uZWN0aW9uXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBAY29ubmVjdGlvbi5nZXRTY2hlbWFzKEAsY2FsbGJhY2spXG4gICAgI0Bjb25uZWN0aW9uLmdldFRhYmxlcyhALGNhbGxiYWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBRdWlja1F1ZXJ5UG9zdGdyZXNDb25uZWN0aW9uXG5cbiAgZmF0YWw6IGZhbHNlXG4gIGNvbm5lY3Rpb246IG51bGxcbiAgcHJvdG9jb2w6ICdwb3N0Z3JlcydcbiAgdHlwZTogJ2Nvbm5lY3Rpb24nXG4gIGNoaWxkX3R5cGU6ICdkYXRhYmFzZSdcbiAgdGltZW91dDogNTAwMCAjdGltZSBvdCBpcyBzZXQgaW4gNXMuIHF1ZXJpZXMgc2hvdWxkIGJlIGZhc3QuXG4gIG5fdHlwZXM6ICdiaWdpbnQgYmlnc2VyaWFsIGJpdCBib29sZWFuIGJveCBieXRlYSBjaXJjbGUgaW50ZWdlciBpbnRlcnZhbCBqc29uIGxpbmUgbHNlZyBtb25leSBudW1lcmljIHBhdGggcG9pbnQgcG9seWdvbiByZWFsIHNtYWxsaW50IHNtYWxsc2VyaWFsIHRpbWVzdGFtcCB0c3F1ZXJ5IHRzdmVjdG9yIHV1aWQgeG1sJy5zcGxpdCgvXFxzKy8pLmNvbmNhdChbJ2JpdCB2YXJ5aW5nJ10pXG4gIHNfdHlwZXM6IFsnY2hhcmFjdGVyJywnY2hhcmFjdGVyIHZhcnlpbmcnLCdkYXRlJywnaW5ldCcsJ2NpZHInLCd0aW1lJywnbWFjYWRkcicsJ3RleHQnXVxuXG4gIGFsbG93RWRpdGlvbjogdHJ1ZVxuICBAZGVmYXVsdFBvcnQ6IDU0MzJcblxuICBjb25zdHJ1Y3RvcjogKEBpbmZvKS0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgQGluZm8uZGF0YWJhc2UgPz0gJ3Bvc3RncmVzJ1xuICAgIEBjb25uZWN0aW9ucyA9IHt9XG5cbiAgY29ubmVjdDogKGNhbGxiYWNrKS0+XG4gICAgQGRlZmF1bHRDb25uZWN0aW9uID0gbmV3IHBnLkNsaWVudChAaW5mbyk7XG4gICAgQGRlZmF1bHRDb25uZWN0aW9uLmNvbm5lY3QgKGVycik9PlxuICAgICAgQGNvbm5lY3Rpb25zW0BpbmZvLmRhdGFiYXNlXSA9IEBkZWZhdWx0Q29ubmVjdGlvblxuICAgICAgQGRlZmF1bHRDb25uZWN0aW9uLm9uICdlcnJvcicsIChlcnIpID0+XG4gICAgICAgIGNvbnNvbGUubG9nKGVycikgI2ZhdGFsIGVycm9yXG4gICAgICAgIEBjb25uZWN0aW9uc1tAaW5mby5kYXRhYmFzZV0gPSBudWxsXG4gICAgICAgIEBmYXRhbCA9IHRydWVcbiAgICAgIGNhbGxiYWNrKGVycilcblxuICBzZXJpYWxpemU6IC0+XG4gICAgYyA9IEBkZWZhdWx0Q29ubmVjdGlvblxuICAgIGhvc3Q6IGMuaG9zdCxcbiAgICBwb3J0OiBjLnBvcnQsXG4gICAgc3NsOiBjLnNzbFxuICAgIHByb3RvY29sOiBAcHJvdG9jb2xcbiAgICBkYXRhYmFzZTogYy5kYXRhYmFzZVxuICAgIHVzZXI6IGMudXNlcixcbiAgICBwYXNzd29yZDogYy5wYXNzd29yZFxuXG4gIGdldERhdGFiYXNlQ29ubmVjdGlvbjogKGRhdGFiYXNlLGNhbGxiYWNrKSAtPlxuICAgIGlmKEBjb25uZWN0aW9uc1tkYXRhYmFzZV0pXG4gICAgICBjYWxsYmFjayhAY29ubmVjdGlvbnNbZGF0YWJhc2VdKSBpZiBjYWxsYmFja1xuICAgIGVsc2VcbiAgICAgIEBpbmZvLmRhdGFiYXNlID0gZGF0YWJhc2VcbiAgICAgIG5ld0Nvbm5lY3Rpb24gPSBuZXcgcGcuQ2xpZW50KEBpbmZvKVxuICAgICAgbmV3Q29ubmVjdGlvbi5jb25uZWN0IChlcnIpPT5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbmV3Q29ubmVjdGlvbi5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKSAjZmF0YWwgZXJyb3JcbiAgICAgICAgICAgIEBjb25uZWN0aW9uc1tkYXRhYmFzZV0gPSBudWxsXG4gICAgICAgICAgICBpZiBuZXdDb25uZWN0aW9uID09IEBkZWZhdWx0Q29ubmVjdGlvblxuICAgICAgICAgICAgICBAZmF0YWwgPSB0cnVlXG4gICAgICAgICAgQGNvbm5lY3Rpb25zW2RhdGFiYXNlXSA9IG5ld0Nvbm5lY3Rpb25cbiAgICAgICAgICBjYWxsYmFjayhuZXdDb25uZWN0aW9uKSBpZiBjYWxsYmFja1xuXG5cbiAgc2V0RGVmYXVsdERhdGFiYXNlOiAoZGF0YWJhc2UpLT5cbiAgICBAZ2V0RGF0YWJhc2VDb25uZWN0aW9uIGRhdGFiYXNlLCAoY29ubmVjdGlvbikgPT5cbiAgICAgIEBkZWZhdWx0Q29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtZGVmYXVsdC1kYXRhYmFzZScsIGNvbm5lY3Rpb24uZGF0YWJhc2VcblxuICBnZXREZWZhdWx0RGF0YWJhc2U6IC0+XG4gICAgQGRlZmF1bHRDb25uZWN0aW9uLmRhdGFiYXNlXG5cbiAgZGlzcG9zZTogLT5cbiAgICBAY2xvc2UoKVxuXG4gIGNsb3NlOiAtPlxuICAgIGZvciBkYXRhYmFzZSxjb25uZWN0aW9uIG9mIEBjb25uZWN0aW9uc1xuICAgICAgY29ubmVjdGlvbi5lbmQoKVxuXG4gIHF1ZXJ5RGF0YWJhc2VDb25uZWN0aW9uOiAodGV4dCxjb25uZWN0aW9uLGNhbGxiYWNrLCByZWN1cnNpdmUgPSBmYWxzZSkgLT5cbiAgICBjb25uZWN0aW9uLnF1ZXJ5IHsgdGV4dDogdGV4dCAsIHJvd01vZGU6ICdhcnJheSd9ICwgKGVyciwgcmVzdWx0KSA9PlxuICAgICAgaWYoZXJyKVxuICAgICAgICBpZiBlcnIuY29kZSA9PSAnMEEwMDAnICYmIGVyci5tZXNzYWdlLmluZGV4T2YoJ2Nyb3NzLWRhdGFiYXNlJykgIT0gLTEgJiYgIXJlY3Vyc2l2ZVxuICAgICAgICAgICAgZGF0YWJhc2UgPSBlcnIubWVzc2FnZS5tYXRjaCgvXCIoLio/KVwiLylbMV0uc3BsaXQoJy4nKVswXVxuICAgICAgICAgICAgQGdldERhdGFiYXNlQ29ubmVjdGlvbiBkYXRhYmFzZSAsIChjb25uZWN0aW9uMSkgPT5cbiAgICAgICAgICAgICAgQHF1ZXJ5RGF0YWJhc2VDb25uZWN0aW9uKHRleHQsY29ubmVjdGlvbjEsY2FsbGJhY2ssdHJ1ZSkgI1JlY3Vyc2l2ZSBjYWxsIVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2FsbGJhY2soeyB0eXBlOiAnZXJyb3InLCBjb250ZW50OiBlcnIubWVzc2FnZX0pXG4gICAgICBlbHNlIGlmIHJlc3VsdC5jb21tYW5kICE9ICdTRUxFQ1QnXG4gICAgICAgIGlmIGlzTmFOKHJlc3VsdC5yb3dDb3VudClcbiAgICAgICAgICBjYWxsYmFjayB0eXBlOiAnc3VjY2VzcycsIGNvbnRlbnQ6IFwiU3VjY2Vzc1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjYWxsYmFjayAgdHlwZTogJ3N1Y2Nlc3MnLCBjb250ZW50OiBcIiN7cmVzdWx0LnJvd0NvdW50fSByb3cocykgYWZmZWN0ZWRcIlxuICAgICAgZWxzZVxuICAgICAgICBmb3IgZmllbGQsaSBpbiByZXN1bHQuZmllbGRzXG4gICAgICAgICAgZmllbGQuZGIgPSBjb25uZWN0aW9uLmRhdGFiYXNlXG4gICAgICAgIGNhbGxiYWNrKG51bGwscmVzdWx0LnJvd3MscmVzdWx0LmZpZWxkcylcblxuICBxdWVyeTogKHRleHQsY2FsbGJhY2spIC0+XG4gICAgaWYgQGZhdGFsXG4gICAgICBAZ2V0RGF0YWJhc2VDb25uZWN0aW9uIEBkZWZhdWx0Q29ubmVjdGlvbi5kYXRhYmFzZSwgKGNvbm5lY3Rpb24pID0+XG4gICAgICAgIEBkZWZhdWx0Q29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICAgICAgQGZhdGFsID0gZmFsc2VcbiAgICAgICAgQHF1ZXJ5RGF0YWJhc2VDb25uZWN0aW9uKHRleHQsQGRlZmF1bHRDb25uZWN0aW9uLGNhbGxiYWNrKVxuICAgIGVsc2VcbiAgICAgIEBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbih0ZXh0LEBkZWZhdWx0Q29ubmVjdGlvbixjYWxsYmFjaylcblxuICBvYmpSb3dzTWFwOiAocm93cyxmaWVsZHMsY2FsbGJhY2spLT5cbiAgICByb3dzLm1hcCAocixpKSA9PlxuICAgICAgcm93ID0ge31cbiAgICAgIHJvd1tmaWVsZC5uYW1lXSA9IHJbal0gZm9yIGZpZWxkLGogaW4gZmllbGRzXG4gICAgICBpZiBjYWxsYmFjaz8gdGhlbiBjYWxsYmFjayhyb3cpIGVsc2Ugcm93XG5cbiAgcGFyZW50OiAtPiBAXG5cbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIEBnZXREYXRhYmFzZXMgKGRhdGFiYXNlcyxlcnIpLT5cbiAgICAgIHVubGVzcyBlcnI/IHRoZW4gY2FsbGJhY2soZGF0YWJhc2VzKSBlbHNlIGNvbnNvbGUubG9nIGVyclxuXG4gIGdldERhdGFiYXNlczogKGNhbGxiYWNrKSAtPlxuICAgIHRleHQgPSBcIlNFTEVDVCBkYXRuYW1lIEZST00gcGdfZGF0YWJhc2UgXCIrXG4gICAgXCJXSEVSRSBkYXRpc3RlbXBsYXRlID0gZmFsc2VcIlxuICAgIEBxdWVyeSB0ZXh0ICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgaWYgIWVyclxuICAgICAgICBkYXRhYmFzZXMgPSBAb2JqUm93c01hcCByb3dzLGZpZWxkcywgKHJvdykgPT5cbiAgICAgICAgICAgbmV3IFF1aWNrUXVlcnlQb3N0Z3Jlc0RhdGFiYXNlKEAscm93KVxuICAgICAgICBkYXRhYmFzZXMgPSBkYXRhYmFzZXMuZmlsdGVyIChkYXRhYmFzZSkgPT4gIUBoaWRkZW5EYXRhYmFzZShkYXRhYmFzZS5uYW1lKVxuICAgICAgY2FsbGJhY2soZGF0YWJhc2VzLGVycilcblxuXG4gIGdldFNjaGVtYXM6IChkYXRhYmFzZSwgY2FsbGJhY2spLT5cbiAgICBAZ2V0RGF0YWJhc2VDb25uZWN0aW9uIGRhdGFiYXNlLm5hbWUsIChjb25uZWN0aW9uKSA9PlxuICAgICAgdGV4dCA9IFwiU0VMRUNUIHNjaGVtYV9uYW1lIEZST00gaW5mb3JtYXRpb25fc2NoZW1hLnNjaGVtYXRhIFwiK1xuICAgICAgXCJXSEVSRSBjYXRhbG9nX25hbWUgPSAnI3tkYXRhYmFzZS5uYW1lfScgXCIrXG4gICAgICBcIkFORCBzY2hlbWFfbmFtZSBOT1QgSU4gKCdwZ190b2FzdCcsJ3BnX3RlbXBfMScsJ3BnX3RvYXN0X3RlbXBfMScsJ3BnX2NhdGFsb2cnLCdpbmZvcm1hdGlvbl9zY2hlbWEnKVwiXG4gICAgICBAcXVlcnlEYXRhYmFzZUNvbm5lY3Rpb24gdGV4dCwgY29ubmVjdGlvbiAsIChlcnIsIHJvd3MsIGZpZWxkcykgPT5cbiAgICAgICAgaWYgIWVyclxuICAgICAgICAgIHNjaGVtYXMgPSBAb2JqUm93c01hcCByb3dzLCBmaWVsZHMgLCAocm93KSAtPlxuICAgICAgICAgICAgbmV3IFF1aWNrUXVlcnlQb3N0Z3Jlc1NjaGVtYShkYXRhYmFzZSxyb3cpXG4gICAgICAgICAgY2FsbGJhY2soc2NoZW1hcylcblxuXG4gIGdldFRhYmxlczogKHNjaGVtYSxjYWxsYmFjaykgLT5cbiAgICBAZ2V0RGF0YWJhc2VDb25uZWN0aW9uIHNjaGVtYS5kYXRhYmFzZS5uYW1lLCAoY29ubmVjdGlvbikgPT5cbiAgICAgIHRleHQgPSBcIlNFTEVDVCB0YWJsZV9uYW1lIFwiK1xuICAgICAgXCJGUk9NIGluZm9ybWF0aW9uX3NjaGVtYS50YWJsZXMgXCIrXG4gICAgICBcIldIRVJFIHRhYmxlX2NhdGFsb2cgPSAnI3tzY2hlbWEuZGF0YWJhc2UubmFtZX0nIFwiK1xuICAgICAgXCJBTkQgdGFibGVfc2NoZW1hID0gJyN7c2NoZW1hLm5hbWV9J1wiXG4gICAgICBAcXVlcnlEYXRhYmFzZUNvbm5lY3Rpb24gdGV4dCwgY29ubmVjdGlvbiAsIChlcnIsIHJvd3MsIGZpZWxkcykgPT5cbiAgICAgICAgaWYgIWVyclxuICAgICAgICAgIHRhYmxlcyA9IEBvYmpSb3dzTWFwIHJvd3MsZmllbGRzLCAocm93KSAtPlxuICAgICAgICAgICAgbmV3IFF1aWNrUXVlcnlQb3N0Z3Jlc1RhYmxlKHNjaGVtYSxyb3cpXG4gICAgICAgICAgY2FsbGJhY2sodGFibGVzKVxuXG4gIGdldENvbHVtbnM6ICh0YWJsZSxjYWxsYmFjaykgLT5cbiAgICBAZ2V0RGF0YWJhc2VDb25uZWN0aW9uIHRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lLCAoY29ubmVjdGlvbik9PlxuICAgICAgdGV4dCA9IFwiU0VMRUNUICBway5jb25zdHJhaW50X3R5cGUgLGMuKlwiK1xuICAgICAgXCIgRlJPTSBpbmZvcm1hdGlvbl9zY2hlbWEuY29sdW1ucyBjXCIrXG4gICAgICBcIiBMRUZUIE9VVEVSIEpPSU4gKFwiK1xuICAgICAgXCIgIFNFTEVDVFwiK1xuICAgICAgXCIgICB0Yy5jb25zdHJhaW50X3R5cGUsXCIrXG4gICAgICBcIiAgIGtjLmNvbHVtbl9uYW1lLFwiK1xuICAgICAgXCIgICB0Yy50YWJsZV9jYXRhbG9nLFwiK1xuICAgICAgXCIgICB0Yy50YWJsZV9uYW1lLFwiK1xuICAgICAgXCIgICB0Yy50YWJsZV9zY2hlbWFcIitcbiAgICAgIFwiICBGUk9NIGluZm9ybWF0aW9uX3NjaGVtYS50YWJsZV9jb25zdHJhaW50cyB0Y1wiK1xuICAgICAgXCIgIElOTkVSIEpPSU4gaW5mb3JtYXRpb25fc2NoZW1hLkNPTlNUUkFJTlRfQ09MVU1OX1VTQUdFIGtjXCIrXG4gICAgICBcIiAgT04ga2MuY29uc3RyYWludF9uYW1lID0gdGMuY29uc3RyYWludF9uYW1lXCIrXG4gICAgICBcIiAgQU5EIGtjLnRhYmxlX2NhdGFsb2cgPSB0Yy50YWJsZV9jYXRhbG9nXCIrXG4gICAgICBcIiAgQU5EIGtjLnRhYmxlX25hbWUgPSB0Yy50YWJsZV9uYW1lXCIrXG4gICAgICBcIiAgQU5EIGtjLnRhYmxlX3NjaGVtYSA9IHRjLnRhYmxlX3NjaGVtYVwiK1xuICAgICAgXCIgIFdIRVJFIHRjLmNvbnN0cmFpbnRfdHlwZSA9ICdQUklNQVJZIEtFWSdcIitcbiAgICAgIFwiICkgcGsgT04gcGsuY29sdW1uX25hbWUgPSBjLmNvbHVtbl9uYW1lXCIrXG4gICAgICBcIiAgQU5EIHBrLnRhYmxlX2NhdGFsb2cgPSBjLnRhYmxlX2NhdGFsb2dcIitcbiAgICAgIFwiICBBTkQgcGsudGFibGVfbmFtZSA9IGMudGFibGVfbmFtZVwiK1xuICAgICAgXCIgIEFORCBway50YWJsZV9zY2hlbWEgPSBjLnRhYmxlX3NjaGVtYVwiK1xuICAgICAgXCIgV0hFUkUgYy50YWJsZV9uYW1lID0gJyN7dGFibGUubmFtZX0nIFwiK1xuICAgICAgXCIgQU5EIGMudGFibGVfc2NoZW1hID0gJyN7dGFibGUuc2NoZW1hLm5hbWV9JyBcIitcbiAgICAgIFwiIEFORCBjLnRhYmxlX2NhdGFsb2cgPSAnI3t0YWJsZS5zY2hlbWEuZGF0YWJhc2UubmFtZX0nXCJcbiAgICAgIEBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbiB0ZXh0LCBjb25uZWN0aW9uICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgICBpZiAhZXJyXG4gICAgICAgICAgY29sdW1ucyA9IEBvYmpSb3dzTWFwIHJvd3MsIGZpZWxkcywgKHJvdykgPT5cbiAgICAgICAgICAgIG5ldyBRdWlja1F1ZXJ5UG9zdGdyZXNDb2x1bW4odGFibGUscm93KVxuICAgICAgICAgIGNhbGxiYWNrKGNvbHVtbnMpXG5cbiAgaGlkZGVuRGF0YWJhc2U6IChkYXRhYmFzZSkgLT5cbiAgICBkYXRhYmFzZSA9PSBcInBvc3RncmVzXCJcblxuICBzaW1wbGVTZWxlY3Q6ICh0YWJsZSwgY29sdW1ucyA9ICcqJykgLT5cbiAgICBpZiBjb2x1bW5zICE9ICcqJ1xuICAgICAgY29sdW1ucyA9IGNvbHVtbnMubWFwIChjb2wpID0+XG4gICAgICAgIEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGNvbC5uYW1lKVxuICAgICAgY29sdW1ucyA9IFwiXFxuIFwiK2NvbHVtbnMuam9pbihcIixcXG4gXCIpICsgXCJcXG5cIlxuICAgIHRhYmxlX25hbWUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5uYW1lKVxuICAgIHNjaGVtYV9uYW1lID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUuc2NoZW1hLm5hbWUpXG4gICAgZGF0YWJhc2VfbmFtZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKHRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgIFwiU0VMRUNUICN7Y29sdW1uc30gRlJPTSAje2RhdGFiYXNlX25hbWV9LiN7c2NoZW1hX25hbWV9LiN7dGFibGVfbmFtZX0gTElNSVQgMTAwMFwiXG5cblxuICBjcmVhdGVEYXRhYmFzZTogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGluZm8ubmFtZSlcbiAgICBcIkNSRUFURSBEQVRBQkFTRSAje2RhdGFiYXNlfTtcIlxuXG4gIGNyZWF0ZVNjaGVtYTogKG1vZGVsLGluZm8pLT5cbiAgICBzY2hlbWEgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihpbmZvLm5hbWUpXG4gICAgQHNldERlZmF1bHREYXRhYmFzZShtb2RlbC5uYW1lKVxuICAgIFwiQ1JFQVRFIFNDSEVNQSAje3NjaGVtYX07XCJcblxuICBjcmVhdGVUYWJsZTogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLmRhdGFiYXNlLm5hbWUpXG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwubmFtZSlcbiAgICB0YWJsZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGluZm8ubmFtZSlcbiAgICBcIkNSRUFURSBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX0gKCBcXG5cIitcbiAgICBcIiBcXFwiaWRcXFwiIElOVCBOT1QgTlVMTCAsXFxuXCIrXG4gICAgXCIgQ09OU1RSQUlOVCBcXFwiI3tpbmZvLm5hbWV9X3BrXFxcIiBQUklNQVJZIEtFWSAoXFxcImlkXFxcIikgKTtcIlxuXG4gIGNyZWF0ZUNvbHVtbjogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnNjaGVtYS5uYW1lKVxuICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwubmFtZSlcbiAgICBjb2x1bW4gPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihpbmZvLm5hbWUpXG4gICAgbnVsbGFibGUgPSBpZiBpbmZvLm51bGxhYmxlIHRoZW4gJ05VTEwnIGVsc2UgJ05PVCBOVUxMJ1xuICAgIGRhZmF1bHRWYWx1ZSA9IGlmIGluZm8uZGVmYXVsdCA9PSBudWxsIHRoZW4gJ05VTEwnIGVsc2UgQGVzY2FwZShpbmZvLmRlZmF1bHQsaW5mby5kYXRhdHlwZSlcbiAgICBcIkFMVEVSIFRBQkxFICN7ZGF0YWJhc2V9LiN7c2NoZW1hfS4je3RhYmxlfSBBREQgQ09MVU1OICN7Y29sdW1ufVwiK1xuICAgIFwiICN7aW5mby5kYXRhdHlwZX0gI3tudWxsYWJsZX0gREVGQVVMVCAje2RhZmF1bHRWYWx1ZX07XCJcblxuXG4gIGFsdGVyVGFibGU6IChtb2RlbCxkZWx0YSktPlxuICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLm5hbWUpXG4gICAgbmV3TmFtZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGRlbHRhLm5ld19uYW1lKVxuICAgIG9sZE5hbWUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihkZWx0YS5vbGRfbmFtZSlcbiAgICBxdWVyeSA9IFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7b2xkTmFtZX0gUkVOQU1FIFRPICN7bmV3TmFtZX07XCJcblxuICBhbHRlckNvbHVtbjogKG1vZGVsLGRlbHRhKS0+XG4gICAgZGF0YWJhc2UgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC50YWJsZS5zY2hlbWEuZGF0YWJhc2UubmFtZSlcbiAgICBzY2hlbWEgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC50YWJsZS5zY2hlbWEubmFtZSlcbiAgICB0YWJsZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLm5hbWUpXG4gICAgbmV3TmFtZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGRlbHRhLm5ld19uYW1lKVxuICAgIG9sZE5hbWUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihkZWx0YS5vbGRfbmFtZSlcbiAgICBudWxsYWJsZSA9IGlmIGRlbHRhLm51bGxhYmxlIHRoZW4gJ0RST1AgTk9UIE5VTEwnIGVsc2UgJ1NFVCBOT1QgTlVMTCdcbiAgICBkZWZhdWx0VmFsdWUgPSBpZiBkZWx0YS5kZWZhdWx0ID09IG51bGwgdGhlbiAnTlVMTCcgZWxzZSBAZXNjYXBlKGRlbHRhLmRlZmF1bHQsZGVsdGEuZGF0YXR5cGUpXG4gICAgcmVzdWx0ID0gXCJBTFRFUiBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX1cIitcbiAgICBcIlxcbkFMVEVSIENPTFVNTiAje29sZE5hbWV9IFNFVCBEQVRBIFRZUEUgI3tkZWx0YS5kYXRhdHlwZX0sXCIrXG4gICAgXCJcXG5BTFRFUiBDT0xVTU4gI3tvbGROYW1lfSAje251bGxhYmxlfSxcIitcbiAgICBcIlxcbkFMVEVSIENPTFVNTiAje29sZE5hbWV9IFNFVCBERUZBVUxUICN7ZGVmYXVsdFZhbHVlfVwiXG4gICAgaWYgb2xkTmFtZSAhPSBuZXdOYW1lXG4gICAgICByZXN1bHQgKz0gXCJcXG5BTFRFUiBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX1cIitcbiAgICAgIFwiIFJFTkFNRSBDT0xVTU4gI3tvbGROYW1lfSBUTyAje25ld05hbWV9O1wiXG4gICAgcmVzdWx0XG5cbiAgZHJvcERhdGFiYXNlOiAobW9kZWwpLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLm5hbWUpXG4gICAgXCJEUk9QIERBVEFCQVNFICN7ZGF0YWJhc2V9O1wiXG5cbiAgZHJvcFNjaGVtYTogKG1vZGVsKS0+XG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwubmFtZSlcbiAgICBAc2V0RGVmYXVsdERhdGFiYXNlKG1vZGVsLmRhdGFiYXNlLm5hbWUpXG4gICAgXCJEUk9QIFNDSEVNQSAje3NjaGVtYX07XCJcblxuICBkcm9wVGFibGU6IChtb2RlbCktPlxuICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwuc2NoZW1hLm5hbWUpXG4gICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5uYW1lKVxuICAgIFwiRFJPUCBUQUJMRSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX07XCJcblxuICBkcm9wQ29sdW1uOiAobW9kZWwpLT5cbiAgICBkYXRhYmFzZSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLnNjaGVtYS5kYXRhYmFzZS5uYW1lKVxuICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKG1vZGVsLnRhYmxlLnNjaGVtYS5uYW1lKVxuICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIobW9kZWwudGFibGUubmFtZSlcbiAgICBjb2x1bW4gPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcihtb2RlbC5uYW1lKVxuICAgIFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9IERST1AgQ09MVU1OICN7Y29sdW1ufTtcIlxuXG4gIHVwZGF0ZVJlY29yZDogKHJvdyxmaWVsZHMsdmFsdWVzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBmb3Igb2lkLHQgb2YgdGFibGVzXG4gICAgICBAZ2V0VGFibGVCeU9JRCB0LmRhdGFiYXNlLHQub2lkLCAodGFibGUpID0+XG4gICAgICAgIHRhYmxlLmNoaWxkcmVuIChjb2x1bW5zKSA9PlxuICAgICAgICAgIGtleXMgPSAoeyBpeDogaSwga2V5OiBrZXl9IGZvciBrZXksaSBpbiBjb2x1bW5zIHdoZW4ga2V5LnByaW1hcnlfa2V5KVxuICAgICAgICAgIGFsbGtleXMgPSB0cnVlXG4gICAgICAgICAgYWxsa2V5cyAmPSByb3dbay5peF0/IGZvciBrIGluIGtleXNcbiAgICAgICAgICBpZiBhbGxrZXlzICYmIGtleXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgQF9tYXRjaENvbHVtbnModC5maWVsZHMsY29sdW1ucylcbiAgICAgICAgICAgIGFzc2luZ3MgPSB0LmZpZWxkcy5maWx0ZXIoIChmaWVsZCktPiBmaWVsZC5jb2x1bW4/ICkubWFwIChmaWVsZCkgPT5cbiAgICAgICAgICAgICAgXCIje0BkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGZpZWxkLmNvbHVtbi5uYW1lKX0gPSAje0Blc2NhcGUodmFsdWVzW2ZpZWxkLm5hbWVdLGZpZWxkLmNvbHVtbi5kYXRhdHlwZSl9XCJcbiAgICAgICAgICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgICAgICBzY2hlbWEgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5zY2hlbWEubmFtZSlcbiAgICAgICAgICAgIHRhYmxlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUubmFtZSlcbiAgICAgICAgICAgIHdoZXJlID0ga2V5cy5tYXAgKGspPT4gXCIje0BkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGsua2V5Lm5hbWUpfSA9ICN7QGVzY2FwZShyb3dbay5peF0say5rZXkuZGF0YXR5cGUpfVwiXG4gICAgICAgICAgICB1cGRhdGUgPSBcIlVQREFURSAje2RhdGFiYXNlfS4je3NjaGVtYX0uI3t0YWJsZX1cIitcbiAgICAgICAgICAgIFwiIFNFVCAje2Fzc2luZ3Muam9pbignLCcpfVwiK1xuICAgICAgICAgICAgXCIgV0hFUkUgXCIrd2hlcmUuam9pbignIEFORCAnKStcIjtcIlxuICAgICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnc2VudGVuY2UtcmVhZHknLCB1cGRhdGVcblxuXG4gIGluc2VydFJlY29yZDogKGZpZWxkcyx2YWx1ZXMpLT5cbiAgICB0YWJsZXMgPSBAX3RhYmxlR3JvdXAoZmllbGRzKVxuICAgIGZvciBvaWQsdCBvZiB0YWJsZXNcbiAgICAgIEBnZXRUYWJsZUJ5T0lEIHQuZGF0YWJhc2UsdC5vaWQsICh0YWJsZSkgPT5cbiAgICAgICAgdGFibGUuY2hpbGRyZW4gKGNvbHVtbnMpID0+XG4gICAgICAgICAgQF9tYXRjaENvbHVtbnModC5maWVsZHMsY29sdW1ucylcbiAgICAgICAgICBhcnlmaWVsZHMgPSB0LmZpZWxkcy5maWx0ZXIoIChmaWVsZCktPiBmaWVsZC5jb2x1bW4/ICkubWFwIChmaWVsZCkgPT5cbiAgICAgICAgICAgIEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKGZpZWxkLmNvbHVtbi5uYW1lKVxuICAgICAgICAgIHN0cmZpZWxkcyA9IGFyeWZpZWxkcy5qb2luKCcsJylcbiAgICAgICAgICBhcnl2YWx1ZXMgPSB0LmZpZWxkcy5maWx0ZXIoIChmaWVsZCktPiBmaWVsZC5jb2x1bW4/ICkubWFwIChmaWVsZCkgPT5cbiAgICAgICAgICAgIEBlc2NhcGUodmFsdWVzW2ZpZWxkLmNvbHVtbi5uYW1lXSxmaWVsZC5jb2x1bW4uZGF0YXR5cGUpXG4gICAgICAgICAgc3RydmFsdWVzID0gYXJ5dmFsdWVzLmpvaW4oJywnKVxuICAgICAgICAgIGRhdGFiYXNlID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUuc2NoZW1hLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgICAgc2NoZW1hID0gQGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIodGFibGUuc2NoZW1hLm5hbWUpXG4gICAgICAgICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5uYW1lKVxuICAgICAgICAgIGluc2VydCA9IFwiSU5TRVJUIElOVE8gI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9XCIrXG4gICAgICAgICAgXCIgKCN7c3RyZmllbGRzfSkgVkFMVUVTICgje3N0cnZhbHVlc30pO1wiXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnc2VudGVuY2UtcmVhZHknLCBpbnNlcnRcblxuICBkZWxldGVSZWNvcmQ6IChyb3csZmllbGRzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBmb3Igb2lkLHQgb2YgdGFibGVzXG4gICAgICBAZ2V0VGFibGVCeU9JRCB0LmRhdGFiYXNlLHQub2lkLCAodGFibGUpID0+XG4gICAgICAgIHRhYmxlLmNoaWxkcmVuIChjb2x1bW5zKSA9PlxuICAgICAgICAgIGtleXMgPSAoeyBpeDogaSwga2V5OiBrZXl9IGZvciBrZXksaSBpbiBjb2x1bW5zIHdoZW4ga2V5LnByaW1hcnlfa2V5KVxuICAgICAgICAgIGFsbGtleXMgPSB0cnVlXG4gICAgICAgICAgYWxsa2V5cyAmPSByb3dbay5peF0/IGZvciBrIGluIGtleXNcbiAgICAgICAgICBpZiBhbGxrZXlzICYmIGtleXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgZGF0YWJhc2UgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5zY2hlbWEuZGF0YWJhc2UubmFtZSlcbiAgICAgICAgICAgIHNjaGVtYSA9IEBkZWZhdWx0Q29ubmVjdGlvbi5lc2NhcGVJZGVudGlmaWVyKHRhYmxlLnNjaGVtYS5uYW1lKVxuICAgICAgICAgICAgdGFibGUgPSBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlSWRlbnRpZmllcih0YWJsZS5uYW1lKVxuICAgICAgICAgICAgd2hlcmUgPSBrZXlzLm1hcCAoayk9PiBcIiN7QGRlZmF1bHRDb25uZWN0aW9uLmVzY2FwZUlkZW50aWZpZXIoay5rZXkubmFtZSl9ID0gI3tAZXNjYXBlKHJvd1trLml4XSxrLmtleS5kYXRhdHlwZSl9XCJcbiAgICAgICAgICAgIGRlbCA9IFwiREVMRVRFIEZST00gI3tkYXRhYmFzZX0uI3tzY2hlbWF9LiN7dGFibGV9XCIrXG4gICAgICAgICAgICBcIiBXSEVSRSBcIit3aGVyZS5qb2luKCcgQU5EICcpK1wiO1wiXG4gICAgICAgICAgICBAZW1pdHRlci5lbWl0ICdzZW50ZW5jZS1yZWFkeScsIGRlbFxuXG4gIGdldFRhYmxlQnlPSUQ6IChkYXRhYmFzZSxvaWQsY2FsbGJhY2spLT5cbiAgICBAZ2V0RGF0YWJhc2VDb25uZWN0aW9uIGRhdGFiYXNlLCAoY29ubmVjdGlvbikgPT5cbiAgICAgIHRleHQgPSBcIlNFTEVDVCBzLm5zcG5hbWUgQVMgc2NoZW1hX25hbWUsXCIrXG4gICAgICBcIiB0LnJlbG5hbWUgQVMgdGFibGVfbmFtZVwiK1xuICAgICAgXCIgRlJPTSBwZ19jbGFzcyB0XCIrXG4gICAgICBcIiBJTk5FUiBKT0lOIHBnX25hbWVzcGFjZSBzIE9OIHQucmVsbmFtZXNwYWNlID0gcy5vaWRcIitcbiAgICAgIFwiIFdIRVJFIHQub2lkID0gI3tvaWR9XCJcbiAgICAgIEBxdWVyeURhdGFiYXNlQ29ubmVjdGlvbiB0ZXh0LCBjb25uZWN0aW9uICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgICBkYiA9IHtuYW1lOiBkYXRhYmFzZSwgY29ubmVjdGlvbjogQCB9XG4gICAgICAgIGlmICFlcnIgJiYgcm93cy5sZW5ndGggPT0gMVxuICAgICAgICAgIHJvdyA9IEBvYmpSb3dzTWFwKHJvd3MsZmllbGRzKVswXVxuICAgICAgICAgIHNjaGVtYSA9IG5ldyBRdWlja1F1ZXJ5UG9zdGdyZXNTY2hlbWEoZGIscm93LGZpZWxkcylcbiAgICAgICAgICB0YWJsZSA9IG5ldyBRdWlja1F1ZXJ5UG9zdGdyZXNUYWJsZShzY2hlbWEscm93KVxuICAgICAgICAgIGNhbGxiYWNrKHRhYmxlKVxuXG4gIF9tYXRjaENvbHVtbnM6IChmaWVsZHMsY29sdW1ucyktPlxuICAgIGZvciBmaWVsZCBpbiBmaWVsZHNcbiAgICAgIGZvciBjb2x1bW4gaW4gY29sdW1uc1xuICAgICAgICBmaWVsZC5jb2x1bW4gPSBjb2x1bW4gaWYgY29sdW1uLmlkID09IGZpZWxkLmNvbHVtbklEXG5cbiAgX3RhYmxlR3JvdXA6IChmaWVsZHMpLT5cbiAgICB0YWJsZXMgPSB7fVxuICAgIGZvciBmaWVsZCBpbiBmaWVsZHNcbiAgICAgIGlmIGZpZWxkLnRhYmxlSUQ/XG4gICAgICAgIG9pZCA9IGZpZWxkLnRhYmxlSUQudG9TdHJpbmcoKVxuICAgICAgICB0YWJsZXNbb2lkXSA/PVxuICAgICAgICAgIG9pZDogZmllbGQudGFibGVJRFxuICAgICAgICAgIGRhdGFiYXNlOiBmaWVsZC5kYlxuICAgICAgICAgIGZpZWxkczogW11cbiAgICAgICAgdGFibGVzW29pZF0uZmllbGRzLnB1c2goZmllbGQpXG4gICAgdGFibGVzXG5cbiAgc2VudGVuY2VSZWFkeTogKGNhbGxiYWNrKS0+XG4gICAgQGVtaXR0ZXIub24gJ3NlbnRlbmNlLXJlYWR5JywgY2FsbGJhY2tcblxuICBvbkRpZENoYW5nZURlZmF1bHREYXRhYmFzZTogKGNhbGxiYWNrKS0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtZGVmYXVsdC1kYXRhYmFzZScsIGNhbGxiYWNrXG5cbiAgZ2V0RGF0YVR5cGVzOiAtPlxuICAgIEBuX3R5cGVzLmNvbmNhdChAc190eXBlcylcblxuICB0b1N0cmluZzogLT5cbiAgICBAcHJvdG9jb2wrXCI6Ly9cIitAZGVmYXVsdENvbm5lY3Rpb24udXNlcitcIkBcIitAZGVmYXVsdENvbm5lY3Rpb24uaG9zdFxuXG4gIGVzY2FwZTogKHZhbHVlLHR5cGUpLT5cbiAgICBpZiB2YWx1ZSA9PSBudWxsXG4gICAgICByZXR1cm4gJ05VTEwnXG4gICAgZm9yIHQxIGluIEBzX3R5cGVzXG4gICAgICBpZiB0eXBlLnNlYXJjaChuZXcgUmVnRXhwKHQxLCBcImlcIikpICE9IC0xXG4gICAgICAgIHJldHVybiBAZGVmYXVsdENvbm5lY3Rpb24uZXNjYXBlTGl0ZXJhbCh2YWx1ZSlcbiAgICB2YWx1ZS50b1N0cmluZygpXG4iXX0=
