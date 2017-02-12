(function() {
  var QuickQueryCachedConnection, QuickQueryCachedDatabase, QuickQueryCachedSchema, QuickQueryCachedTable;

  QuickQueryCachedTable = (function() {
    QuickQueryCachedTable.prototype.type = 'table';

    QuickQueryCachedTable.prototype.child_type = 'column';

    function QuickQueryCachedTable(parent, real) {
      this.parent = parent;
      this.real = real;
      this.connection = this.parent.connection;
      this.name = this.real.name;
    }

    QuickQueryCachedTable.prototype.toString = function() {
      return this.name;
    };

    QuickQueryCachedTable.prototype.parent = function() {
      return this.parent;
    };

    QuickQueryCachedTable.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.connection.timeout * 1000) {
        this.last = time;
        return this.real.children((function(_this) {
          return function(childs1) {
            _this.childs = childs1;
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    return QuickQueryCachedTable;

  })();

  QuickQueryCachedSchema = (function() {
    QuickQueryCachedSchema.prototype.type = 'schema';

    QuickQueryCachedSchema.prototype.child_type = 'table';

    function QuickQueryCachedSchema(database, real) {
      this.database = database;
      this.real = real;
      this.connection = this.database.connection;
      this.name = this.real.name;
    }

    QuickQueryCachedSchema.prototype.toString = function() {
      return this.name;
    };

    QuickQueryCachedSchema.prototype.parent = function() {
      return this.database;
    };

    QuickQueryCachedSchema.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.connection.timeout * 1000) {
        this.last = time;
        return this.real.children((function(_this) {
          return function(childs) {
            _this.childs = childs.map(function(child) {
              return new QuickQueryCachedTable(_this, child);
            });
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    return QuickQueryCachedSchema;

  })();

  QuickQueryCachedDatabase = (function() {
    QuickQueryCachedDatabase.prototype.type = 'database';

    function QuickQueryCachedDatabase(connection, real) {
      this.connection = connection;
      this.real = real;
      this.name = this.real.name;
      this.child_type = this.real.child_type;
    }

    QuickQueryCachedDatabase.prototype.toString = function() {
      return this.name;
    };

    QuickQueryCachedDatabase.prototype.parent = function() {
      return this.connection;
    };

    QuickQueryCachedDatabase.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.connection.timeout * 1000) {
        this.last = time;
        return this.real.children((function(_this) {
          return function(childs) {
            if (_this.child_type === 'schema') {
              _this.childs = childs.map(function(child) {
                return new QuickQueryCachedSchema(_this, child);
              });
            } else {
              _this.childs = childs.map(function(child) {
                return new QuickQueryCachedTable(_this, child);
              });
            }
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    return QuickQueryCachedDatabase;

  })();

  module.exports = QuickQueryCachedConnection = (function() {
    QuickQueryCachedConnection.prototype.type = 'connection';

    QuickQueryCachedConnection.prototype.child_type = 'database';

    function QuickQueryCachedConnection(info) {
      this.realConnection = info.connection;
      this.protocol = this.realConnection.protocol;
      this.timeout = info.timeout;
      if (this.timeout == null) {
        this.timeout = 15;
      }
      this.last = null;
    }

    QuickQueryCachedConnection.prototype.getDefaultDatabase = function() {
      return this.realConnection.getDefaultDatabase();
    };

    QuickQueryCachedConnection.prototype.children = function(callback) {
      var time;
      time = Date.now();
      if ((this.last == null) || time - this.last > this.timeout * 1000) {
        this.last = time;
        return this.realConnection.children((function(_this) {
          return function(childs) {
            _this.childs = childs.map(function(child) {
              return new QuickQueryCachedDatabase(_this, child);
            });
            return callback(_this.childs);
          };
        })(this));
      } else {
        return callback(this.childs);
      }
    };

    QuickQueryCachedConnection.prototype.query = function(str) {
      return this.realConnection.query(str);
    };

    QuickQueryCachedConnection.prototype.simpleSelect = function(table, columns) {
      if (columns == null) {
        columns = '*';
      }
      return this.realConnection.simpleSelect(table, columns);
    };

    return QuickQueryCachedConnection;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LWNhY2hlZC1jb25uZWN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQU07b0NBQ0osSUFBQSxHQUFNOztvQ0FDTixVQUFBLEdBQVk7O0lBQ0MsK0JBQUMsTUFBRCxFQUFTLElBQVQ7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFRLElBQUMsQ0FBQSxPQUFEO01BQ3BCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE1BQU0sQ0FBQztNQUN0QixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFGSDs7b0NBR2IsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUE7SUFETzs7b0NBRVYsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUE7SUFESzs7b0NBRVIsUUFBQSxHQUFVLFNBQUMsUUFBRDtBQUNSLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBQTtNQUNQLElBQUksbUJBQUQsSUFBVyxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQVIsR0FBZ0IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLEdBQXNCLElBQXBEO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUTtlQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsT0FBRDtZQUFDLEtBQUMsQ0FBQSxTQUFEO21CQUNkLFFBQUEsQ0FBUyxLQUFDLENBQUEsTUFBVjtVQURhO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmLEVBRkY7T0FBQSxNQUFBO2VBS0UsUUFBQSxDQUFTLElBQUMsQ0FBQSxNQUFWLEVBTEY7O0lBRlE7Ozs7OztFQVNOO3FDQUNKLElBQUEsR0FBTTs7cUNBQ04sVUFB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J3RhYmxlJ1xuICBjaGlsZF90eXBlOiAnY29sdW1uJ1xuICBjb25zdHJ1Y3RvcjogKEBwYXJlbnQsQHJlYWwpIC0+XG4gICAgQGNvbm5lY3Rpb24gPSBAcGFyZW50LmNvbm5lY3Rpb25cbiAgICBAbmFtZSA9IEByZWFsLm5hbWVcbiAgdG9TdHJpbmc6IC0+XG4gICAgQG5hbWVcbiAgcGFyZW50OiAtPlxuICAgIEBwYXJlbnRcbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIHRpbWUgPSBEYXRlLm5vdygpXG4gICAgaWYgIUBsYXN0PyB8fCB0aW1lIC0gQGxhc3QgPiAgQGNvbm5lY3Rpb24udGltZW91dCAqIDEwMDBcbiAgICAgIEBsYXN0ID0gdGltZVxuICAgICAgQHJlYWwuY2hpbGRyZW4gKEBjaGlsZHMpPT5cbiAgICAgICAgY2FsbGJhY2soQGNoaWxkcylcbiAgICBlbHNlXG4gICAgICBjYWxsYmFjayhAY2hpbGRzKVxuXG5jbGFzcyBRdWlja1F1ZXJ5Q2FjaGVkU2NoZW1hXG4gIHR5cGU6ICdzY2hlbWEnXG4gIGNoaWxkX3R5cGU6ICd0YWJsZSdcbiAgY29uc3RydWN0b3I6IChAZGF0YWJhc2UsQHJlYWwpIC0+XG4gICAgQGNvbm5lY3Rpb24gPSBAZGF0YWJhc2UuY29ubmVjdGlvblxuICAgIEBuYW1lID0gQHJlYWwubmFtZVxuICB0b1N0cmluZzogLT5cbiAgICBAbmFtZVxuICBwYXJlbnQ6IC0+XG4gICAgQGRhdGFiYXNlXG4gIGNoaWxkcmVuOiAoY2FsbGJhY2spLT5cbiAgICB0aW1lID0gRGF0ZS5ub3coKVxuICAgIGlmICFAbGFzdD8gfHwgdGltZSAtIEBsYXN0ID4gIEBjb25uZWN0aW9uLnRpbWVvdXQgKiAxMDAwXG4gICAgICBAbGFzdCA9IHRpbWVcbiAgICAgIEByZWFsLmNoaWxkcmVuIChjaGlsZHMpPT5cbiAgICAgICAgQGNoaWxkcyA9IGNoaWxkcy5tYXAgKGNoaWxkKT0+IG5ldyBRdWlja1F1ZXJ5Q2FjaGVkVGFibGUoQCxjaGlsZClcbiAgICAgICAgY2FsbGJhY2soQGNoaWxkcylcbiAgICBlbHNlXG4gICAgICBjYWxsYmFjayhAY2hpbGRzKVxuXG5jbGFzcyBRdWlja1F1ZXJ5Q2FjaGVkRGF0YWJhc2VcbiAgdHlwZTogJ2RhdGFiYXNlJ1xuICBjb25zdHJ1Y3RvcjogKEBjb25uZWN0aW9uLEByZWFsKSAtPlxuICAgIEBuYW1lID0gQHJlYWwubmFtZVxuICAgIEBjaGlsZF90eXBlID0gQHJlYWwuY2hpbGRfdHlwZVxuICB0b1N0cmluZzogLT5cbiAgICBAbmFtZVxuICBwYXJlbnQ6IC0+XG4gICAgQGNvbm5lY3Rpb25cbiAgY2hpbGRyZW46IChjYWxsYmFjayktPlxuICAgIHRpbWUgPSBEYXRlLm5vdygpXG4gICAgaWYgIUBsYXN0PyB8fCB0aW1lIC0gQGxhc3QgPiAgQGNvbm5lY3Rpb24udGltZW91dCAqIDEwMDBcbiAgICAgIEBsYXN0ID0gdGltZVxuICAgICAgQHJlYWwuY2hpbGRyZW4gKGNoaWxkcyk9PlxuICAgICAgICBpZiBAY2hpbGRfdHlwZSA9PSAnc2NoZW1hJ1xuICAgICAgICAgIEBjaGlsZHMgPSBjaGlsZHMubWFwIChjaGlsZCk9PiBuZXcgUXVpY2tRdWVyeUNhY2hlZFNjaGVtYShALGNoaWxkKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGNoaWxkcyA9IGNoaWxkcy5tYXAgKGNoaWxkKT0+IG5ldyBRdWlja1F1ZXJ5Q2FjaGVkVGFibGUoQCxjaGlsZClcbiAgICAgICAgY2FsbGJhY2soQGNoaWxkcylcbiAgICBlbHNlXG4gICAgICBjYWxsYmFjayhAY2hpbGRzKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFF1aWNrUXVlcnlDYWNoZWRDb25uZWN0aW9uXG5cbiAgdHlwZTogJ2Nvbm5lY3Rpb24nXG4gIGNoaWxkX3R5cGU6ICdkYXRhYmFzZSdcblxuICBjb25zdHJ1Y3RvcjogKGluZm8pLT5cbiAgICBAcmVhbENvbm5lY3Rpb24gPSBpbmZvLmNvbm5lY3Rpb25cbiAgICBAcHJvdG9jb2wgPSBAcmVhbENvbm5lY3Rpb24ucHJvdG9jb2xcbiAgICBAdGltZW91dCA9IGluZm8udGltZW91dFxuICAgIEB0aW1lb3V0ID89IDE1ICNzZWNvbmRzXG4gICAgQGxhc3QgPSBudWxsXG5cbiAgZ2V0RGVmYXVsdERhdGFiYXNlOiAtPiBAcmVhbENvbm5lY3Rpb24uZ2V0RGVmYXVsdERhdGFiYXNlKClcblxuICBjaGlsZHJlbjogKGNhbGxiYWNrKS0+XG4gICAgdGltZSA9IERhdGUubm93KClcbiAgICBpZiAhQGxhc3Q/IHx8IHRpbWUgLSBAbGFzdCA+ICBAdGltZW91dCAqIDEwMDBcbiAgICAgIEBsYXN0ID0gdGltZVxuICAgICAgQHJlYWxDb25uZWN0aW9uLmNoaWxkcmVuIChjaGlsZHMpID0+XG4gICAgICAgIEBjaGlsZHMgPSBjaGlsZHMubWFwIChjaGlsZCk9PiBuZXcgUXVpY2tRdWVyeUNhY2hlZERhdGFiYXNlKEAsY2hpbGQpXG4gICAgICAgIGNhbGxiYWNrKEBjaGlsZHMpXG4gICAgZWxzZVxuICAgICAgY2FsbGJhY2soQGNoaWxkcylcblxuICBxdWVyeTogKHN0cikgLT4gQHJlYWxDb25uZWN0aW9uLnF1ZXJ5KHN0cikgI3Nob3VsZCBJIGNhY2hlIHRoaXM/XG5cbiAgc2ltcGxlU2VsZWN0OiAodGFibGUsY29sdW1ucz0nKicpLT5cbiAgICBAcmVhbENvbm5lY3Rpb24uc2ltcGxlU2VsZWN0KHRhYmxlLGNvbHVtbnMpXG4iXX0=
