(function() {
  var QuickQueryAutocomplete, QuickQueryCachedConnection;

  QuickQueryCachedConnection = require('./quick-query-cached-connection');

  module.exports = QuickQueryAutocomplete = (function() {
    QuickQueryAutocomplete.prototype.selector = '.source.sql';

    QuickQueryAutocomplete.prototype.disableForSelector = '.source.sql .comment, .source.sql .string.quoted.single';

    QuickQueryAutocomplete.prototype.excludeLowerPriority = false;

    function QuickQueryAutocomplete(browser) {
      if (browser.connection != null) {
        this.connection = new QuickQueryCachedConnection({
          connection: browser.connection
        });
      }
      browser.onConnectionDeleted((function(_this) {
        return function(connection) {
          return _this.connection = null;
        };
      })(this));
      browser.onConnectionSelected((function(_this) {
        return function(connection) {
          return _this.connection = new QuickQueryCachedConnection({
            connection: connection
          });
        };
      })(this));
    }

    QuickQueryAutocomplete.prototype.prepareSugestions = function(suggestions, prefix) {
      suggestions = suggestions.sort(function(s1, s2) {
        return Math.sign(s1.score - s2.score);
      });
      return suggestions.map(function(item) {
        if (item.type === 'table') {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-table',
            iconHTML: '<i class="icon-browser"></i>'
          };
        } else if (item.type === 'schema') {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-schema',
            iconHTML: '<i class="icon-book"></i>'
          };
        } else if (item.type === 'database') {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-database',
            iconHTML: '<i class="icon-database"></i>'
          };
        } else {
          return {
            text: item.text,
            displayText: item.text,
            replacementPrefix: prefix,
            type: 'qq-column',
            iconHTML: item.type === 'key' ? '<i class="icon-key"></i>' : '<i class="icon-tag"></i>'
          };
        }
      });
    };

    QuickQueryAutocomplete.prototype.getScore = function(string, prefix) {
      return string.indexOf(prefix);
    };

    QuickQueryAutocomplete.prototype.getSuggestions = function(arg) {
      var activatedManually, bufferPosition, editor, prefix, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix, activatedManually = arg.activatedManually;
      if (prefix.length < 2 || (this.connection == null) || !atom.config.get('quick-query.autompleteIntegration')) {
        return [];
      }
      return new Promise((function(_this) {
        return function(resolve) {
          var defaultDatabase, editor_text, lwr_prefix, suggestions;
          lwr_prefix = prefix.toLowerCase();
          editor_text = editor.getText().toLowerCase();
          defaultDatabase = _this.connection.getDefaultDatabase();
          suggestions = [];
          return _this.connection.children(function(databases) {
            var database, i, j, len, len1, lwr_database, results, score;
            if (activatedManually) {
              for (i = 0, len = databases.length; i < len; i++) {
                database = databases[i];
                lwr_database = database.name.toLowerCase();
                score = _this.getScore(lwr_database, lwr_prefix);
                if ((score != null) && score !== -1) {
                  suggestions.push({
                    text: database.name,
                    lower: lwr_database,
                    score: score,
                    type: 'database'
                  });
                }
              }
            }
            results = [];
            for (j = 0, len1 = databases.length; j < len1; j++) {
              database = databases[j];
              if (defaultDatabase === database.name) {
                results.push(database.children(function(items) {
                  if (database.child_type === 'schema') {
                    return _this.getSchemasSuggestions(items, suggestions, lwr_prefix, editor_text, activatedManually, function() {
                      return resolve(_this.prepareSugestions(suggestions, prefix));
                    });
                  } else {
                    return _this.getTablesSuggestions(items, suggestions, lwr_prefix, editor_text, function() {
                      return resolve(_this.prepareSugestions(suggestions, prefix));
                    });
                  }
                }));
              }
            }
            return results;
          });
        };
      })(this));
    };

    QuickQueryAutocomplete.prototype.getSchemasSuggestions = function(schemas, suggestions, prefix, editor_text, activatedManually, fn) {
      var i, len, lwr_schema, remain, results, schema, score;
      remain = schemas.length;
      if (remain === 0) {
        fn();
      }
      results = [];
      for (i = 0, len = schemas.length; i < len; i++) {
        schema = schemas[i];
        if (activatedManually) {
          lwr_schema = schema.name.toLowerCase();
          score = this.getScore(lwr_schema, prefix);
          if ((score != null) && score !== -1) {
            suggestions.push({
              text: schema.name,
              lower: lwr_schema,
              score: score,
              type: 'schema'
            });
          }
        }
        results.push(schema.children((function(_this) {
          return function(tables) {
            return _this.getTablesSuggestions(tables, suggestions, prefix, editor_text, function() {
              remain--;
              if (remain === 0) {
                return fn();
              }
            });
          };
        })(this)));
      }
      return results;
    };

    QuickQueryAutocomplete.prototype.getTablesSuggestions = function(tables, suggestions, prefix, editor_text, fn) {
      var i, len, lwr_table, remain, results, score, table;
      remain = tables.length;
      if (remain === 0) {
        fn();
      }
      results = [];
      for (i = 0, len = tables.length; i < len; i++) {
        table = tables[i];
        lwr_table = table.name.toLowerCase();
        score = this.getScore(lwr_table, prefix);
        if ((score != null) && score !== -1) {
          suggestions.push({
            text: table.name,
            lower: lwr_table,
            score: score,
            type: 'table'
          });
        }
        if (editor_text.includes(lwr_table)) {
          results.push(table.children((function(_this) {
            return function(columns) {
              var column, j, len1, lwr_column;
              for (j = 0, len1 = columns.length; j < len1; j++) {
                column = columns[j];
                lwr_column = column.name.toLowerCase();
                score = _this.getScore(lwr_column, prefix);
                if ((score != null) && score !== -1) {
                  suggestions.push({
                    text: column.name,
                    lower: lwr_table,
                    score: score,
                    type: column.primary_key ? 'key' : 'column'
                  });
                }
              }
              remain--;
              if (remain === 0) {
                return fn();
              }
            };
          })(this)));
        } else {
          remain--;
          if (remain === 0) {
            results.push(fn());
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    return QuickQueryAutocomplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LWF1dG9jb21wbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLDBCQUFBLEdBQTZCLE9BQUEsQ0FBUSxpQ0FBUjs7RUFFN0IsTUFBTSxDQUFDLE9BQVAsR0FBdUI7cUNBQ3JCLFFBQUEsR0FBVTs7cUNBQ1Ysa0JBQUEsR0FBb0I7O3FDQUNwQixvQkFBQSxHQUFzQjs7SUFFVixnQ0FBQyxPQUFEO01BR1YsSUFBRywwQkFBSDtRQUNFLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsMEJBQUEsQ0FBMkI7VUFBQSxVQUFBLEVBQVksT0FBTyxDQUFDLFVBQXBCO1NBQTNCLEVBRHBCOztNQUVBLE9BQU8sQ0FBQyxtQkFBUixDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtpQkFBZSxLQUFDLENBQUEsVUFBRCxHQUFjO1FBQTdCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtNQUNBLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsVUFBRDtpQkFDM0IsS0FBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSwwQkFBQSxDQUEyQjtZQUFBLFVBQUEsRUFBYSxVQUFiO1dBQTNCO1FBRFM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO0lBTlU7O3FDQVVaLGlCQUFBLEdBQW1CLFNBQUMsV0FBRCxFQUFhLE1BQWI7TUFDakIsV0FBQSxHQUFjLFdBQVcsQ0FBQyxJQUFaLENBQWlCLFNBQUMsRUFBRCxFQUFJLEVBQUo7ZUFBVSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxLQUFILEdBQVcsRUFBRSxDQUFDLEtBQXhCO01BQVYsQ0FBakI7YUFDZCxXQUFXLENBQUMsR0FBWixDQUFnQixT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QUFDLElBQVosQ0FDRTtvQkFBQSxJQUFBLEVBQU0sTUFBTSxDQUFDLElBQWI7b0JBQ0EsS0FBQSxFQUFPLFNBRFA7b0JBRUEsS0FBQSxFQUFPLEtBRlA7b0JBR0EsSUFBQSxFQUFTLE1BQU0sQ0FBQyxXQUFWLEdBQTJCLEtBQTNCLEdBQXNDLFFBSDVDO21CQURGLEVBREY7O0FBSEY7Y0FTQSxNQUFBO2NBQVUsSUFBUSxNQUFBLEtBQVUsQ0FBbEI7dUJBQUEsRUFBQSxDQUFBLEVBQUE7O1lBVkc7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsR0FERjtTQUFBLE1BQUE7VUFhRSxNQUFBO1VBQVUsSUFBUSxNQUFBLEtBQVUsQ0FBbEI7eUJBQUEsRUFBQSxDQUFBLEdBQUE7V0FBQSxNQUFBO2lDQUFBO1dBYlo7O0FBVEY7O0lBSG9COzs7OztBQWhHeEIiLCJzb3VyY2VzQ29udGVudCI6WyJRdWlja1F1ZXJ5Q2FjaGVkQ29ubmVjdGlvbiA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktY2FjaGVkLWNvbm5lY3Rpb24nXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUXVpY2tRdWVyeUF1dG9jb21wbGV0ZVxuICBzZWxlY3RvcjogJy5zb3VyY2Uuc3FsJ1xuICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnNxbCAuY29tbWVudCwgLnNvdXJjZS5zcWwgLnN0cmluZy5xdW90ZWQuc2luZ2xlJ1xuICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjooYnJvd3NlciktPlxuICAgICMgQGNvbm5lY3Rpb24gPSBicm93c2VyLmNvbm5lY3Rpb25cbiAgICAjIGJyb3dzZXIub25Db25uZWN0aW9uU2VsZWN0ZWQgKEBjb25uZWN0aW9uKT0+XG4gICAgaWYgYnJvd3Nlci5jb25uZWN0aW9uP1xuICAgICAgQGNvbm5lY3Rpb24gPSBuZXcgUXVpY2tRdWVyeUNhY2hlZENvbm5lY3Rpb24oY29ubmVjdGlvbjogYnJvd3Nlci5jb25uZWN0aW9uKVxuICAgIGJyb3dzZXIub25Db25uZWN0aW9uRGVsZXRlZCAoY29ubmVjdGlvbik9PiBAY29ubmVjdGlvbiA9IG51bGxcbiAgICBicm93c2VyLm9uQ29ubmVjdGlvblNlbGVjdGVkIChjb25uZWN0aW9uKT0+XG4gICAgICBAY29ubmVjdGlvbiA9IG5ldyBRdWlja1F1ZXJ5Q2FjaGVkQ29ubmVjdGlvbihjb25uZWN0aW9uOiAgY29ubmVjdGlvbilcblxuXG4gIHByZXBhcmVTdWdlc3Rpb25zOiAoc3VnZ2VzdGlvbnMscHJlZml4KS0+XG4gICAgc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5zb3J0KChzMSxzMiktPiBNYXRoLnNpZ24oczEuc2NvcmUgLSBzMi5zY29yZSApKVxuICAgIHN1Z2dlc3Rpb25zLm1hcCAoaXRlbSktPlxuICAgICAgaWYgaXRlbS50eXBlID09ICd0YWJsZSdcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtdGFibGUnXG4gICAgICAgIGljb25IVE1MOiAnPGkgY2xhc3M9XCJpY29uLWJyb3dzZXJcIj48L2k+J1xuICAgICAgZWxzZSBpZiBpdGVtLnR5cGUgPT0gJ3NjaGVtYSdcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtc2NoZW1hJ1xuICAgICAgICBpY29uSFRNTDogJzxpIGNsYXNzPVwiaWNvbi1ib29rXCI+PC9pPidcbiAgICAgIGVsc2UgaWYgaXRlbS50eXBlID09ICdkYXRhYmFzZSdcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtZGF0YWJhc2UnXG4gICAgICAgIGljb25IVE1MOiAnPGkgY2xhc3M9XCJpY29uLWRhdGFiYXNlXCI+PC9pPidcbiAgICAgIGVsc2VcbiAgICAgICAgdGV4dDogaXRlbS50ZXh0XG4gICAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLnRleHRcbiAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXg6IHByZWZpeFxuICAgICAgICB0eXBlOiAncXEtY29sdW1uJ1xuICAgICAgICBpY29uSFRNTDogaWYgaXRlbS50eXBlID09ICdrZXknXG4gICAgICAgICAgICAnPGkgY2xhc3M9XCJpY29uLWtleVwiPjwvaT4nXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgJzxpIGNsYXNzPVwiaWNvbi10YWdcIj48L2k+J1xuXG4gIGdldFNjb3JlOiAoc3RyaW5nLHByZWZpeCktPiBzdHJpbmcuaW5kZXhPZihwcmVmaXgpXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXgsIGFjdGl2YXRlZE1hbnVhbGx5fSkgLT5cbiAgICByZXR1cm4gW10gaWYgcHJlZml4Lmxlbmd0aCA8IDIgfHwgIUBjb25uZWN0aW9uPyB8fCAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5hdXRvbXBsZXRlSW50ZWdyYXRpb24nKVxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgbHdyX3ByZWZpeCA9IHByZWZpeC50b0xvd2VyQ2FzZSgpXG4gICAgICBlZGl0b3JfdGV4dCA9IGVkaXRvci5nZXRUZXh0KCkudG9Mb3dlckNhc2UoKVxuICAgICAgZGVmYXVsdERhdGFiYXNlID0gQGNvbm5lY3Rpb24uZ2V0RGVmYXVsdERhdGFiYXNlKClcbiAgICAgIHN1Z2dlc3Rpb25zID0gW11cbiAgICAgIEBjb25uZWN0aW9uLmNoaWxkcmVuIChkYXRhYmFzZXMpID0+XG4gICAgICAgIGlmIGFjdGl2YXRlZE1hbnVhbGx5XG4gICAgICAgICAgZm9yIGRhdGFiYXNlIGluIGRhdGFiYXNlc1xuICAgICAgICAgICAgbHdyX2RhdGFiYXNlID0gZGF0YWJhc2UubmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBzY29yZSA9IEBnZXRTY29yZShsd3JfZGF0YWJhc2UsbHdyX3ByZWZpeClcbiAgICAgICAgICAgIGlmIHNjb3JlPyAmJiBzY29yZSAhPSAtMVxuICAgICAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoXG4gICAgICAgICAgICAgICAgdGV4dDogZGF0YWJhc2UubmFtZVxuICAgICAgICAgICAgICAgIGxvd2VyOiBsd3JfZGF0YWJhc2VcbiAgICAgICAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgICAgICAgICB0eXBlOiAnZGF0YWJhc2UnXG4gICAgICAgIGZvciBkYXRhYmFzZSBpbiBkYXRhYmFzZXMgd2hlbiBkZWZhdWx0RGF0YWJhc2UgPT0gZGF0YWJhc2UubmFtZVxuICAgICAgICAgIGRhdGFiYXNlLmNoaWxkcmVuIChpdGVtcykgPT5cbiAgICAgICAgICAgIGlmIGRhdGFiYXNlLmNoaWxkX3R5cGUgPT0gJ3NjaGVtYSdcbiAgICAgICAgICAgICAgQGdldFNjaGVtYXNTdWdnZXN0aW9ucyBpdGVtcyAsIHN1Z2dlc3Rpb25zLCBsd3JfcHJlZml4LCBlZGl0b3JfdGV4dCxhY3RpdmF0ZWRNYW51YWxseSwgPT5cbiAgICAgICAgICAgICAgICByZXNvbHZlKEBwcmVwYXJlU3VnZXN0aW9ucyhzdWdnZXN0aW9ucyxwcmVmaXgpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAZ2V0VGFibGVzU3VnZ2VzdGlvbnMgaXRlbXMsc3VnZ2VzdGlvbnMsbHdyX3ByZWZpeCwgZWRpdG9yX3RleHQsID0+XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShAcHJlcGFyZVN1Z2VzdGlvbnMoc3VnZ2VzdGlvbnMscHJlZml4KSlcblxuXG4gIGdldFNjaGVtYXNTdWdnZXN0aW9uczogKHNjaGVtYXMsc3VnZ2VzdGlvbnMscHJlZml4LCBlZGl0b3JfdGV4dCwgYWN0aXZhdGVkTWFudWFsbHkgLCBmbiktPlxuICAgIHJlbWFpbiA9IHNjaGVtYXMubGVuZ3RoXG4gICAgZm4oKSBpZiByZW1haW4gPT0gMFxuICAgIGZvciBzY2hlbWEgaW4gc2NoZW1hc1xuICAgICAgaWYgYWN0aXZhdGVkTWFudWFsbHlcbiAgICAgICAgbHdyX3NjaGVtYSA9IHNjaGVtYS5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgc2NvcmUgPSBAZ2V0U2NvcmUobHdyX3NjaGVtYSxwcmVmaXgpXG4gICAgICAgIGlmIHNjb3JlPyAmJiBzY29yZSAhPSAtMVxuICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICAgIHRleHQ6IHNjaGVtYS5uYW1lXG4gICAgICAgICAgICBsb3dlcjogbHdyX3NjaGVtYVxuICAgICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgICAgICB0eXBlOiAnc2NoZW1hJ1xuICAgICAgc2NoZW1hLmNoaWxkcmVuICh0YWJsZXMpID0+XG4gICAgICAgIEBnZXRUYWJsZXNTdWdnZXN0aW9ucyB0YWJsZXMgLCBzdWdnZXN0aW9ucywgcHJlZml4LCBlZGl0b3JfdGV4dCwgPT5cbiAgICAgICAgICByZW1haW4tLTsgZm4oKSBpZiByZW1haW4gPT0gMFxuXG5cbiAgZ2V0VGFibGVzU3VnZ2VzdGlvbnM6ICh0YWJsZXMsc3VnZ2VzdGlvbnMscHJlZml4LCBlZGl0b3JfdGV4dCwgZm4pLT5cbiAgICByZW1haW4gPSB0YWJsZXMubGVuZ3RoXG4gICAgZm4oKSBpZiByZW1haW4gPT0gMFxuICAgIGZvciB0YWJsZSBpbiB0YWJsZXNcbiAgICAgIGx3cl90YWJsZSA9IHRhYmxlLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgc2NvcmUgPSBAZ2V0U2NvcmUobHdyX3RhYmxlLHByZWZpeClcbiAgICAgIGlmIHNjb3JlPyAmJiBzY29yZSAhPSAtMVxuICAgICAgICBzdWdnZXN0aW9ucy5wdXNoXG4gICAgICAgICAgdGV4dDogdGFibGUubmFtZVxuICAgICAgICAgIGxvd2VyOiBsd3JfdGFibGVcbiAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgICB0eXBlOiAndGFibGUnXG4gICAgICBpZiBlZGl0b3JfdGV4dC5pbmNsdWRlcyhsd3JfdGFibGUpXG4gICAgICAgIHRhYmxlLmNoaWxkcmVuIChjb2x1bW5zKSA9PlxuICAgICAgICAgIGZvciBjb2x1bW4gaW4gY29sdW1uc1xuICAgICAgICAgICAgbHdyX2NvbHVtbiA9IGNvbHVtbi5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIHNjb3JlID0gQGdldFNjb3JlKGx3cl9jb2x1bW4scHJlZml4KVxuICAgICAgICAgICAgaWYgc2NvcmU/ICYmIHNjb3JlICE9IC0xXG4gICAgICAgICAgICAgIHN1Z2dlc3Rpb25zLnB1c2hcbiAgICAgICAgICAgICAgICB0ZXh0OiBjb2x1bW4ubmFtZVxuICAgICAgICAgICAgICAgIGxvd2VyOiBsd3JfdGFibGVcbiAgICAgICAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgICAgICAgICB0eXBlOiBpZiBjb2x1bW4ucHJpbWFyeV9rZXkgdGhlbiAna2V5JyBlbHNlICdjb2x1bW4nXG4gICAgICAgICAgcmVtYWluLS07IGZuKCkgaWYgcmVtYWluID09IDBcbiAgICAgIGVsc2VcbiAgICAgICAgcmVtYWluLS07IGZuKCkgaWYgcmVtYWluID09IDBcbiJdfQ==
