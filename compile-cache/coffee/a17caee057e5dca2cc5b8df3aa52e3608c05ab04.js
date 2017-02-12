
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  'Command finder' view, which lists all available commands and variables.
 */

(function() {
  var $$, ATPCommandFinderView, SelectListView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = include('atom-space-pen-views'), SelectListView = ref.SelectListView, $$ = ref.$$;

  module.exports = ATPCommandFinderView = (function(superClass) {
    extend(ATPCommandFinderView, superClass);

    function ATPCommandFinderView() {
      return ATPCommandFinderView.__super__.constructor.apply(this, arguments);
    }

    ATPCommandFinderView.thisPanel = null;

    ATPCommandFinderView.thisCaller = null;

    ATPCommandFinderView.prototype.initialize = function(listOfItems) {
      this.listOfItems = listOfItems;
      ATPCommandFinderView.__super__.initialize.apply(this, arguments);
      return this.setItems(this.listOfItems);
    };

    ATPCommandFinderView.prototype.viewForItem = function(item) {
      var descr_prefix, icon_style;
      icon_style = '';
      descr_prefix = '';
      if (item.source === 'external') {
        icon_style = 'book';
        descr_prefix = 'External: ';
      } else if (item.source === 'internal') {
        icon_style = 'repo';
        descr_prefix = 'Builtin: ';
      } else if (item.source === 'internal-atom') {
        icon_style = 'repo';
        descr_prefix = 'Atom command: ';
      } else if (item.source === 'external-functional') {
        icon_style = 'plus';
        descr_prefix = 'Functional: ';
      } else if (item.source === 'global-variable') {
        icon_style = 'briefcase';
        descr_prefix = 'Global variable: ';
      }
      return $$(function() {
        return this.li({
          "class": 'two-lines selected'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": "status status-" + icon_style + " icon icon-" + icon_style
            });
            _this.div({
              "class": 'primary-line'
            }, function() {
              return _this.span(item.name);
            });
            return _this.div({
              "class": 'secondary-line'
            }, function() {
              return _this.span(descr_prefix + item.description);
            });
          };
        })(this));
      });
    };

    ATPCommandFinderView.prototype.shown = function(panel, caller) {
      this.thisPanel = panel;
      return this.thisCaller = caller;
    };

    ATPCommandFinderView.prototype.close = function(item) {
      var e;
      if (this.thisPanel != null) {
        try {
          this.thisPanel.destroy();
        } catch (error) {
          e = error;
        }
      }
      if (item != null) {
        return this.thisCaller.onCommand(item.name);
      }
    };

    ATPCommandFinderView.prototype.cancel = function() {
      return this.close(null);
    };

    ATPCommandFinderView.prototype.confirmed = function(item) {
      return this.close(item);
    };

    ATPCommandFinderView.prototype.getFilterKey = function() {
      return "name";
    };

    return ATPCommandFinderView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLWNvbW1hbmQtZmluZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUE7OztFQVFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLG1DQUFELEVBQWlCOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osb0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBQ1osb0JBQUMsQ0FBQSxVQUFELEdBQWE7O21DQUViLFVBQUEsR0FBWSxTQUFDLFdBQUQ7TUFBQyxJQUFDLENBQUEsY0FBRDtNQUNYLHNEQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxXQUFYO0lBRlU7O21DQUtaLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO01BQUEsVUFBQSxHQUFhO01BQ2IsWUFBQSxHQUFlO01BQ2YsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLFVBQWxCO1FBQ0UsVUFBQSxHQUFhO1FBQ2IsWUFBQSxHQUFlLGFBRmpCO09BQUEsTUFHSyxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUsVUFBbEI7UUFDSCxVQUFBLEdBQWE7UUFDYixZQUFBLEdBQWUsWUFGWjtPQUFBLE1BR0EsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLGVBQWxCO1FBQ0gsVUFBQSxHQUFhO1FBQ2IsWUFBQSxHQUFlLGlCQUZaO09BQUEsTUFHQSxJQUFHLElBQUksQ0FBQyxNQUFMLEtBQWUscUJBQWxCO1FBQ0gsVUFBQSxHQUFhO1FBQ2IsWUFBQSxHQUFlLGVBRlo7T0FBQSxNQUdBLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxpQkFBbEI7UUFDSCxVQUFBLEdBQWE7UUFDYixZQUFBLEdBQWUsb0JBRlo7O2FBSUwsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBUDtTQUFKLEVBQWlDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDL0IsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQUEsR0FBaUIsVUFBakIsR0FBNEIsYUFBNUIsR0FBeUMsVUFBaEQ7YUFBTDtZQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQVA7YUFBTCxFQUE0QixTQUFBO3FCQUMxQixLQUFDLENBQUEsSUFBRCxDQUFNLElBQUksQ0FBQyxJQUFYO1lBRDBCLENBQTVCO21CQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQUwsRUFBOEIsU0FBQTtxQkFDNUIsS0FBQyxDQUFBLElBQUQsQ0FBTSxZQUFBLEdBQWUsSUFBSSxDQUFDLFdBQTFCO1lBRDRCLENBQTlCO1VBSitCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQztNQURDLENBQUg7SUFuQlc7O21DQTZCYixLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsTUFBUjtNQUNMLElBQUMsQ0FBQSxTQUFELEdBQWE7YUFDYixJQUFDLENBQUEsVUFBRCxHQUFjO0lBRlQ7O21DQUlQLEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFFTCxVQUFBO01BQUEsSUFBRyxzQkFBSDtBQUNFO1VBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsRUFERjtTQUFBLGFBQUE7VUFFTSxVQUZOO1NBREY7O01BSUEsSUFBRyxZQUFIO2VBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQXNCLElBQUksQ0FBQyxJQUEzQixFQURGOztJQU5LOzttQ0FTUCxNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxLQUFELENBQU8sSUFBUDtJQURNOzttQ0FHUixTQUFBLEdBQVcsU0FBQyxJQUFEO2FBQ1QsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFQO0lBRFM7O21DQUdYLFlBQUEsR0FBYyxTQUFBO0FBQ1osYUFBTztJQURLOzs7O0tBekRtQjtBQVhuQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBBdG9tLXRlcm1pbmFsLXBhbmVsXG4gIENvcHlyaWdodCBieSBpc2lzOTdcbiAgTUlUIGxpY2Vuc2VkXG5cbiAgJ0NvbW1hbmQgZmluZGVyJyB2aWV3LCB3aGljaCBsaXN0cyBhbGwgYXZhaWxhYmxlIGNvbW1hbmRzIGFuZCB2YXJpYWJsZXMuXG4jIyNcblxue1NlbGVjdExpc3RWaWV3LCAkJH0gPSBpbmNsdWRlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQVRQQ29tbWFuZEZpbmRlclZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBAdGhpc1BhbmVsOiBudWxsXG4gIEB0aGlzQ2FsbGVyOiBudWxsXG5cbiAgaW5pdGlhbGl6ZTogKEBsaXN0T2ZJdGVtcykgLT5cbiAgICBzdXBlclxuICAgIEBzZXRJdGVtcyBAbGlzdE9mSXRlbXNcblxuXG4gIHZpZXdGb3JJdGVtOiAoaXRlbSkgLT5cbiAgICBpY29uX3N0eWxlID0gJydcbiAgICBkZXNjcl9wcmVmaXggPSAnJ1xuICAgIGlmIGl0ZW0uc291cmNlID09ICdleHRlcm5hbCdcbiAgICAgIGljb25fc3R5bGUgPSAnYm9vaydcbiAgICAgIGRlc2NyX3ByZWZpeCA9ICdFeHRlcm5hbDogJ1xuICAgIGVsc2UgaWYgaXRlbS5zb3VyY2UgPT0gJ2ludGVybmFsJ1xuICAgICAgaWNvbl9zdHlsZSA9ICdyZXBvJ1xuICAgICAgZGVzY3JfcHJlZml4ID0gJ0J1aWx0aW46ICdcbiAgICBlbHNlIGlmIGl0ZW0uc291cmNlID09ICdpbnRlcm5hbC1hdG9tJ1xuICAgICAgaWNvbl9zdHlsZSA9ICdyZXBvJ1xuICAgICAgZGVzY3JfcHJlZml4ID0gJ0F0b20gY29tbWFuZDogJ1xuICAgIGVsc2UgaWYgaXRlbS5zb3VyY2UgPT0gJ2V4dGVybmFsLWZ1bmN0aW9uYWwnXG4gICAgICBpY29uX3N0eWxlID0gJ3BsdXMnXG4gICAgICBkZXNjcl9wcmVmaXggPSAnRnVuY3Rpb25hbDogJ1xuICAgIGVsc2UgaWYgaXRlbS5zb3VyY2UgPT0gJ2dsb2JhbC12YXJpYWJsZSdcbiAgICAgIGljb25fc3R5bGUgPSAnYnJpZWZjYXNlJ1xuICAgICAgZGVzY3JfcHJlZml4ID0gJ0dsb2JhbCB2YXJpYWJsZTogJ1xuXG4gICAgJCQgLT5cbiAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcyBzZWxlY3RlZCcsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6IFwic3RhdHVzIHN0YXR1cy0je2ljb25fc3R5bGV9IGljb24gaWNvbi0je2ljb25fc3R5bGV9XCJcbiAgICAgICAgQGRpdiBjbGFzczogJ3ByaW1hcnktbGluZScsID0+XG4gICAgICAgICAgQHNwYW4gaXRlbS5uYW1lXG4gICAgICAgIEBkaXYgY2xhc3M6ICdzZWNvbmRhcnktbGluZScsID0+XG4gICAgICAgICAgQHNwYW4gZGVzY3JfcHJlZml4ICsgaXRlbS5kZXNjcmlwdGlvblxuXG5cblxuICBzaG93bjogKHBhbmVsLCBjYWxsZXIpIC0+XG4gICAgQHRoaXNQYW5lbCA9IHBhbmVsXG4gICAgQHRoaXNDYWxsZXIgPSBjYWxsZXJcblxuICBjbG9zZTogKGl0ZW0pIC0+XG5cbiAgICBpZiBAdGhpc1BhbmVsP1xuICAgICAgdHJ5XG4gICAgICAgIEB0aGlzUGFuZWwuZGVzdHJveSgpXG4gICAgICBjYXRjaCBlXG4gICAgaWYgaXRlbT9cbiAgICAgIEB0aGlzQ2FsbGVyLm9uQ29tbWFuZCBpdGVtLm5hbWVcblxuICBjYW5jZWw6IC0+XG4gICAgQGNsb3NlIG51bGxcblxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIEBjbG9zZSBpdGVtXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPlxuICAgIHJldHVybiBcIm5hbWVcIlxuIl19
