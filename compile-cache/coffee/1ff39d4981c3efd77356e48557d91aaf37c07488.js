(function() {
  var Emitter, QuickQueryMysqlColumn, QuickQueryMysqlConnection, QuickQueryMysqlDatabase, QuickQueryMysqlTable, mysql;

  mysql = require('mysql');

  Emitter = require('atom').Emitter;

  QuickQueryMysqlColumn = (function() {
    QuickQueryMysqlColumn.prototype.type = 'column';

    QuickQueryMysqlColumn.prototype.child_type = null;

    function QuickQueryMysqlColumn(table1, row) {
      this.table = table1;
      this.connection = this.table.connection;
      this.name = row['Field'];
      this.column = this.name;
      this.primary_key = row["Key"] === "PRI";
      this.datatype = row['Type'];
      this["default"] = row['Default'];
      this.nullable = row['Null'] === 'YES';
    }

    QuickQueryMysqlColumn.prototype.toString = function() {
      return this.name;
    };

    QuickQueryMysqlColumn.prototype.parent = function() {
      return this.table;
    };

    QuickQueryMysqlColumn.prototype.children = function(callback) {
      return callback([]);
    };

    return QuickQueryMysqlColumn;

  })();

  QuickQueryMysqlTable = (function() {
    QuickQueryMysqlTable.prototype.type = 'table';

    QuickQueryMysqlTable.prototype.child_type = 'column';

    function QuickQueryMysqlTable(database1, row, fields) {
      this.database = database1;
      this.connection = this.database.connection;
      this.name = row[fields[0].name];
      this.table = this.name;
    }

    QuickQueryMysqlTable.prototype.toString = function() {
      return this.name;
    };

    QuickQueryMysqlTable.prototype.parent = function() {
      return this.database;
    };

    QuickQueryMysqlTable.prototype.children = function(callback) {
      return this.connection.getColumns(this, callback);
    };

    return QuickQueryMysqlTable;

  })();

  QuickQueryMysqlDatabase = (function() {
    QuickQueryMysqlDatabase.prototype.type = 'database';

    QuickQueryMysqlDatabase.prototype.child_type = 'table';

    function QuickQueryMysqlDatabase(connection, row) {
      this.connection = connection;
      this.name = row["Database"];
      this.database = this.name;
    }

    QuickQueryMysqlDatabase.prototype.toString = function() {
      return this.name;
    };

    QuickQueryMysqlDatabase.prototype.parent = function() {
      return this.connection;
    };

    QuickQueryMysqlDatabase.prototype.children = function(callback) {
      return this.connection.getTables(this, callback);
    };

    return QuickQueryMysqlDatabase;

  })();

  module.exports = QuickQueryMysqlConnection = (function() {
    QuickQueryMysqlConnection.prototype.fatal = false;

    QuickQueryMysqlConnection.prototype.connection = null;

    QuickQueryMysqlConnection.prototype.protocol = 'mysql';

    QuickQueryMysqlConnection.prototype.type = 'connection';

    QuickQueryMysqlConnection.prototype.child_type = 'database';

    QuickQueryMysqlConnection.prototype.timeout = 5000;

    QuickQueryMysqlConnection.prototype.n_types = 'TINYINT SMALLINT MEDIUMINT INT INTEGER BIGINT FLOAT DOUBLE REAL DECIMAL NUMERIC TIMESTAMP YEAR ENUM SET'.split(/\s+/);

    QuickQueryMysqlConnection.prototype.s_types = 'CHAR VARCHAR TINYBLOB TINYTEXT MEDIUMBLOB MEDIUMTEXT LONGBLOB LONGTEXT BLOB TEXT DATETIME DATE TIME'.split(/\s+/);

    QuickQueryMysqlConnection.prototype.allowEdition = true;

    QuickQueryMysqlConnection.defaultPort = 3306;

    function QuickQueryMysqlConnection(info1) {
      this.info = info1;
      this.info.dateStrings = true;
      this.info.multipleStatements = true;
      this.emitter = new Emitter();
    }

    QuickQueryMysqlConnection.prototype.connect = function(callback) {
      this.connection = mysql.createConnection(this.info);
      this.connection.on('error', (function(_this) {
        return function(err) {
          if (err && err.code === 'PROTOCOL_CONNECTION_LOST') {
            return _this.fatal = true;
          }
        };
      })(this));
      return this.connection.connect(callback);
    };

    QuickQueryMysqlConnection.prototype.serialize = function() {
      var c;
      c = this.connection.config;
      return {
        host: c.host,
        port: c.port,
        protocol: this.protocol,
        database: c.database,
        user: c.user,
        password: c.password
      };
    };

    QuickQueryMysqlConnection.prototype.dispose = function() {
      return this.close();
    };

    QuickQueryMysqlConnection.prototype.close = function() {
      return this.connection.end();
    };

    QuickQueryMysqlConnection.prototype.query = function(text, callback) {
      if (this.fatal) {
        this.connection = mysql.createConnection(this.info);
        this.connection.on('error', (function(_this) {
          return function(err) {
            if (err && err.code === 'PROTOCOL_CONNECTION_LOST') {
              return _this.fatal = true;
            }
          };
        })(this));
        this.fatal = false;
      }
      return this.connection.query({
        sql: text,
        timeout: this.timeout
      }, (function(_this) {
        return function(err, rows, fields) {
          var affectedRows;
          if (err) {
            _this.fatal = err.fatal;
            return callback({
              type: 'error',
              content: err.toString()
            });
          } else if (!fields) {
            return callback({
              type: 'success',
              content: rows.affectedRows + " row(s) affected"
            });
          } else if (fields.length === 0 || (!Array.isArray(fields[0]) && (fields[0] != null))) {
            return callback(null, rows, fields);
          } else {
            affectedRows = rows.map(function(row) {
              if (row.affectedRows != null) {
                return row.affectedRows;
              } else {
                return 0;
              }
            });
            affectedRows = affectedRows.reduce(function(r1, r2) {
              return r1 + r2;
            });
            if ((fields[0] != null) && affectedRows === 0) {
              return callback(null, rows[0], fields[0]);
            } else {
              return callback({
                type: 'success',
                content: affectedRows + " row(s) affected"
              });
            }
          }
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.setDefaultDatabase = function(database) {
      return this.connection.changeUser({
        database: database
      }, (function(_this) {
        return function() {
          return _this.emitter.emit('did-change-default-database', _this.connection.config.database);
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.getDefaultDatabase = function() {
      return this.connection.config.database;
    };

    QuickQueryMysqlConnection.prototype.parent = function() {
      return this;
    };

    QuickQueryMysqlConnection.prototype.children = function(callback) {
      return this.getDatabases(function(databases, err) {
        if (err == null) {
          return callback(databases);
        } else {
          return console.log(err);
        }
      });
    };

    QuickQueryMysqlConnection.prototype.getDatabases = function(callback) {
      var text;
      text = "SHOW DATABASES";
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var databases;
          if (!err) {
            databases = rows.map(function(row) {
              return new QuickQueryMysqlDatabase(_this, row);
            });
            databases = databases.filter(function(database) {
              return !_this.hiddenDatabase(database.name);
            });
          }
          return callback(databases, err);
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.getTables = function(database, callback) {
      var database_name, text;
      database_name = this.connection.escapeId(database.name);
      text = "SHOW TABLES IN " + database_name;
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var tables;
          if (!err) {
            tables = rows.map(function(row) {
              return new QuickQueryMysqlTable(database, row, fields);
            });
            return callback(tables);
          }
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.getColumns = function(table, callback) {
      var database_name, table_name, text;
      table_name = this.connection.escapeId(table.name);
      database_name = this.connection.escapeId(table.database.name);
      text = "SHOW COLUMNS IN " + table_name + " IN " + database_name;
      return this.query(text, (function(_this) {
        return function(err, rows, fields) {
          var columns;
          if (!err) {
            columns = rows.map(function(row) {
              return new QuickQueryMysqlColumn(table, row);
            });
            return callback(columns);
          }
        };
      })(this));
    };

    QuickQueryMysqlConnection.prototype.hiddenDatabase = function(database) {
      return database === "information_schema" || database === "performance_schema" || database === "mysql";
    };

    QuickQueryMysqlConnection.prototype.simpleSelect = function(table, columns) {
      var database_name, table_name;
      if (columns == null) {
        columns = '*';
      }
      if (columns !== '*') {
        columns = columns.map((function(_this) {
          return function(col) {
            return _this.connection.escapeId(col.name);
          };
        })(this));
        columns = "\n " + columns.join(",\n ") + "\n";
      }
      table_name = this.connection.escapeId(table.name);
      database_name = this.connection.escapeId(table.database.name);
      return "SELECT " + columns + " FROM " + database_name + "." + table_name + " LIMIT 1000";
    };

    QuickQueryMysqlConnection.prototype.createDatabase = function(model, info) {
      var database;
      database = this.connection.escapeId(info.name);
      return "CREATE SCHEMA " + database + ";";
    };

    QuickQueryMysqlConnection.prototype.createTable = function(model, info) {
      var database, table;
      database = this.connection.escapeId(model.name);
      table = this.connection.escapeId(info.name);
      return ("CREATE TABLE " + database + "." + table + " ( \n") + " `id` INT NOT NULL ,\n" + " PRIMARY KEY (`id`) );";
    };

    QuickQueryMysqlConnection.prototype.createColumn = function(model, info) {
      var column, dafaultValue, database, nullable, table;
      database = this.connection.escapeId(model.database.name);
      table = this.connection.escapeId(model.name);
      column = this.connection.escapeId(info.name);
      nullable = info.nullable ? 'NULL' : 'NOT NULL';
      dafaultValue = this.escape(info["default"], info.datatype) || 'NULL';
      return ("ALTER TABLE " + database + "." + table + " ADD COLUMN " + column) + (" " + info.datatype + " " + nullable + " DEFAULT " + dafaultValue + ";");
    };

    QuickQueryMysqlConnection.prototype.alterTable = function(model, delta) {
      var database, newName, oldName, query;
      database = this.connection.escapeId(model.database.name);
      newName = this.connection.escapeId(delta.new_name);
      oldName = this.connection.escapeId(delta.old_name);
      return query = "ALTER TABLE " + database + "." + oldName + " RENAME TO " + database + "." + newName + ";";
    };

    QuickQueryMysqlConnection.prototype.alterColumn = function(model, delta) {
      var dafaultValue, database, newName, nullable, oldName, table;
      database = this.connection.escapeId(model.table.database.name);
      table = this.connection.escapeId(model.table.name);
      newName = this.connection.escapeId(delta.new_name);
      oldName = this.connection.escapeId(delta.old_name);
      nullable = delta.nullable ? 'NULL' : 'NOT NULL';
      dafaultValue = this.escape(delta["default"], delta.datatype) || 'NULL';
      return ("ALTER TABLE " + database + "." + table + " CHANGE COLUMN " + oldName + " " + newName) + (" " + delta.datatype + " " + nullable + " DEFAULT " + dafaultValue + ";");
    };

    QuickQueryMysqlConnection.prototype.dropDatabase = function(model) {
      var database;
      database = this.connection.escapeId(model.name);
      return "DROP SCHEMA " + database + ";";
    };

    QuickQueryMysqlConnection.prototype.dropTable = function(model) {
      var database, table;
      database = this.connection.escapeId(model.database.name);
      table = this.connection.escapeId(model.name);
      return "DROP TABLE " + database + "." + table + ";";
    };

    QuickQueryMysqlConnection.prototype.dropColumn = function(model) {
      var column, database, table;
      database = this.connection.escapeId(model.table.database.name);
      table = this.connection.escapeId(model.table.name);
      column = this.connection.escapeId(model.name);
      return "ALTER TABLE " + database + "." + table + " DROP COLUMN " + column + ";";
    };

    QuickQueryMysqlConnection.prototype.updateRecord = function(row, fields, values) {
      var name, results, table, tables;
      tables = this._tableGroup(fields);
      results = [];
      for (name in tables) {
        table = tables[name];
        results.push(this.getColumns(table, (function(_this) {
          return function(columns) {
            var allkeys, assings, database, i, key, keys, len, update, where;
            keys = (function() {
              var i, len, results1;
              results1 = [];
              for (i = 0, len = columns.length; i < len; i++) {
                key = columns[i];
                if (key.primary_key) {
                  results1.push(key);
                }
              }
              return results1;
            })();
            allkeys = true;
            for (i = 0, len = keys.length; i < len; i++) {
              key = keys[i];
              allkeys &= row[key.name] != null;
            }
            if (allkeys && keys.length > 0) {
              assings = fields.map(function(field) {
                var column;
                column = ((function() {
                  var j, len1, results1;
                  results1 = [];
                  for (j = 0, len1 = columns.length; j < len1; j++) {
                    column = columns[j];
                    if (column.name === field.orgName) {
                      results1.push(column);
                    }
                  }
                  return results1;
                })())[0];
                return (_this.connection.escapeId(field.orgName)) + " = " + (_this.escape(values[field.name], column.datatype));
              });
              database = _this.connection.escapeId(table.database.name);
              table = _this.connection.escapeId(table.name);
              where = keys.map(function(key) {
                return (_this.connection.escapeId(key.name)) + " = " + (_this.escape(row[key.name], key.datatype));
              });
              update = ("UPDATE " + database + "." + table) + (" SET " + (assings.join(','))) + " WHERE " + where.join(' AND ') + ";";
              return _this.emitter.emit('sentence-ready', update);
            }
          };
        })(this)));
      }
      return results;
    };

    QuickQueryMysqlConnection.prototype.insertRecord = function(fields, values) {
      var name, results, table, tables;
      tables = this._tableGroup(fields);
      results = [];
      for (name in tables) {
        table = tables[name];
        results.push(this.getColumns(table, (function(_this) {
          return function(columns) {
            var aryfields, aryvalues, database, insert, strfields, strvalues;
            aryfields = table.fields.map(function(field) {
              return _this.connection.escapeId(field.orgName);
            });
            strfields = aryfields.join(',');
            aryvalues = table.fields.map(function(field) {
              var column;
              column = ((function() {
                var i, len, results1;
                results1 = [];
                for (i = 0, len = columns.length; i < len; i++) {
                  column = columns[i];
                  if (column.name === field.orgName) {
                    results1.push(column);
                  }
                }
                return results1;
              })())[0];
              return _this.escape(values[field.name], column.datatype);
            });
            strvalues = aryvalues.join(',');
            database = _this.connection.escapeId(table.database.name);
            table = _this.connection.escapeId(table.name);
            insert = ("INSERT INTO " + database + "." + table) + (" (" + strfields + ") VALUES (" + strvalues + ");");
            return _this.emitter.emit('sentence-ready', insert);
          };
        })(this)));
      }
      return results;
    };

    QuickQueryMysqlConnection.prototype.deleteRecord = function(row, fields) {
      var name, results, table, tables;
      tables = this._tableGroup(fields);
      results = [];
      for (name in tables) {
        table = tables[name];
        results.push(this.getColumns(table, (function(_this) {
          return function(columns) {
            var allkeys, database, del, i, key, keys, len, where;
            keys = (function() {
              var i, len, results1;
              results1 = [];
              for (i = 0, len = columns.length; i < len; i++) {
                key = columns[i];
                if (key.primary_key) {
                  results1.push(key);
                }
              }
              return results1;
            })();
            allkeys = true;
            for (i = 0, len = keys.length; i < len; i++) {
              key = keys[i];
              allkeys &= row[key.name] != null;
            }
            if (allkeys && keys.length > 0) {
              database = _this.connection.escapeId(table.database.name);
              table = _this.connection.escapeId(table.name);
              where = keys.map(function(key) {
                return (_this.connection.escapeId(key.name)) + " = " + (_this.escape(row[key.name], key.datatype));
              });
              del = ("DELETE FROM " + database + "." + table) + " WHERE " + where.join(' AND ') + ";";
              return _this.emitter.emit('sentence-ready', del);
            }
          };
        })(this)));
      }
      return results;
    };

    QuickQueryMysqlConnection.prototype._tableGroup = function(fields) {
      var field, i, len, name1, tables;
      tables = {};
      for (i = 0, len = fields.length; i < len; i++) {
        field = fields[i];
        if (field.orgTable != null) {
          if (tables[name1 = field.orgTable] == null) {
            tables[name1] = {
              name: field.orgTable,
              database: {
                name: field.db
              },
              fields: []
            };
          }
          tables[field.orgTable].fields.push(field);
        }
      }
      return tables;
    };

    QuickQueryMysqlConnection.prototype.sentenceReady = function(callback) {
      return this.emitter.on('sentence-ready', callback);
    };

    QuickQueryMysqlConnection.prototype.onDidChangeDefaultDatabase = function(callback) {
      return this.emitter.on('did-change-default-database', callback);
    };

    QuickQueryMysqlConnection.prototype.getDataTypes = function() {
      return this.n_types.concat(this.s_types);
    };

    QuickQueryMysqlConnection.prototype.toString = function() {
      return this.protocol + "://" + this.connection.config.user + "@" + this.connection.config.host;
    };

    QuickQueryMysqlConnection.prototype.escape = function(value, type) {
      var i, len, ref, t1;
      ref = this.s_types;
      for (i = 0, len = ref.length; i < len; i++) {
        t1 = ref[i];
        if (value === null || type.search(new RegExp(t1, "i")) !== -1) {
          return this.connection.escape(value);
        }
      }
      return value.toString();
    };

    return QuickQueryMysqlConnection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LW15c3FsLWNvbm5lY3Rpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBRVAsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFTjtvQ0FDSixJQUFBLEdBQU07O29DQUNOLFVBQUEsR0FBWTs7SUFDQywrQkFBQyxNQUFELEVBQVEsR0FBUjtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQ1osSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDO01BQ3JCLElBQUMsQ0FBQSxJQUFELEdBQVEsR0FBSSxDQUFBLE9BQUE7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQTtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBSSxDQUFBLEtBQUEsQ0FBSixLQUFjO01BQzdCLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBSSxDQUFBLE1BQUE7TUFDaEIsSUFBQyxFQUFBLE9BQUEsRUFBRCxHQUFXLEdBQUksQ0FBQSxTQUFBO01BQ2YsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUFJLENBQUEsTUFBQSxDQUFKLEtBQWU7SUFQaEI7O29DQVFiLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBO0lBRE87O29DQUVWLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBO0lBREs7O29DQUVSLFFBQUEsR0FBVSxTQUFDLFFBQUQ7YUFDUixRQUFBLENBQVMsRUFBVDtJQURROzs7Ozs7RUFHTjttQ0FDSixJQUFBLEdBQU07O21DQUNOLFVBQUEsR0FBWTs7SUFDQyw4QkFBQyxTQUFELEVBQVcsR0FBWCxFQUFlLE1BQWY7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUNaLElBQUMsQ0FBQSxVQUFELEdBQWMs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SyxDQUFDLFFBQU4sQ0FBQTtJQUpNOzs7OztBQTFTViIsInNvdXJjZXNDb250ZW50IjpbIm15c3FsID0gcmVxdWlyZSAnbXlzcWwnXG5cbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmNsYXNzIFF1aWNrUXVlcnlNeXNxbENvbHVtblxuICB0eXBlOiAnY29sdW1uJ1xuICBjaGlsZF90eXBlOiBudWxsXG4gIGNvbnN0cnVjdG9yOiAoQHRhYmxlLHJvdykgLT5cbiAgICBAY29ubmVjdGlvbiA9IEB0YWJsZS5jb25uZWN0aW9uXG4gICAgQG5hbWUgPSByb3dbJ0ZpZWxkJ11cbiAgICBAY29sdW1uID0gQG5hbWUgIyBUT0RPIHJlbW92ZVxuICAgIEBwcmltYXJ5X2tleSA9IHJvd1tcIktleVwiXSA9PSBcIlBSSVwiXG4gICAgQGRhdGF0eXBlID0gcm93WydUeXBlJ11cbiAgICBAZGVmYXVsdCA9IHJvd1snRGVmYXVsdCddXG4gICAgQG51bGxhYmxlID0gcm93WydOdWxsJ10gPT0gJ1lFUydcbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEB0YWJsZVxuICBjaGlsZHJlbjogKGNhbGxiYWNrKS0+XG4gICAgY2FsbGJhY2soW10pXG5cbmNsYXNzIFF1aWNrUXVlcnlNeXNxbFRhYmxlXG4gIHR5cGU6ICd0YWJsZSdcbiAgY2hpbGRfdHlwZTogJ2NvbHVtbidcbiAgY29uc3RydWN0b3I6IChAZGF0YWJhc2Uscm93LGZpZWxkcykgLT5cbiAgICBAY29ubmVjdGlvbiA9IEBkYXRhYmFzZS5jb25uZWN0aW9uXG4gICAgQG5hbWUgPSByb3dbZmllbGRzWzBdLm5hbWVdXG4gICAgQHRhYmxlID0gQG5hbWUgIyBUT0RPIHJlbW92ZVxuICB0b1N0cmluZzogLT5cbiAgICBAbmFtZVxuICBwYXJlbnQ6IC0+XG4gICAgQGRhdGFiYXNlXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBAY29ubmVjdGlvbi5nZXRDb2x1bW5zKEAsY2FsbGJhY2spXG5jbGFzcyBRdWlja1F1ZXJ5TXlzcWxEYXRhYmFzZVxuICB0eXBlOiAnZGF0YWJhc2UnXG4gIGNoaWxkX3R5cGU6ICd0YWJsZSdcbiAgY29uc3RydWN0b3I6IChAY29ubmVjdGlvbixyb3cpIC0+XG4gICAgQG5hbWUgPSByb3dbXCJEYXRhYmFzZVwiXVxuICAgIEBkYXRhYmFzZSA9IEBuYW1lICMgVE9ETyByZW1vdmVcbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBjb25uZWN0aW9uXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICBAY29ubmVjdGlvbi5nZXRUYWJsZXMoQCxjYWxsYmFjaylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUXVpY2tRdWVyeU15c3FsQ29ubmVjdGlvblxuXG4gIGZhdGFsOiBmYWxzZVxuICBjb25uZWN0aW9uOiBudWxsXG4gIHByb3RvY29sOiAnbXlzcWwnXG4gIHR5cGU6ICdjb25uZWN0aW9uJ1xuICBjaGlsZF90eXBlOiAnZGF0YWJhc2UnXG4gIHRpbWVvdXQ6IDUwMDAgI3RpbWUgb3QgaXMgc2V0IGluIDVzLiBxdWVyaWVzIHNob3VsZCBiZSBmYXN0LlxuXG4gIG5fdHlwZXM6ICdUSU5ZSU5UIFNNQUxMSU5UIE1FRElVTUlOVCBJTlQgSU5URUdFUiBCSUdJTlQgRkxPQVQgRE9VQkxFIFJFQUwgREVDSU1BTCBOVU1FUklDIFRJTUVTVEFNUCBZRUFSIEVOVU0gU0VUJy5zcGxpdCAvXFxzKy9cbiAgc190eXBlczogJ0NIQVIgVkFSQ0hBUiBUSU5ZQkxPQiBUSU5ZVEVYVCBNRURJVU1CTE9CIE1FRElVTVRFWFQgTE9OR0JMT0IgTE9OR1RFWFQgQkxPQiBURVhUIERBVEVUSU1FIERBVEUgVElNRScuc3BsaXQgL1xccysvXG5cbiAgYWxsb3dFZGl0aW9uOiB0cnVlXG4gIEBkZWZhdWx0UG9ydDogMzMwNlxuXG4gIGNvbnN0cnVjdG9yOiAoQGluZm8pLT5cbiAgICBAaW5mby5kYXRlU3RyaW5ncyA9IHRydWVcbiAgICBAaW5mby5tdWx0aXBsZVN0YXRlbWVudHMgPSB0cnVlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG5cbiAgY29ubmVjdDogKGNhbGxiYWNrKS0+XG4gICAgQGNvbm5lY3Rpb24gPSBteXNxbC5jcmVhdGVDb25uZWN0aW9uKEBpbmZvKVxuICAgIEBjb25uZWN0aW9uLm9uICdlcnJvcicsIChlcnIpID0+XG4gICAgICBpZiBlcnIgJiYgZXJyLmNvZGUgPT0gJ1BST1RPQ09MX0NPTk5FQ1RJT05fTE9TVCdcbiAgICAgICAgQGZhdGFsID0gdHJ1ZVxuICAgIEBjb25uZWN0aW9uLmNvbm5lY3QoY2FsbGJhY2spXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGMgPSBAY29ubmVjdGlvbi5jb25maWdcbiAgICBob3N0OiBjLmhvc3QsXG4gICAgcG9ydDogYy5wb3J0LFxuICAgIHByb3RvY29sOiBAcHJvdG9jb2xcbiAgICBkYXRhYmFzZTogYy5kYXRhYmFzZSxcbiAgICB1c2VyOiBjLnVzZXIsXG4gICAgcGFzc3dvcmQ6IGMucGFzc3dvcmRcblxuICBkaXNwb3NlOiAtPlxuICAgIEBjbG9zZSgpXG5cbiAgY2xvc2U6IC0+XG4gICAgQGNvbm5lY3Rpb24uZW5kKClcblxuICBxdWVyeTogKHRleHQsY2FsbGJhY2spIC0+XG4gICAgaWYgQGZhdGFsXG4gICAgICBAY29ubmVjdGlvbiA9IG15c3FsLmNyZWF0ZUNvbm5lY3Rpb24oQGluZm8pXG4gICAgICBAY29ubmVjdGlvbi5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICBpZiBlcnIgJiYgZXJyLmNvZGUgPT0gJ1BST1RPQ09MX0NPTk5FQ1RJT05fTE9TVCdcbiAgICAgICAgICBAZmF0YWwgPSB0cnVlXG4gICAgICBAZmF0YWwgPSBmYWxzZVxuICAgIEBjb25uZWN0aW9uLnF1ZXJ5IHtzcWw6IHRleHQgLCB0aW1lb3V0OiBAdGltZW91dCB9LCAoZXJyLCByb3dzLCBmaWVsZHMpPT5cbiAgICAgIGlmIChlcnIpXG4gICAgICAgIEBmYXRhbCA9IGVyci5mYXRhbFxuICAgICAgICBjYWxsYmFjayAgdHlwZTogJ2Vycm9yJyAsIGNvbnRlbnQ6IGVyci50b1N0cmluZygpXG4gICAgICBlbHNlIGlmICFmaWVsZHNcbiAgICAgICAgY2FsbGJhY2sgdHlwZTogJ3N1Y2Nlc3MnLCBjb250ZW50OiAgcm93cy5hZmZlY3RlZFJvd3MrXCIgcm93KHMpIGFmZmVjdGVkXCJcbiAgICAgIGVsc2UgaWYgZmllbGRzLmxlbmd0aCA9PSAwIHx8ICghQXJyYXkuaXNBcnJheShmaWVsZHNbMF0pICYmIGZpZWxkc1swXT8pXG4gICAgICAgIGNhbGxiYWNrKG51bGwscm93cyxmaWVsZHMpXG4gICAgICBlbHNlICMtLSBNdWx0aXBsZSBTdGF0ZW1lbnRzXG4gICAgICAgIGFmZmVjdGVkUm93cyA9IHJvd3MubWFwIChyb3cpLT5cbiAgICAgICAgICBpZiByb3cuYWZmZWN0ZWRSb3dzPyB0aGVuIHJvdy5hZmZlY3RlZFJvd3MgZWxzZSAwXG4gICAgICAgIGFmZmVjdGVkUm93cyA9IGFmZmVjdGVkUm93cy5yZWR1Y2UgKHIxLHIyKS0+IHIxK3IyXG4gICAgICAgIGlmIGZpZWxkc1swXT8gJiYgYWZmZWN0ZWRSb3dzID09IDBcbiAgICAgICAgICBjYWxsYmFjayhudWxsLHJvd3NbMF0sZmllbGRzWzBdKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY2FsbGJhY2sgdHlwZTogJ3N1Y2Nlc3MnLCBjb250ZW50OiAgYWZmZWN0ZWRSb3dzK1wiIHJvdyhzKSBhZmZlY3RlZFwiXG5cbiAgc2V0RGVmYXVsdERhdGFiYXNlOiAoZGF0YWJhc2UpLT5cbiAgICBAY29ubmVjdGlvbi5jaGFuZ2VVc2VyIGRhdGFiYXNlOiBkYXRhYmFzZSwgPT5cbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtZGVmYXVsdC1kYXRhYmFzZScsIEBjb25uZWN0aW9uLmNvbmZpZy5kYXRhYmFzZVxuXG4gIGdldERlZmF1bHREYXRhYmFzZTogLT5cbiAgICBAY29ubmVjdGlvbi5jb25maWcuZGF0YWJhc2VcblxuICBwYXJlbnQ6IC0+IEBcblxuICBjaGlsZHJlbjogKGNhbGxiYWNrKS0+XG4gICAgQGdldERhdGFiYXNlcyAoZGF0YWJhc2VzLGVyciktPlxuICAgICAgdW5sZXNzIGVycj8gdGhlbiBjYWxsYmFjayhkYXRhYmFzZXMpIGVsc2UgY29uc29sZS5sb2cgZXJyXG5cbiAgZ2V0RGF0YWJhc2VzOiAoY2FsbGJhY2spIC0+XG4gICAgdGV4dCA9IFwiU0hPVyBEQVRBQkFTRVNcIlxuICAgIEBxdWVyeSB0ZXh0ICwgKGVyciwgcm93cywgZmllbGRzKSA9PlxuICAgICAgaWYgIWVyclxuICAgICAgICBkYXRhYmFzZXMgPSByb3dzLm1hcCAocm93KSA9PlxuICAgICAgICAgIG5ldyBRdWlja1F1ZXJ5TXlzcWxEYXRhYmFzZShALHJvdylcbiAgICAgICAgZGF0YWJhc2VzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpID0+ICFAaGlkZGVuRGF0YWJhc2UoZGF0YWJhc2UubmFtZSlcbiAgICAgIGNhbGxiYWNrKGRhdGFiYXNlcyxlcnIpXG5cbiAgZ2V0VGFibGVzOiAoZGF0YWJhc2UsY2FsbGJhY2spIC0+XG4gICAgZGF0YWJhc2VfbmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKGRhdGFiYXNlLm5hbWUpXG4gICAgdGV4dCA9IFwiU0hPVyBUQUJMRVMgSU4gI3tkYXRhYmFzZV9uYW1lfVwiXG4gICAgQHF1ZXJ5IHRleHQgLCAoZXJyLCByb3dzLCBmaWVsZHMpID0+XG4gICAgICBpZiAhZXJyXG4gICAgICAgIHRhYmxlcyA9IHJvd3MubWFwIChyb3cpID0+XG4gICAgICAgICAgbmV3IFF1aWNrUXVlcnlNeXNxbFRhYmxlKGRhdGFiYXNlLHJvdyxmaWVsZHMpXG4gICAgICAgIGNhbGxiYWNrKHRhYmxlcylcblxuICBnZXRDb2x1bW5zOiAodGFibGUsY2FsbGJhY2spIC0+XG4gICAgdGFibGVfbmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLm5hbWUpXG4gICAgZGF0YWJhc2VfbmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgdGV4dCA9IFwiU0hPVyBDT0xVTU5TIElOICN7dGFibGVfbmFtZX0gSU4gI3tkYXRhYmFzZV9uYW1lfVwiXG4gICAgQHF1ZXJ5IHRleHQgLCAoZXJyLCByb3dzLCBmaWVsZHMpID0+XG4gICAgICBpZiAhZXJyXG4gICAgICAgIGNvbHVtbnMgPSByb3dzLm1hcCAocm93KSA9PlxuICAgICAgICAgIG5ldyBRdWlja1F1ZXJ5TXlzcWxDb2x1bW4odGFibGUscm93KVxuICAgICAgICBjYWxsYmFjayhjb2x1bW5zKVxuXG4gIGhpZGRlbkRhdGFiYXNlOiAoZGF0YWJhc2UpIC0+XG4gICAgZGF0YWJhc2UgPT0gXCJpbmZvcm1hdGlvbl9zY2hlbWFcIiB8fFxuICAgIGRhdGFiYXNlID09IFwicGVyZm9ybWFuY2Vfc2NoZW1hXCIgfHxcbiAgICBkYXRhYmFzZSA9PSBcIm15c3FsXCJcblxuICBzaW1wbGVTZWxlY3Q6ICh0YWJsZSwgY29sdW1ucyA9ICcqJykgLT5cbiAgICBpZiBjb2x1bW5zICE9ICcqJ1xuICAgICAgY29sdW1ucyA9IGNvbHVtbnMubWFwIChjb2wpID0+XG4gICAgICAgIEBjb25uZWN0aW9uLmVzY2FwZUlkKGNvbC5uYW1lKVxuICAgICAgY29sdW1ucyA9IFwiXFxuIFwiK2NvbHVtbnMuam9pbihcIixcXG4gXCIpICsgXCJcXG5cIlxuICAgIHRhYmxlX25hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5uYW1lKVxuICAgIGRhdGFiYXNlX25hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5kYXRhYmFzZS5uYW1lKVxuICAgIFwiU0VMRUNUICN7Y29sdW1uc30gRlJPTSAje2RhdGFiYXNlX25hbWV9LiN7dGFibGVfbmFtZX0gTElNSVQgMTAwMFwiXG5cblxuICBjcmVhdGVEYXRhYmFzZTogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKGluZm8ubmFtZSlcbiAgICBcIkNSRUFURSBTQ0hFTUEgI3tkYXRhYmFzZX07XCJcblxuICBjcmVhdGVUYWJsZTogKG1vZGVsLGluZm8pLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLm5hbWUpXG4gICAgdGFibGUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChpbmZvLm5hbWUpXG4gICAgXCJDUkVBVEUgVEFCTEUgI3tkYXRhYmFzZX0uI3t0YWJsZX0gKCBcXG5cIitcbiAgICBcIiBgaWRgIElOVCBOT1QgTlVMTCAsXFxuXCIrXG4gICAgXCIgUFJJTUFSWSBLRVkgKGBpZGApICk7XCJcblxuICBjcmVhdGVDb2x1bW46IChtb2RlbCxpbmZvKS0+XG4gICAgZGF0YWJhc2UgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC5kYXRhYmFzZS5uYW1lKVxuICAgIHRhYmxlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwubmFtZSlcbiAgICBjb2x1bW4gPSBAY29ubmVjdGlvbi5lc2NhcGVJZChpbmZvLm5hbWUpXG4gICAgbnVsbGFibGUgPSBpZiBpbmZvLm51bGxhYmxlIHRoZW4gJ05VTEwnIGVsc2UgJ05PVCBOVUxMJ1xuICAgIGRhZmF1bHRWYWx1ZSA9IEBlc2NhcGUoaW5mby5kZWZhdWx0LGluZm8uZGF0YXR5cGUpIHx8ICdOVUxMJ1xuICAgIFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3t0YWJsZX0gQUREIENPTFVNTiAje2NvbHVtbn1cIitcbiAgICBcIiAje2luZm8uZGF0YXR5cGV9ICN7bnVsbGFibGV9IERFRkFVTFQgI3tkYWZhdWx0VmFsdWV9O1wiXG5cblxuICBhbHRlclRhYmxlOiAobW9kZWwsZGVsdGEpLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLmRhdGFiYXNlLm5hbWUpXG4gICAgbmV3TmFtZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKGRlbHRhLm5ld19uYW1lKVxuICAgIG9sZE5hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChkZWx0YS5vbGRfbmFtZSlcbiAgICBxdWVyeSA9IFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3tvbGROYW1lfSBSRU5BTUUgVE8gI3tkYXRhYmFzZX0uI3tuZXdOYW1lfTtcIlxuXG4gIGFsdGVyQ29sdW1uOiAobW9kZWwsZGVsdGEpLT5cbiAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLnRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgdGFibGUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC50YWJsZS5uYW1lKVxuICAgIG5ld05hbWUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChkZWx0YS5uZXdfbmFtZSlcbiAgICBvbGROYW1lID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQoZGVsdGEub2xkX25hbWUpXG4gICAgbnVsbGFibGUgPSBpZiBkZWx0YS5udWxsYWJsZSB0aGVuICdOVUxMJyBlbHNlICdOT1QgTlVMTCdcbiAgICBkYWZhdWx0VmFsdWUgPSBAZXNjYXBlKGRlbHRhLmRlZmF1bHQsZGVsdGEuZGF0YXR5cGUpIHx8ICdOVUxMJ1xuICAgIFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3t0YWJsZX0gQ0hBTkdFIENPTFVNTiAje29sZE5hbWV9ICN7bmV3TmFtZX1cIitcbiAgICBcIiAje2RlbHRhLmRhdGF0eXBlfSAje251bGxhYmxlfSBERUZBVUxUICN7ZGFmYXVsdFZhbHVlfTtcIlxuXG4gIGRyb3BEYXRhYmFzZTogKG1vZGVsKS0+XG4gICAgZGF0YWJhc2UgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC5uYW1lKVxuICAgIFwiRFJPUCBTQ0hFTUEgI3tkYXRhYmFzZX07XCJcblxuICBkcm9wVGFibGU6IChtb2RlbCktPlxuICAgIGRhdGFiYXNlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwuZGF0YWJhc2UubmFtZSlcbiAgICB0YWJsZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKG1vZGVsLm5hbWUpXG4gICAgXCJEUk9QIFRBQkxFICN7ZGF0YWJhc2V9LiN7dGFibGV9O1wiXG5cbiAgZHJvcENvbHVtbjogKG1vZGVsKS0+XG4gICAgZGF0YWJhc2UgPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC50YWJsZS5kYXRhYmFzZS5uYW1lKVxuICAgIHRhYmxlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQobW9kZWwudGFibGUubmFtZSlcbiAgICBjb2x1bW4gPSBAY29ubmVjdGlvbi5lc2NhcGVJZChtb2RlbC5uYW1lKVxuICAgIFwiQUxURVIgVEFCTEUgI3tkYXRhYmFzZX0uI3t0YWJsZX0gRFJPUCBDT0xVTU4gI3tjb2x1bW59O1wiXG5cblxuICB1cGRhdGVSZWNvcmQ6IChyb3csZmllbGRzLHZhbHVlcyktPlxuICAgIHRhYmxlcyA9IEBfdGFibGVHcm91cChmaWVsZHMpXG4gICAgZm9yIG5hbWUsdGFibGUgb2YgdGFibGVzXG4gICAgICBAZ2V0Q29sdW1ucyB0YWJsZSwgKGNvbHVtbnMpPT5cbiAgICAgICAga2V5cyA9IChrZXkgZm9yIGtleSBpbiBjb2x1bW5zIHdoZW4ga2V5LnByaW1hcnlfa2V5KVxuICAgICAgICBhbGxrZXlzID0gdHJ1ZVxuICAgICAgICBhbGxrZXlzICY9IHJvd1trZXkubmFtZV0/IGZvciBrZXkgaW4ga2V5c1xuICAgICAgICBpZiBhbGxrZXlzICYmIGtleXMubGVuZ3RoID4gMFxuICAgICAgICAgIGFzc2luZ3MgPSBmaWVsZHMubWFwIChmaWVsZCkgPT5cbiAgICAgICAgICAgIGNvbHVtbiA9IChjb2x1bW4gZm9yIGNvbHVtbiBpbiBjb2x1bW5zIHdoZW4gY29sdW1uLm5hbWUgPT0gZmllbGQub3JnTmFtZSlbMF1cbiAgICAgICAgICAgIFwiI3tAY29ubmVjdGlvbi5lc2NhcGVJZChmaWVsZC5vcmdOYW1lKX0gPSAje0Blc2NhcGUodmFsdWVzW2ZpZWxkLm5hbWVdLGNvbHVtbi5kYXRhdHlwZSl9XCJcbiAgICAgICAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgICAgdGFibGUgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5uYW1lKVxuICAgICAgICAgIHdoZXJlID0ga2V5cy5tYXAgKGtleSk9PiBcIiN7QGNvbm5lY3Rpb24uZXNjYXBlSWQoa2V5Lm5hbWUpfSA9ICN7QGVzY2FwZShyb3dba2V5Lm5hbWVdLGtleS5kYXRhdHlwZSl9XCJcbiAgICAgICAgICB1cGRhdGUgPSBcIlVQREFURSAje2RhdGFiYXNlfS4je3RhYmxlfVwiK1xuICAgICAgICAgIFwiIFNFVCAje2Fzc2luZ3Muam9pbignLCcpfVwiK1xuICAgICAgICAgIFwiIFdIRVJFIFwiK3doZXJlLmpvaW4oJyBBTkQgJykrXCI7XCJcbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICdzZW50ZW5jZS1yZWFkeScsIHVwZGF0ZVxuXG4gIGluc2VydFJlY29yZDogKGZpZWxkcyx2YWx1ZXMpLT5cbiAgICB0YWJsZXMgPSBAX3RhYmxlR3JvdXAoZmllbGRzKVxuICAgIGZvciBuYW1lLHRhYmxlIG9mIHRhYmxlc1xuICAgICAgQGdldENvbHVtbnMgdGFibGUsIChjb2x1bW5zKT0+XG4gICAgICAgIGFyeWZpZWxkcyA9IHRhYmxlLmZpZWxkcy5tYXAgKGZpZWxkKSA9PlxuICAgICAgICAgIEBjb25uZWN0aW9uLmVzY2FwZUlkKGZpZWxkLm9yZ05hbWUpXG4gICAgICAgIHN0cmZpZWxkcyA9IGFyeWZpZWxkcy5qb2luKCcsJylcbiAgICAgICAgYXJ5dmFsdWVzID0gdGFibGUuZmllbGRzLm1hcCAoZmllbGQpID0+XG4gICAgICAgICAgY29sdW1uID0gKGNvbHVtbiBmb3IgY29sdW1uIGluIGNvbHVtbnMgd2hlbiBjb2x1bW4ubmFtZSA9PSBmaWVsZC5vcmdOYW1lKVswXVxuICAgICAgICAgIEBlc2NhcGUodmFsdWVzW2ZpZWxkLm5hbWVdLGNvbHVtbi5kYXRhdHlwZSlcbiAgICAgICAgc3RydmFsdWVzID0gYXJ5dmFsdWVzLmpvaW4oJywnKVxuICAgICAgICBkYXRhYmFzZSA9IEBjb25uZWN0aW9uLmVzY2FwZUlkKHRhYmxlLmRhdGFiYXNlLm5hbWUpXG4gICAgICAgIHRhYmxlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQodGFibGUubmFtZSlcbiAgICAgICAgaW5zZXJ0ID0gXCJJTlNFUlQgSU5UTyAje2RhdGFiYXNlfS4je3RhYmxlfVwiK1xuICAgICAgICBcIiAoI3tzdHJmaWVsZHN9KSBWQUxVRVMgKCN7c3RydmFsdWVzfSk7XCJcbiAgICAgICAgQGVtaXR0ZXIuZW1pdCAnc2VudGVuY2UtcmVhZHknLCBpbnNlcnRcblxuICBkZWxldGVSZWNvcmQ6IChyb3csZmllbGRzKS0+XG4gICAgdGFibGVzID0gQF90YWJsZUdyb3VwKGZpZWxkcylcbiAgICBmb3IgbmFtZSx0YWJsZSBvZiB0YWJsZXNcbiAgICAgIEBnZXRDb2x1bW5zIHRhYmxlLCAoY29sdW1ucyk9PlxuICAgICAgICBrZXlzID0gKGtleSBmb3Iga2V5IGluIGNvbHVtbnMgd2hlbiBrZXkucHJpbWFyeV9rZXkpXG4gICAgICAgIGFsbGtleXMgPSB0cnVlXG4gICAgICAgIGFsbGtleXMgJj0gcm93W2tleS5uYW1lXT8gZm9yIGtleSBpbiBrZXlzXG4gICAgICAgIGlmIGFsbGtleXMgJiYga2V5cy5sZW5ndGggPiAwXG4gICAgICAgICAgZGF0YWJhc2UgPSBAY29ubmVjdGlvbi5lc2NhcGVJZCh0YWJsZS5kYXRhYmFzZS5uYW1lKVxuICAgICAgICAgIHRhYmxlID0gQGNvbm5lY3Rpb24uZXNjYXBlSWQodGFibGUubmFtZSlcbiAgICAgICAgICB3aGVyZSA9IGtleXMubWFwIChrZXkpPT4gXCIje0Bjb25uZWN0aW9uLmVzY2FwZUlkKGtleS5uYW1lKX0gPSAje0Blc2NhcGUocm93W2tleS5uYW1lXSxrZXkuZGF0YXR5cGUpfVwiXG4gICAgICAgICAgZGVsID0gXCJERUxFVEUgRlJPTSAje2RhdGFiYXNlfS4je3RhYmxlfVwiK1xuICAgICAgICAgIFwiIFdIRVJFIFwiK3doZXJlLmpvaW4oJyBBTkQgJykrXCI7XCJcbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICdzZW50ZW5jZS1yZWFkeScsIGRlbFxuXG4gIF90YWJsZUdyb3VwOiAoZmllbGRzKS0+XG4gICAgdGFibGVzID0ge31cbiAgICBmb3IgZmllbGQgaW4gZmllbGRzXG4gICAgICBpZiBmaWVsZC5vcmdUYWJsZT9cbiAgICAgICAgdGFibGVzW2ZpZWxkLm9yZ1RhYmxlXSA/PVxuICAgICAgICAgIG5hbWU6IGZpZWxkLm9yZ1RhYmxlXG4gICAgICAgICAgZGF0YWJhc2U6IHtuYW1lOiBmaWVsZC5kYn1cbiAgICAgICAgICBmaWVsZHM6IFtdXG4gICAgICAgIHRhYmxlc1tmaWVsZC5vcmdUYWJsZV0uZmllbGRzLnB1c2goZmllbGQpXG4gICAgdGFibGVzXG5cbiAgc2VudGVuY2VSZWFkeTogKGNhbGxiYWNrKS0+XG4gICAgQGVtaXR0ZXIub24gJ3NlbnRlbmNlLXJlYWR5JywgY2FsbGJhY2tcblxuICBvbkRpZENoYW5nZURlZmF1bHREYXRhYmFzZTogKGNhbGxiYWNrKS0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtZGVmYXVsdC1kYXRhYmFzZScsIGNhbGxiYWNrXG5cbiAgZ2V0RGF0YVR5cGVzOiAtPlxuICAgIEBuX3R5cGVzLmNvbmNhdChAc190eXBlcylcblxuICB0b1N0cmluZzogLT5cbiAgICBAcHJvdG9jb2wrXCI6Ly9cIitAY29ubmVjdGlvbi5jb25maWcudXNlcitcIkBcIitAY29ubmVjdGlvbi5jb25maWcuaG9zdFxuXG4gIGVzY2FwZTogKHZhbHVlLHR5cGUpLT5cbiAgICBmb3IgdDEgaW4gQHNfdHlwZXNcbiAgICAgIGlmIHZhbHVlID09IG51bGwgfHwgdHlwZS5zZWFyY2gobmV3IFJlZ0V4cCh0MSwgXCJpXCIpKSAhPSAtMVxuICAgICAgICByZXR1cm4gQGNvbm5lY3Rpb24uZXNjYXBlKHZhbHVlKVxuICAgIHZhbHVlLnRvU3RyaW5nKClcbiJdfQ==
