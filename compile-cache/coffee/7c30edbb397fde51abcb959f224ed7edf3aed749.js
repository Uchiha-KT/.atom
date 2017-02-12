(function() {
  var $, QuickQueryTableFinderView, SelectListView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$;

  module.exports = QuickQueryTableFinderView = (function(superClass) {
    extend(QuickQueryTableFinderView, superClass);

    function QuickQueryTableFinderView() {
      return QuickQueryTableFinderView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryTableFinderView.prototype.initialize = function() {
      this.step = 1;
      return QuickQueryTableFinderView.__super__.initialize.apply(this, arguments);
    };

    QuickQueryTableFinderView.prototype.getFilterKey = function() {
      return 'name';
    };

    QuickQueryTableFinderView.prototype.viewForItem = function(item) {
      var $li, $span;
      if (item.parent().type === 'schema') {
        $li = $("<li/>").html((item.parent().name) + "." + item.name);
      } else {
        $li = $("<li/>").html(item.name);
      }
      $span = $('<span/>').addClass('icon');
      if (item.type === 'database') {
        $span.addClass('icon-database');
      } else {
        $span.addClass('icon-browser');
      }
      $li.prepend($span);
      return $li;
    };

    QuickQueryTableFinderView.prototype.confirmed = function(item) {
      if (this.step === 1) {
        return this.step2(item);
      } else {
        return this.trigger('quickQuery.found', [item]);
      }
    };

    QuickQueryTableFinderView.prototype.cancel = function() {
      QuickQueryTableFinderView.__super__.cancel.apply(this, arguments);
      if (this.step === 2) {
        return this.step1();
      } else {
        return this.trigger('quickQuery.canceled');
      }
    };

    QuickQueryTableFinderView.prototype.searchTable = function(connection1) {
      this.connection = connection1;
      return this.step1();
    };

    QuickQueryTableFinderView.prototype.step1 = function() {
      this.step = 1;
      return this.connection.getDatabases((function(_this) {
        return function(databases, err) {
          var defaultdatabase;
          if (!err) {
            _this.setItems(databases);
            if (defaultdatabase = _this.connection.getDefaultDatabase()) {
              if (!_this.connection.hiddenDatabase(defaultdatabase)) {
                return _this.filterEditorView.getModel().setText(defaultdatabase);
              }
            }
          }
        };
      })(this));
    };

    QuickQueryTableFinderView.prototype.step2 = function(database) {
      this.step = 2;
      if (database.child_type === 'table') {
        return database.children((function(_this) {
          return function(tables) {
            _this.filterEditorView.getModel().setText('');
            return _this.setItems(tables);
          };
        })(this));
      } else {
        return database.children((function(_this) {
          return function(schemas) {
            var alltables, i, j, len, results, schema;
            alltables = [];
            i = 0;
            results = [];
            for (j = 0, len = schemas.length; j < len; j++) {
              schema = schemas[j];
              results.push(schema.children(function(tables) {
                i++;
                Array.prototype.push.apply(alltables, tables);
                if (i === schemas.length) {
                  _this.filterEditorView.getModel().setText('');
                  return _this.setItems(alltables);
                }
              }));
            }
            return results;
          };
        })(this));
      }
    };

    QuickQueryTableFinderView.prototype.onFound = function(callback) {
      return this.bind('quickQuery.found', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    QuickQueryTableFinderView.prototype.onCanceled = function(callback) {
      return this.bind('quickQuery.canceled', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    return QuickQueryTableFinderView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LXRhYmxlLWZpbmRlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaURBQUE7SUFBQTs7O0VBQUEsTUFBd0IsT0FBQSxDQUFRLHNCQUFSLENBQXhCLEVBQUMsbUNBQUQsRUFBbUI7O0VBR25CLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7d0NBQ0osVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsSUFBRCxHQUFRO2FBQ1IsMkRBQUEsU0FBQTtJQUZVOzt3Q0FHWixZQUFBLEdBQWMsU0FBQTthQUNaO0lBRFk7O3dDQUVkLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDVixVQUFBO01BQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxJQUFkLEtBQXNCLFFBQXpCO1FBQ0UsR0FBQSxHQUFNLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxJQUFYLENBQWtCLENBQUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFhLENBQUMsSUFBZixDQUFBLEdBQW9CLEdBQXBCLEdBQXVCLElBQUksQ0FBQyxJQUE5QyxFQURSO09BQUEsTUFBQTtRQUdFLEdBQUEsR0FBTSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsSUFBWCxDQUFnQixJQUFJLENBQUMsSUFBckIsRUFIUjs7TUFJQSxLQUFBLEdBQVEsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLFFBQWIsQ0FBc0IsTUFBdEI7TUFDUixJQUFHLElBQUksQ0FBQyxJQUFMLEtBQWEsVUFBaEI7UUFDRSxLQUFLLENBQUMsUUFBTixDQUFlLGVBQWYsRUFERjtPQUFBLE1BQUE7UUFHRSxLQUFLLENBQUMsUUFBTixDQUFlLGNBQWYsRUFIRjs7TUFJQSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVo7YUFDQTtJ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Q0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQsRUFBRyxVQUFIO2lCQUMzQixRQUFBLENBQVMsVUFBVDtRQUQyQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0I7SUFEVTs7OztLQWpFMEI7QUFKeEMiLCJzb3VyY2VzQ29udGVudCI6WyJ7U2VsZWN0TGlzdFZpZXcgICwgJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuIyBjbGFzcyBRdWlja1F1ZXJ5U2VsZWN0VGFibGVWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFF1aWNrUXVlcnlUYWJsZUZpbmRlclZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAtPlxuICAgIEBzdGVwID0gMVxuICAgIHN1cGVyXG4gIGdldEZpbHRlcktleTogLT5cbiAgICAnbmFtZSdcbiAgdmlld0Zvckl0ZW06IChpdGVtKSAtPlxuICAgICBpZiBpdGVtLnBhcmVudCgpLnR5cGUgPT0gJ3NjaGVtYSdcbiAgICAgICAkbGkgPSAkKFwiPGxpLz5cIikuaHRtbChcIiN7aXRlbS5wYXJlbnQoKS5uYW1lfS4je2l0ZW0ubmFtZX1cIilcbiAgICAgZWxzZVxuICAgICAgICRsaSA9ICQoXCI8bGkvPlwiKS5odG1sKGl0ZW0ubmFtZSlcbiAgICAgJHNwYW4gPSAkKCc8c3Bhbi8+JykuYWRkQ2xhc3MoJ2ljb24nKVxuICAgICBpZiBpdGVtLnR5cGUgPT0gJ2RhdGFiYXNlJ1xuICAgICAgICRzcGFuLmFkZENsYXNzKCdpY29uLWRhdGFiYXNlJylcbiAgICAgZWxzZVxuICAgICAgICRzcGFuLmFkZENsYXNzKCdpY29uLWJyb3dzZXInKVxuICAgICAkbGkucHJlcGVuZCgkc3BhbilcbiAgICAgJGxpXG4gIGNvbmZpcm1lZDogKGl0ZW0pIC0+XG4gICAgaWYgQHN0ZXAgPT0gMVxuICAgICAgQHN0ZXAyKGl0ZW0pXG4gICAgZWxzZVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuZm91bmQnLFtpdGVtXSlcblxuICBjYW5jZWw6IC0+XG4gICAgc3VwZXJcbiAgICBpZiBAc3RlcCA9PSAyXG4gICAgICBAc3RlcDEoKVxuICAgIGVsc2VcbiAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LmNhbmNlbGVkJylcblxuICBzZWFyY2hUYWJsZTogKEBjb25uZWN0aW9uKS0+XG4gICAgQHN0ZXAxKClcblxuICBzdGVwMTogKCktPlxuICAgIEBzdGVwID0gMVxuICAgIEBjb25uZWN0aW9uLmdldERhdGFiYXNlcyAoZGF0YWJhc2VzLGVycikgPT5cbiAgICAgIHVubGVzcyBlcnJcbiAgICAgICAgQHNldEl0ZW1zKGRhdGFiYXNlcylcbiAgICAgICAgaWYgZGVmYXVsdGRhdGFiYXNlID0gQGNvbm5lY3Rpb24uZ2V0RGVmYXVsdERhdGFiYXNlKClcbiAgICAgICAgICB1bmxlc3MgQGNvbm5lY3Rpb24uaGlkZGVuRGF0YWJhc2UoZGVmYXVsdGRhdGFiYXNlKVxuICAgICAgICAgICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5zZXRUZXh0KGRlZmF1bHRkYXRhYmFzZSlcblxuICBzdGVwMjogKGRhdGFiYXNlKS0+XG4gICAgQHN0ZXAgPSAyXG4gICAgaWYgZGF0YWJhc2UuY2hpbGRfdHlwZSA9PSAndGFibGUnXG4gICAgICBkYXRhYmFzZS5jaGlsZHJlbiAodGFibGVzKSA9PlxuICAgICAgICBAZmlsdGVyRWRpdG9yVmlldy5nZXRNb2RlbCgpLnNldFRleHQoJycpXG4gICAgICAgIEBzZXRJdGVtcyh0YWJsZXMpXG4gICAgZWxzZVxuICAgICAgZGF0YWJhc2UuY2hpbGRyZW4gKHNjaGVtYXMpID0+XG4gICAgICAgIGFsbHRhYmxlcyA9IFtdXG4gICAgICAgIGkgPSAwXG4gICAgICAgIGZvciBzY2hlbWEgaW4gc2NoZW1hc1xuICAgICAgICAgIHNjaGVtYS5jaGlsZHJlbiAodGFibGVzKSA9PlxuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShhbGx0YWJsZXMsdGFibGVzKVxuICAgICAgICAgICAgaWYgaSA9PSBzY2hlbWFzLmxlbmd0aFxuICAgICAgICAgICAgICBAZmlsdGVyRWRpdG9yVmlldy5nZXRNb2RlbCgpLnNldFRleHQoJycpXG4gICAgICAgICAgICAgIEBzZXRJdGVtcyhhbGx0YWJsZXMpXG5cbiAgb25Gb3VuZDogKGNhbGxiYWNrKS0+XG4gICAgQGJpbmQgJ3F1aWNrUXVlcnkuZm91bmQnLCAoZSxjb25uZWN0aW9uKSA9PlxuICAgICAgY2FsbGJhY2soY29ubmVjdGlvbilcblxuICBvbkNhbmNlbGVkOiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jYW5jZWxlZCcsIChlLGNvbm5lY3Rpb24pID0+XG4gICAgICBjYWxsYmFjayhjb25uZWN0aW9uKVxuIl19
