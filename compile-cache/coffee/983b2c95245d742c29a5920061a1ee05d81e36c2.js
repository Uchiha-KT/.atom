(function() {
  var $, QuickQueryBrowserView, ScrollView, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), ScrollView = ref.ScrollView, $ = ref.$;

  module.exports = QuickQueryBrowserView = (function(superClass) {
    extend(QuickQueryBrowserView, superClass);

    QuickQueryBrowserView.prototype.editor = null;

    QuickQueryBrowserView.prototype.connection = null;

    QuickQueryBrowserView.prototype.connections = [];

    QuickQueryBrowserView.prototype.selectedConnection = null;

    function QuickQueryBrowserView() {
      this.resizeTreeView = bind(this.resizeTreeView, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      atom.commands.add('#quick-query-connections', {
        'quick-query:select-1000': (function(_this) {
          return function() {
            return _this.simpleSelect();
          };
        })(this),
        'quick-query:alter': (function(_this) {
          return function() {
            return _this.alter();
          };
        })(this),
        'quick-query:drop': (function(_this) {
          return function() {
            return _this.drop();
          };
        })(this),
        'quick-query:create': (function(_this) {
          return function() {
            return _this.create();
          };
        })(this),
        'quick-query:copy': (function(_this) {
          return function() {
            return _this.copy();
          };
        })(this),
        'quick-query:set-default': (function(_this) {
          return function() {
            return _this.setDefault();
          };
        })(this),
        'core:delete': (function(_this) {
          return function() {
            return _this["delete"]();
          };
        })(this)
      });
      QuickQueryBrowserView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryBrowserView.prototype.initialize = function() {
      this.find('#quick-query-new-connection').click((function(_this) {
        return function(e) {
          var workspaceElement;
          workspaceElement = atom.views.getView(atom.workspace);
          return atom.commands.dispatch(workspaceElement, 'quick-query:new-connection');
        };
      })(this));
      this.find('#quick-query-run').click((function(_this) {
        return function(e) {
          var workspaceElement;
          workspaceElement = atom.views.getView(atom.workspace);
          return atom.commands.dispatch(workspaceElement, 'quick-query:run');
        };
      })(this));
      this.find('#quick-query-connections').blur((function(_this) {
        return function(e) {
          var $li, $tree;
          $tree = $(e.currentTarget);
          $li = $tree.find('li.selected');
          return $li.removeClass('selected');
        };
      })(this));
      return this.handleResizeEvents();
    };

    QuickQueryBrowserView.prototype.getTitle = function() {
      return 'Query Result';
    };

    QuickQueryBrowserView.prototype.serialize = function() {};

    QuickQueryBrowserView.content = function() {
      return this.div({
        "class": 'quick-query-browser tree-view-resizer tool-panel',
        'data-show-on-right-side': !atom.config.get('quick-query.showBrowserOnLeftSide')
      }, (function(_this) {
        return function() {
          _this.div(function() {
            _this.button({
              id: 'quick-query-run',
              "class": 'btn icon icon-playback-play',
              title: 'Run',
              style: 'width:50%'
            });
            return _this.button({
              id: 'quick-query-new-connection',
              "class": 'btn icon icon-plus',
              title: 'New connection',
              style: 'width:50%'
            });
          });
          _this.div({
            "class": 'tree-view-scroller',
            outlet: 'scroller'
          }, function() {
            return _this.ol({
              id: 'quick-query-connections',
              "class": 'tree-view list-tree has-collapsable-children focusable-panel',
              tabindex: -1,
              outlet: 'list'
            });
          });
          return _this.div({
            "class": 'tree-view-resize-handle',
            outlet: 'resizeHandle'
          });
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.destroy = function() {
      return this.element.remove();
    };

    QuickQueryBrowserView.prototype["delete"] = function() {
      var $li, connection, i;
      connection = null;
      $li = this.find('ol:focus li.quick-query-connection.selected');
      if ($li.length === 1) {
        connection = $li.data('item');
        i = this.connections.indexOf(connection);
        this.connections.splice(i, 1);
        this.showConnections();
        return this.trigger('quickQuery.connectionDeleted', [connection]);
      }
    };

    QuickQueryBrowserView.prototype.setDefault = function() {
      var $li, model;
      $li = this.find('li.selected');
      if (!$li.hasClass('default')) {
        model = $li.data('item');
        return model.connection.setDefaultDatabase(model.name);
      }
    };

    QuickQueryBrowserView.prototype.addConnection = function(connectionPromise) {
      return connectionPromise.then((function(_this) {
        return function(connection) {
          _this.selectedConnection = connection;
          _this.connections.push(connection);
          _this.trigger('quickQuery.connectionSelected', [connection]);
          _this.showConnections();
          return connection.onDidChangeDefaultDatabase(function(database) {
            return _this.defaultDatabaseChanged(connection, database);
          });
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.defaultDatabaseChanged = function(connection, database) {
      return this.find('ol#quick-query-connections').children().each(function(i, e) {
        if ($(e).data('item') === connection) {
          $(e).find(".quick-query-database").removeClass('default');
          return $(e).find(".quick-query-database[data-name=\"" + database + "\"]").addClass('default');
        }
      });
    };

    QuickQueryBrowserView.prototype.showConnections = function() {
      var $div, $icon, $li, $ol, connection, j, len, ref1, results;
      $ol = this.find('ol#quick-query-connections');
      $ol.empty();
      ref1 = this.connections;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        connection = ref1[j];
        $li = $('<li/>').addClass('entry list-nested-item collapsed');
        $div = $('<div/>').addClass('header list-item');
        $icon = $('<span/>').addClass('icon');
        $li.attr('data-protocol', connection.protocol);
        if (connection === this.selectedConnection) {
          $li.addClass('default');
        }
        $div.mousedown((function(_this) {
          return function(e) {
            $li = $(e.currentTarget).parent();
            $li.parent().find('li').removeClass('selected');
            $li.addClass('selected');
            $li.parent().find('li').removeClass('default');
            $li.addClass('default');
            if (e.which !== 3) {
              return _this.expandConnection($li);
            }
          };
        })(this));
        $div.text(connection);
        $div.prepend($icon);
        $li.data('item', connection);
        $li.html($div);
        this.setItemClasses(connection, $li);
        results.push($ol.append($li));
      }
      return results;
    };

    QuickQueryBrowserView.prototype.expandConnection = function($li, callback) {
      var connection;
      connection = $li.data('item');
      if (connection !== this.selectedConnection) {
        this.selectedConnection = connection;
        this.trigger('quickQuery.connectionSelected', [connection]);
      }
      $li.toggleClass('collapsed expanded');
      if ($li.hasClass("expanded")) {
        return connection.getDatabases((function(_this) {
          return function(databases, err) {
            if (!err) {
              _this.showItems(connection, databases, $li);
              if (callback) {
                return callback();
              }
            }
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.showItems = function(parentItem, childrenItems, $e) {
      var $div, $icon, $li, $ol, childItem, j, len, ol_class, results;
      ol_class = (function() {
        switch (parentItem.child_type) {
          case 'database':
            return "quick-query-databases";
          case 'schema':
            return "quick-query-schemas";
          case 'table':
            return "quick-query-tables";
          case 'column':
            return "quick-query-columns";
        }
      })();
      $ol = $e.find("ol." + ol_class);
      if ($ol.length === 0) {
        $ol = $('<ol/>').addClass('list-tree entries');
        if (parentItem.child_type !== 'column') {
          $ol.addClass("has-collapsable-children");
        }
        $ol.addClass(ol_class);
        $e.append($ol);
      } else {
        $ol.empty();
      }
      if (parentItem.child_type !== 'column') {
        childrenItems = childrenItems.sort(this.compareItemName);
      }
      results = [];
      for (j = 0, len = childrenItems.length; j < len; j++) {
        childItem = childrenItems[j];
        $li = $('<li/>').addClass('entry');
        $div = $('<div/>').addClass('header list-item');
        $icon = $('<span/>').addClass('icon');
        if (childItem.type !== 'column') {
          $li.addClass('list-nested-item collapsed');
        }
        if (childItem.type === 'database' && childItem.name === this.selectedConnection.getDefaultDatabase()) {
          $li.addClass('default');
        }
        $div.mousedown((function(_this) {
          return function(e) {
            $li = $(e.currentTarget).parent();
            $li.closest('ol#quick-query-connections').find('li').removeClass('selected');
            $li.addClass('selected');
            if (e.which !== 3) {
              return _this.expandItem($li);
            }
          };
        })(this));
        $div.text(childItem);
        $div.prepend($icon);
        $li.attr('data-name', childItem.name);
        $li.data('item', childItem);
        $li.html($div);
        this.setItemClasses(childItem, $li);
        results.push($ol.append($li));
      }
      return results;
    };

    QuickQueryBrowserView.prototype.setItemClasses = function(item, $li) {
      var $div, $icon;
      $div = $li.children('.header');
      $icon = $div.children('.icon');
      switch (item.type) {
        case 'connection':
          $li.addClass('quick-query-connection');
          $div.addClass("qq-connection-item");
          return $icon.addClass('icon-plug');
        case 'database':
          $li.addClass('quick-query-database');
          $div.addClass("qq-database-item");
          return $icon.addClass('icon-database');
        case 'schema':
          $li.addClass('quick-query-schema');
          $div.addClass("qq-schema-item");
          return $icon.addClass('icon-book');
        case 'table':
          $li.addClass('quick-query-table');
          $div.addClass("qq-table-item");
          return $icon.addClass('icon-browser');
        case 'column':
          $li.addClass('quick-query-column');
          $div.addClass("qq-column-item");
          if (item.primary_key) {
            return $icon.addClass('icon-key');
          } else {
            return $icon.addClass('icon-tag');
          }
      }
    };

    QuickQueryBrowserView.prototype.expandItem = function($li, callback) {
      var model;
      $li.toggleClass('collapsed expanded');
      if ($li.hasClass("expanded")) {
        model = $li.data('item');
        return model.children((function(_this) {
          return function(children) {
            _this.showItems(model, children, $li);
            if (callback) {
              return callback(children);
            }
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.refreshTree = function(model) {
      var $li;
      $li = (function() {
        switch (model.type) {
          case 'connection':
            return this.find('li.quick-query-connection').filter(function(i, e) {
              return $(e).data('item') === model;
            });
          case 'database':
            return this.find('li.quick-query-connection').filter(function(i, e) {
              return $(e).data('item') === model.parent();
            });
          case 'table':
            return this.find('li.quick-query-database').filter(function(i, e) {
              return $(e).data('item') === model.parent();
            });
          case 'column':
            return this.find('li.quick-query-table').filter(function(i, e) {
              return $(e).data('item') === model.parent();
            });
        }
      }).call(this);
      $li.removeClass('collapsed');
      $li.addClass('expanded');
      $li.find('ol').empty();
      return model.parent().children((function(_this) {
        return function(children) {
          return _this.showItems(model.parent(), children, $li);
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.expand = function(model, callback) {
      var $ol, parent;
      if (model.type === 'connection') {
        $ol = this.find('ol#quick-query-connections');
        return $ol.children().each((function(_this) {
          return function(i, li) {
            if ($(li).data('item') === model) {
              $(li).removeClass('expanded').addClass('collapsed');
              return _this.expandConnection($(li), function() {
                if (callback) {
                  return callback($(li));
                }
              });
            }
          };
        })(this));
      } else {
        parent = model.parent();
        return this.expand(parent, (function(_this) {
          return function($li) {
            $ol = $li.children("ol");
            return $ol.children().each(function(i, li) {
              var item;
              item = $(li).data('item');
              if (item && item.name === model.name && item.type === model.type) {
                return _this.expandItem($(li), function() {
                  if (callback) {
                    return callback($(li));
                  }
                });
              }
            });
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.reveal = function(model, callback) {
      return this.expand(model, (function(_this) {
        return function($li) {
          var bottom, top;
          $li.addClass('selected');
          top = $li.position().top;
          bottom = top + $li.outerHeight();
          if (bottom > _this.scroller.scrollBottom()) {
            _this.scroller.scrollBottom(bottom);
          }
          if (top < _this.scroller.scrollTop()) {
            _this.scroller.scrollTop(top);
          }
          if (callback) {
            return callback();
          }
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.compareItemName = function(item1, item2) {
      if (item1.name < item2.name) {
        return -1;
      } else if (item1.name > item2.name) {
        return 1;
      } else {
        return 0;
      }
    };

    QuickQueryBrowserView.prototype.simpleSelect = function() {
      var $li, model;
      $li = this.find('li.selected.quick-query-table');
      if ($li.length > 0) {
        model = $li.data('item');
        return model.connection.getColumns(model, (function(_this) {
          return function(columns) {
            var text;
            text = model.connection.simpleSelect(model, columns);
            return atom.workspace.open().then(function(editor) {
              var grammar, grammars, i;
              grammars = atom.grammars.getGrammars();
              grammar = ((function() {
                var j, len, results;
                results = [];
                for (j = 0, len = grammars.length; j < len; j++) {
                  i = grammars[j];
                  if (i.name === 'SQL') {
                    results.push(i);
                  }
                }
                return results;
              })())[0];
              editor.setGrammar(grammar);
              return editor.insertText(text);
            });
          };
        })(this));
      }
    };

    QuickQueryBrowserView.prototype.copy = function() {
      var $header, $li;
      $li = this.find('li.selected');
      $header = $li.children('div.header');
      if ($header.length > 0) {
        return atom.clipboard.write($header.text());
      }
    };

    QuickQueryBrowserView.prototype.create = function() {
      var $li, model;
      $li = this.find('li.selected');
      if ($li.length > 0) {
        model = $li.data('item');
        return this.trigger('quickQuery.edit', ['create', model]);
      }
    };

    QuickQueryBrowserView.prototype.alter = function() {
      var $li, model;
      $li = this.find('li.selected');
      if ($li.length > 0) {
        model = $li.data('item');
        return this.trigger('quickQuery.edit', ['alter', model]);
      }
    };

    QuickQueryBrowserView.prototype.drop = function() {
      var $li, model;
      $li = this.find('li.selected');
      if ($li.length > 0) {
        model = $li.data('item');
        return this.trigger('quickQuery.edit', ['drop', model]);
      }
    };

    QuickQueryBrowserView.prototype.selectConnection = function(connection) {
      var $ol;
      if (connection === this.selectedConnection) {
        return;
      }
      $ol = this.find('ol#quick-query-connections');
      return $ol.children().each((function(_this) {
        return function(i, li) {
          if ($(li).data('item') === connection) {
            $ol.children().removeClass('default');
            $(li).addClass('default');
            _this.selectedConnection = connection;
            return _this.trigger('quickQuery.connectionSelected', [connection]);
          }
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.onConnectionSelected = function(callback) {
      return this.bind('quickQuery.connectionSelected', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.onConnectionDeleted = function(callback) {
      return this.bind('quickQuery.connectionDeleted', (function(_this) {
        return function(e, connection) {
          return callback(connection);
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.handleResizeEvents = function() {
      this.on('dblclick', '.tree-view-resize-handle', (function(_this) {
        return function(e) {
          return _this.resizeToFitContent();
        };
      })(this));
      return this.on('mousedown', '.tree-view-resize-handle', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
    };

    QuickQueryBrowserView.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeTreeView);
      return $(document).on('mouseup', this.resizeStopped);
    };

    QuickQueryBrowserView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeTreeView);
      return $(document).off('mouseup', this.resizeStopped);
    };

    QuickQueryBrowserView.prototype.resizeTreeView = function(arg) {
      var pageX, which, width;
      pageX = arg.pageX, which = arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      if (this.data('show-on-right-side')) {
        width = this.outerWidth() + this.offset().left - pageX;
      } else {
        width = pageX - this.offset().left;
      }
      return this.width(width);
    };

    QuickQueryBrowserView.prototype.resizeToFitContent = function() {
      this.width(1);
      return this.width(this.list.outerWidth());
    };

    return QuickQueryBrowserView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LWJyb3dzZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlDQUFBO0lBQUE7Ozs7RUFBQSxNQUFrQixPQUFBLENBQVEsc0JBQVIsQ0FBbEIsRUFBQywyQkFBRCxFQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztvQ0FFSixNQUFBLEdBQVE7O29DQUNSLFVBQUEsR0FBWTs7b0NBQ1osV0FBQSxHQUFhOztvQ0FDYixrQkFBQSxHQUFvQjs7SUFFUCwrQkFBQTs7OztNQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiwwQkFBbEIsRUFDRTtRQUFBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjtRQUNBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURyQjtRQUVBLGtCQUFBLEVBQW9CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZwQjtRQUdBLG9CQUFBLEVBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUh0QjtRQUlBLGtCQUFBLEVBQW9CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQTtVQUFIO1FBQUEs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Q0FBZSxXQUFmLEVBQTRCLElBQUMsQ0FBQSxjQUE3QjthQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixJQUFDLENBQUEsYUFBM0I7SUFGYTs7b0NBR2YsYUFBQSxHQUFlLFNBQUE7TUFDYixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixXQUFoQixFQUE2QixJQUFDLENBQUEsY0FBOUI7YUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixTQUFoQixFQUEyQixJQUFDLENBQUEsYUFBNUI7SUFGYTs7b0NBR2YsY0FBQSxHQUFnQixTQUFDLEdBQUQ7QUFDZCxVQUFBO01BRGdCLG1CQUFPO01BQ3ZCLElBQStCLEtBQUEsS0FBUyxDQUF4QztBQUFBLGVBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUFQOztNQUNBLElBQUcsSUFBQyxDQUFBLElBQUQsQ0FBTSxvQkFBTixDQUFIO1FBQ0UsS0FBQSxHQUFTLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxHQUFnQixJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxJQUExQixHQUFpQyxNQUQ1QztPQUFBLE1BQUE7UUFHRSxLQUFBLEdBQVEsS0FBQSxHQUFRLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLEtBSDVCOzthQUlBLElBQUMsQ0FBQSxLQUFELENBQU8sS0FBUDtJQU5jOztvQ0FPaEIsa0JBQUEsR0FBb0IsU0FBQTtNQUNsQixJQUFDLENBQUEsS0FBRCxDQUFPLENBQVA7YUFDQSxJQUFDLENBQUEsS0FBRCxDQUFPLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixDQUFBLENBQVA7SUFGa0I7Ozs7S0FyVWM7QUFIcEMiLCJzb3VyY2VzQ29udGVudCI6WyJ7U2Nyb2xsVmlldywgJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUXVpY2tRdWVyeUJyb3dzZXJWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuXG4gIGVkaXRvcjogbnVsbFxuICBjb25uZWN0aW9uOiBudWxsXG4gIGNvbm5lY3Rpb25zOiBbXVxuICBzZWxlY3RlZENvbm5lY3Rpb246IG51bGxcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnI3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJyxcbiAgICAgICdxdWljay1xdWVyeTpzZWxlY3QtMTAwMCc6ID0+IEBzaW1wbGVTZWxlY3QoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmFsdGVyJzogPT4gQGFsdGVyKClcbiAgICAgICdxdWljay1xdWVyeTpkcm9wJzogPT4gQGRyb3AoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmNyZWF0ZSc6ID0+IEBjcmVhdGUoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmNvcHknOiA9PiBAY29weSgpXG4gICAgICAncXVpY2stcXVlcnk6c2V0LWRlZmF1bHQnOiA9PiBAc2V0RGVmYXVsdCgpXG4gICAgICAnY29yZTpkZWxldGUnOiA9PiBAZGVsZXRlKClcblxuICAgIHN1cGVyXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LW5ldy1jb25uZWN0aW9uJykuY2xpY2sgKGUpID0+XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAncXVpY2stcXVlcnk6bmV3LWNvbm5lY3Rpb24nKVxuICAgIEBmaW5kKCcjcXVpY2stcXVlcnktcnVuJykuY2xpY2sgKGUpID0+XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAncXVpY2stcXVlcnk6cnVuJylcbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJykuYmx1ciAoZSkgPT5cbiAgICAgICR0cmVlID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICAkbGkgPSAkdHJlZS5maW5kKCdsaS5zZWxlY3RlZCcpXG4gICAgICAkbGkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICBAaGFuZGxlUmVzaXplRXZlbnRzKClcbiAgIyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBnZXRUaXRsZTogLT5cbiAgICByZXR1cm4gJ1F1ZXJ5IFJlc3VsdCdcbiAgc2VyaWFsaXplOiAtPlxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdxdWljay1xdWVyeS1icm93c2VyIHRyZWUtdmlldy1yZXNpemVyIHRvb2wtcGFuZWwnLCAnZGF0YS1zaG93LW9uLXJpZ2h0LXNpZGUnOiAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5zaG93QnJvd3Nlck9uTGVmdFNpZGUnKSAsID0+XG4gICAgICBAZGl2ID0+XG4gICAgICAgIEBidXR0b24gaWQ6ICdxdWljay1xdWVyeS1ydW4nLCBjbGFzczogJ2J0biBpY29uIGljb24tcGxheWJhY2stcGxheScgLCB0aXRsZTogJ1J1bicgLCBzdHlsZTogJ3dpZHRoOjUwJSdcbiAgICAgICAgQGJ1dHRvbiBpZDogJ3F1aWNrLXF1ZXJ5LW5ldy1jb25uZWN0aW9uJywgY2xhc3M6ICdidG4gaWNvbiBpY29uLXBsdXMnICwgdGl0bGU6ICdOZXcgY29ubmVjdGlvbicgLCBzdHlsZTogJ3dpZHRoOjUwJSdcbiAgICAgIEBkaXYgY2xhc3M6ICd0cmVlLXZpZXctc2Nyb2xsZXInLCBvdXRsZXQ6ICdzY3JvbGxlcicsID0+XG4gICAgICAgIEBvbCBpZDoncXVpY2stcXVlcnktY29ubmVjdGlvbnMnICwgY2xhc3M6ICd0cmVlLXZpZXcgbGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlbiBmb2N1c2FibGUtcGFuZWwnLCB0YWJpbmRleDogLTEsIG91dGxldDogJ2xpc3QnXG4gICAgICBAZGl2IGNsYXNzOiAndHJlZS12aWV3LXJlc2l6ZS1oYW5kbGUnLCBvdXRsZXQ6ICdyZXNpemVIYW5kbGUnXG5cblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG5cbiAgZGVsZXRlOiAtPlxuICAgIGNvbm5lY3Rpb24gPSBudWxsXG4gICAgJGxpID0gQGZpbmQoJ29sOmZvY3VzIGxpLnF1aWNrLXF1ZXJ5LWNvbm5lY3Rpb24uc2VsZWN0ZWQnKVxuICAgIGlmICRsaS5sZW5ndGggPT0gMVxuICAgICAgY29ubmVjdGlvbiA9ICRsaS5kYXRhKCdpdGVtJylcbiAgICAgIGkgPSBAY29ubmVjdGlvbnMuaW5kZXhPZihjb25uZWN0aW9uKVxuICAgICAgQGNvbm5lY3Rpb25zLnNwbGljZShpLDEpXG4gICAgICBAc2hvd0Nvbm5lY3Rpb25zKClcbiAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LmNvbm5lY3Rpb25EZWxldGVkJyxbY29ubmVjdGlvbl0pXG5cbiAgc2V0RGVmYXVsdDogLT5cbiAgICAkbGkgPSBAZmluZCgnbGkuc2VsZWN0ZWQnKVxuICAgIHVubGVzcyAkbGkuaGFzQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgbW9kZWwgPSAkbGkuZGF0YSgnaXRlbScpXG4gICAgICBtb2RlbC5jb25uZWN0aW9uLnNldERlZmF1bHREYXRhYmFzZSBtb2RlbC5uYW1lXG5cbiAgYWRkQ29ubmVjdGlvbjogKGNvbm5lY3Rpb25Qcm9taXNlKSAtPlxuICAgIGNvbm5lY3Rpb25Qcm9taXNlLnRoZW4gKGNvbm5lY3Rpb24pPT5cbiAgICAgIEBzZWxlY3RlZENvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgICBAY29ubmVjdGlvbnMucHVzaChjb25uZWN0aW9uKVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuY29ubmVjdGlvblNlbGVjdGVkJyxbY29ubmVjdGlvbl0pXG4gICAgICBAc2hvd0Nvbm5lY3Rpb25zKClcbiAgICAgIGNvbm5lY3Rpb24ub25EaWRDaGFuZ2VEZWZhdWx0RGF0YWJhc2UgKGRhdGFiYXNlKSA9PlxuICAgICAgICBAZGVmYXVsdERhdGFiYXNlQ2hhbmdlZChjb25uZWN0aW9uLGRhdGFiYXNlKVxuXG4gIGRlZmF1bHREYXRhYmFzZUNoYW5nZWQ6IChjb25uZWN0aW9uLGRhdGFiYXNlKS0+XG4gICAgQGZpbmQoJ29sI3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJykuY2hpbGRyZW4oKS5lYWNoIChpLGUpLT5cbiAgICAgIGlmICQoZSkuZGF0YSgnaXRlbScpID09IGNvbm5lY3Rpb25cbiAgICAgICAgJChlKS5maW5kKFwiLnF1aWNrLXF1ZXJ5LWRhdGFiYXNlXCIpLnJlbW92ZUNsYXNzKCdkZWZhdWx0JylcbiAgICAgICAgJChlKS5maW5kKFwiLnF1aWNrLXF1ZXJ5LWRhdGFiYXNlW2RhdGEtbmFtZT1cXFwiI3tkYXRhYmFzZX1cXFwiXVwiKS5hZGRDbGFzcygnZGVmYXVsdCcpXG5cbiAgc2hvd0Nvbm5lY3Rpb25zOiAoKS0+XG4gICAgJG9sID0gQGZpbmQoJ29sI3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJylcbiAgICAkb2wuZW1wdHkoKVxuICAgIGZvciBjb25uZWN0aW9uIGluIEBjb25uZWN0aW9uc1xuICAgICAgICAkbGkgPSAkKCc8bGkvPicpLmFkZENsYXNzKCdlbnRyeSBsaXN0LW5lc3RlZC1pdGVtIGNvbGxhcHNlZCcpXG4gICAgICAgICRkaXYgPSAkKCc8ZGl2Lz4nKS5hZGRDbGFzcygnaGVhZGVyIGxpc3QtaXRlbScpXG4gICAgICAgICRpY29uID0gJCgnPHNwYW4vPicpLmFkZENsYXNzKCdpY29uJylcbiAgICAgICAgJGxpLmF0dHIoJ2RhdGEtcHJvdG9jb2wnLGNvbm5lY3Rpb24ucHJvdG9jb2wpXG4gICAgICAgIGlmIGNvbm5lY3Rpb24gPT0gQHNlbGVjdGVkQ29ubmVjdGlvblxuICAgICAgICAgICRsaS5hZGRDbGFzcygnZGVmYXVsdCcpXG4gICAgICAgICRkaXYubW91c2Vkb3duIChlKSA9PlxuICAgICAgICAgICRsaSA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKVxuICAgICAgICAgICRsaS5wYXJlbnQoKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgJGxpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICAgJGxpLnBhcmVudCgpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgICAgICRsaS5hZGRDbGFzcygnZGVmYXVsdCcpXG4gICAgICAgICAgQGV4cGFuZENvbm5lY3Rpb24oJGxpKSBpZiBlLndoaWNoICE9IDNcbiAgICAgICAgJGRpdi50ZXh0KGNvbm5lY3Rpb24pXG4gICAgICAgICRkaXYucHJlcGVuZCgkaWNvbilcbiAgICAgICAgJGxpLmRhdGEoJ2l0ZW0nLGNvbm5lY3Rpb24pXG4gICAgICAgICRsaS5odG1sKCRkaXYpXG4gICAgICAgIEBzZXRJdGVtQ2xhc3Nlcyhjb25uZWN0aW9uLCRsaSlcbiAgICAgICAgJG9sLmFwcGVuZCgkbGkpXG5cbiAgZXhwYW5kQ29ubmVjdGlvbjogKCRsaSxjYWxsYmFjayktPlxuICAgIGNvbm5lY3Rpb24gPSAkbGkuZGF0YSgnaXRlbScpXG4gICAgaWYgY29ubmVjdGlvbiAhPSBAc2VsZWN0ZWRDb25uZWN0aW9uXG4gICAgICBAc2VsZWN0ZWRDb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuY29ubmVjdGlvblNlbGVjdGVkJyxbY29ubmVjdGlvbl0pXG4gICAgJGxpLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQgZXhwYW5kZWQnKVxuICAgIGlmICRsaS5oYXNDbGFzcyhcImV4cGFuZGVkXCIpXG4gICAgICBjb25uZWN0aW9uLmdldERhdGFiYXNlcyAoZGF0YWJhc2VzLGVycikgPT5cbiAgICAgICAgdW5sZXNzIGVyclxuICAgICAgICAgIEBzaG93SXRlbXMoY29ubmVjdGlvbixkYXRhYmFzZXMsJGxpKVxuICAgICAgICAgIGNhbGxiYWNrKCkgaWYgY2FsbGJhY2tcblxuICBzaG93SXRlbXM6IChwYXJlbnRJdGVtLGNoaWxkcmVuSXRlbXMsJGUpLT5cbiAgICBvbF9jbGFzcyA9IHN3aXRjaCBwYXJlbnRJdGVtLmNoaWxkX3R5cGVcbiAgICAgIHdoZW4gJ2RhdGFiYXNlJ1xuICAgICAgICBcInF1aWNrLXF1ZXJ5LWRhdGFiYXNlc1wiXG4gICAgICB3aGVuICdzY2hlbWEnXG4gICAgICAgIFwicXVpY2stcXVlcnktc2NoZW1hc1wiXG4gICAgICB3aGVuICd0YWJsZSdcbiAgICAgICAgXCJxdWljay1xdWVyeS10YWJsZXNcIlxuICAgICAgd2hlbiAnY29sdW1uJ1xuICAgICAgICBcInF1aWNrLXF1ZXJ5LWNvbHVtbnNcIlxuICAgICRvbCA9ICRlLmZpbmQoXCJvbC4je29sX2NsYXNzfVwiKVxuICAgIGlmICRvbC5sZW5ndGggPT0gMFxuICAgICAgJG9sID0gJCgnPG9sLz4nKS5hZGRDbGFzcygnbGlzdC10cmVlIGVudHJpZXMnKVxuICAgICAgaWYgcGFyZW50SXRlbS5jaGlsZF90eXBlICE9ICdjb2x1bW4nXG4gICAgICAgICRvbC5hZGRDbGFzcyhcImhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlblwiKVxuICAgICAgJG9sLmFkZENsYXNzKG9sX2NsYXNzKVxuICAgICAgJGUuYXBwZW5kKCRvbClcbiAgICBlbHNlXG4gICAgICAkb2wuZW1wdHkoKVxuICAgIGlmIHBhcmVudEl0ZW0uY2hpbGRfdHlwZSAhPSAnY29sdW1uJ1xuICAgICAgY2hpbGRyZW5JdGVtcyA9IGNoaWxkcmVuSXRlbXMuc29ydChAY29tcGFyZUl0ZW1OYW1lKVxuICAgIGZvciBjaGlsZEl0ZW0gaW4gY2hpbGRyZW5JdGVtc1xuICAgICAgJGxpID0gJCgnPGxpLz4nKS5hZGRDbGFzcygnZW50cnknKVxuICAgICAgJGRpdiA9ICQoJzxkaXYvPicpLmFkZENsYXNzKCdoZWFkZXIgbGlzdC1pdGVtJylcbiAgICAgICRpY29uID0gJCgnPHNwYW4vPicpLmFkZENsYXNzKCdpY29uJylcbiAgICAgIGlmIGNoaWxkSXRlbS50eXBlICE9ICdjb2x1bW4nXG4gICAgICAgICRsaS5hZGRDbGFzcygnbGlzdC1uZXN0ZWQtaXRlbSBjb2xsYXBzZWQnKVxuICAgICAgaWYgY2hpbGRJdGVtLnR5cGUgPT0gJ2RhdGFiYXNlJyAmJiBjaGlsZEl0ZW0ubmFtZSA9PSBAc2VsZWN0ZWRDb25uZWN0aW9uLmdldERlZmF1bHREYXRhYmFzZSgpXG4gICAgICAgICRsaS5hZGRDbGFzcygnZGVmYXVsdCcpXG4gICAgICAkZGl2Lm1vdXNlZG93biAoZSkgPT5cbiAgICAgICAgJGxpID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpXG4gICAgICAgICRsaS5jbG9zZXN0KCdvbCNxdWljay1xdWVyeS1jb25uZWN0aW9ucycpLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJGxpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgIEBleHBhbmRJdGVtKCRsaSkgaWYgZS53aGljaCAhPSAzXG4gICAgICAkZGl2LnRleHQoY2hpbGRJdGVtKVxuICAgICAgJGRpdi5wcmVwZW5kKCRpY29uKVxuICAgICAgJGxpLmF0dHIoJ2RhdGEtbmFtZScsY2hpbGRJdGVtLm5hbWUpXG4gICAgICAkbGkuZGF0YSgnaXRlbScsY2hpbGRJdGVtKVxuICAgICAgJGxpLmh0bWwoJGRpdilcbiAgICAgIEBzZXRJdGVtQ2xhc3NlcyhjaGlsZEl0ZW0sJGxpKVxuICAgICAgJG9sLmFwcGVuZCgkbGkpXG5cbiAgc2V0SXRlbUNsYXNzZXM6IChpdGVtLCRsaSktPlxuICAgICRkaXYgPSAkbGkuY2hpbGRyZW4oJy5oZWFkZXInKVxuICAgICRpY29uID0gJGRpdi5jaGlsZHJlbignLmljb24nKVxuICAgIHN3aXRjaCBpdGVtLnR5cGVcbiAgICAgIHdoZW4gJ2Nvbm5lY3Rpb24nXG4gICAgICAgICRsaS5hZGRDbGFzcygncXVpY2stcXVlcnktY29ubmVjdGlvbicpXG4gICAgICAgICRkaXYuYWRkQ2xhc3MoXCJxcS1jb25uZWN0aW9uLWl0ZW1cIilcbiAgICAgICAgJGljb24uYWRkQ2xhc3MoJ2ljb24tcGx1ZycpXG4gICAgICB3aGVuICdkYXRhYmFzZSdcbiAgICAgICAgJGxpLmFkZENsYXNzKCdxdWljay1xdWVyeS1kYXRhYmFzZScpXG4gICAgICAgICRkaXYuYWRkQ2xhc3MoXCJxcS1kYXRhYmFzZS1pdGVtXCIpXG4gICAgICAgICRpY29uLmFkZENsYXNzKCdpY29uLWRhdGFiYXNlJylcbiAgICAgIHdoZW4gJ3NjaGVtYSdcbiAgICAgICAgJGxpLmFkZENsYXNzKCdxdWljay1xdWVyeS1zY2hlbWEnKVxuICAgICAgICAkZGl2LmFkZENsYXNzKFwicXEtc2NoZW1hLWl0ZW1cIilcbiAgICAgICAgJGljb24uYWRkQ2xhc3MoJ2ljb24tYm9vaycpXG4gICAgICB3aGVuICd0YWJsZSdcbiAgICAgICAgJGxpLmFkZENsYXNzKCdxdWljay1xdWVyeS10YWJsZScpXG4gICAgICAgICRkaXYuYWRkQ2xhc3MoXCJxcS10YWJsZS1pdGVtXCIpXG4gICAgICAgICRpY29uLmFkZENsYXNzKCdpY29uLWJyb3dzZXInKVxuICAgICAgd2hlbiAnY29sdW1uJ1xuICAgICAgICAkbGkuYWRkQ2xhc3MoJ3F1aWNrLXF1ZXJ5LWNvbHVtbicpXG4gICAgICAgICRkaXYuYWRkQ2xhc3MoXCJxcS1jb2x1bW4taXRlbVwiKVxuICAgICAgICBpZiBpdGVtLnByaW1hcnlfa2V5XG4gICAgICAgICAgJGljb24uYWRkQ2xhc3MoJ2ljb24ta2V5JylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICRpY29uLmFkZENsYXNzKCdpY29uLXRhZycpXG5cbiAgZXhwYW5kSXRlbTogKCRsaSxjYWxsYmFjaykgLT5cbiAgICAkbGkudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCBleHBhbmRlZCcpXG4gICAgaWYgJGxpLmhhc0NsYXNzKFwiZXhwYW5kZWRcIilcbiAgICAgIG1vZGVsID0gJGxpLmRhdGEoJ2l0ZW0nKVxuICAgICAgbW9kZWwuY2hpbGRyZW4gKGNoaWxkcmVuKSA9PlxuICAgICAgICBAc2hvd0l0ZW1zKG1vZGVsLGNoaWxkcmVuLCRsaSlcbiAgICAgICAgY2FsbGJhY2soY2hpbGRyZW4pIGlmIGNhbGxiYWNrXG5cbiAgcmVmcmVzaFRyZWU6IChtb2RlbCktPlxuICAgICRsaSA9IHN3aXRjaCBtb2RlbC50eXBlXG4gICAgICB3aGVuICdjb25uZWN0aW9uJ1xuICAgICAgICBAZmluZCgnbGkucXVpY2stcXVlcnktY29ubmVjdGlvbicpLmZpbHRlciAoaSxlKS0+XG4gICAgICAgICAgJChlKS5kYXRhKCdpdGVtJykgPT0gbW9kZWxcbiAgICAgIHdoZW4gJ2RhdGFiYXNlJ1xuICAgICAgICBAZmluZCgnbGkucXVpY2stcXVlcnktY29ubmVjdGlvbicpLmZpbHRlciAoaSxlKS0+XG4gICAgICAgICAgJChlKS5kYXRhKCdpdGVtJykgPT0gbW9kZWwucGFyZW50KClcbiAgICAgIHdoZW4gJ3RhYmxlJ1xuICAgICAgICBAZmluZCgnbGkucXVpY2stcXVlcnktZGF0YWJhc2UnKS5maWx0ZXIgKGksZSktPlxuICAgICAgICAgICQoZSkuZGF0YSgnaXRlbScpID09IG1vZGVsLnBhcmVudCgpXG4gICAgICB3aGVuICdjb2x1bW4nXG4gICAgICAgIEBmaW5kKCdsaS5xdWljay1xdWVyeS10YWJsZScpLmZpbHRlciAoaSxlKS0+XG4gICAgICAgICAgJChlKS5kYXRhKCdpdGVtJykgPT0gbW9kZWwucGFyZW50KClcbiAgICAkbGkucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpXG4gICAgJGxpLmFkZENsYXNzKCdleHBhbmRlZCcpXG4gICAgJGxpLmZpbmQoJ29sJykuZW1wdHkoKTtcbiAgICBtb2RlbC5wYXJlbnQoKS5jaGlsZHJlbiAoY2hpbGRyZW4pID0+XG4gICAgICBAc2hvd0l0ZW1zKG1vZGVsLnBhcmVudCgpLGNoaWxkcmVuLCRsaSlcblxuICBleHBhbmQ6IChtb2RlbCxjYWxsYmFjayktPlxuICAgIGlmIG1vZGVsLnR5cGUgPT0gJ2Nvbm5lY3Rpb24nXG4gICAgICAkb2wgPSBAZmluZCgnb2wjcXVpY2stcXVlcnktY29ubmVjdGlvbnMnKVxuICAgICAgJG9sLmNoaWxkcmVuKCkuZWFjaCAoaSxsaSkgPT5cbiAgICAgICAgaWYgJChsaSkuZGF0YSgnaXRlbScpID09IG1vZGVsXG4gICAgICAgICAgJChsaSkucmVtb3ZlQ2xhc3MoJ2V4cGFuZGVkJykuYWRkQ2xhc3MoJ2NvbGxhcHNlZCcpICNIQUNLP1xuICAgICAgICAgIEBleHBhbmRDb25uZWN0aW9uICQobGkpICwgPT5cbiAgICAgICAgICAgIGNhbGxiYWNrKCQobGkpKSBpZiBjYWxsYmFja1xuICAgIGVsc2VcbiAgICAgIHBhcmVudCA9IG1vZGVsLnBhcmVudCgpXG4gICAgICBAZXhwYW5kIHBhcmVudCwgKCRsaSkgPT5cbiAgICAgICAgJG9sID0gJGxpLmNoaWxkcmVuKFwib2xcIilcbiAgICAgICAgJG9sLmNoaWxkcmVuKCkuZWFjaCAoaSxsaSkgPT5cbiAgICAgICAgICBpdGVtID0gJChsaSkuZGF0YSgnaXRlbScpXG4gICAgICAgICAgaWYgaXRlbSAmJiBpdGVtLm5hbWUgPT0gbW9kZWwubmFtZSAmJiBpdGVtLnR5cGUgPT0gbW9kZWwudHlwZVxuICAgICAgICAgICAgQGV4cGFuZEl0ZW0gJChsaSkgLCA9PlxuICAgICAgICAgICAgICBjYWxsYmFjaygkKGxpKSkgaWYgY2FsbGJhY2tcblxuICByZXZlYWw6IChtb2RlbCxjYWxsYmFjaykgLT5cbiAgICBAZXhwYW5kIG1vZGVsLCAoJGxpKSA9PlxuICAgICAgJGxpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG4gICAgICB0b3AgPSAkbGkucG9zaXRpb24oKS50b3BcbiAgICAgIGJvdHRvbSA9IHRvcCArICRsaS5vdXRlckhlaWdodCgpXG4gICAgICBpZiBib3R0b20gPiBAc2Nyb2xsZXIuc2Nyb2xsQm90dG9tKClcbiAgICAgICAgQHNjcm9sbGVyLnNjcm9sbEJvdHRvbShib3R0b20pXG4gICAgICBpZiB0b3AgPCBAc2Nyb2xsZXIuc2Nyb2xsVG9wKClcbiAgICAgICAgQHNjcm9sbGVyLnNjcm9sbFRvcCh0b3ApXG4gICAgICBjYWxsYmFjaygpIGlmIGNhbGxiYWNrXG5cbiAgY29tcGFyZUl0ZW1OYW1lOiAoaXRlbTEsaXRlbTIpLT5cbiAgICBpZiAoaXRlbTEubmFtZSA8IGl0ZW0yLm5hbWUpXG4gICAgICByZXR1cm4gLTFcbiAgICBlbHNlIGlmIChpdGVtMS5uYW1lID4gaXRlbTIubmFtZSlcbiAgICAgIHJldHVybiAxXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIDBcblxuICBzaW1wbGVTZWxlY3Q6IC0+XG4gICAgJGxpID0gQGZpbmQoJ2xpLnNlbGVjdGVkLnF1aWNrLXF1ZXJ5LXRhYmxlJylcbiAgICBpZiAkbGkubGVuZ3RoID4gMFxuICAgICAgbW9kZWwgPSAkbGkuZGF0YSgnaXRlbScpXG4gICAgICBtb2RlbC5jb25uZWN0aW9uLmdldENvbHVtbnMgbW9kZWwgLChjb2x1bW5zKSA9PlxuICAgICAgICB0ZXh0ID0gbW9kZWwuY29ubmVjdGlvbi5zaW1wbGVTZWxlY3QobW9kZWwsY29sdW1ucylcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGVkaXRvcikgPT5cbiAgICAgICAgICBncmFtbWFycyA9IGF0b20uZ3JhbW1hcnMuZ2V0R3JhbW1hcnMoKVxuICAgICAgICAgIGdyYW1tYXIgPSAoaSBmb3IgaSBpbiBncmFtbWFycyB3aGVuIGkubmFtZSBpcyAnU1FMJylbMF1cbiAgICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbiAgY29weTogLT5cbiAgICAkbGkgPSBAZmluZCgnbGkuc2VsZWN0ZWQnKVxuICAgICRoZWFkZXIgPSAkbGkuY2hpbGRyZW4oJ2Rpdi5oZWFkZXInKVxuICAgIGlmICRoZWFkZXIubGVuZ3RoID4gMFxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoJGhlYWRlci50ZXh0KCkpXG5cbiAgY3JlYXRlOiAtPlxuICAgICRsaSA9IEBmaW5kKCdsaS5zZWxlY3RlZCcpXG4gICAgaWYgJGxpLmxlbmd0aCA+IDBcbiAgICAgIG1vZGVsID0gJGxpLmRhdGEoJ2l0ZW0nKVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuZWRpdCcsWydjcmVhdGUnLG1vZGVsXSlcblxuXG4gIGFsdGVyOiAtPlxuICAgICRsaSA9IEBmaW5kKCdsaS5zZWxlY3RlZCcpXG4gICAgaWYgJGxpLmxlbmd0aCA+IDBcbiAgICAgIG1vZGVsID0gJGxpLmRhdGEoJ2l0ZW0nKVxuICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuZWRpdCcsWydhbHRlcicsbW9kZWxdKVxuXG4gIGRyb3A6IC0+XG4gICAgJGxpID0gQGZpbmQoJ2xpLnNlbGVjdGVkJylcbiAgICBpZiAkbGkubGVuZ3RoID4gMFxuICAgICAgbW9kZWwgPSAkbGkuZGF0YSgnaXRlbScpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5lZGl0JyxbJ2Ryb3AnLG1vZGVsXSlcblxuICBzZWxlY3RDb25uZWN0aW9uOiAoY29ubmVjdGlvbiktPlxuICAgIHJldHVybiB1bmxlc3MgY29ubmVjdGlvbiAhPSBAc2VsZWN0ZWRDb25uZWN0aW9uXG4gICAgJG9sID0gQGZpbmQoJ29sI3F1aWNrLXF1ZXJ5LWNvbm5lY3Rpb25zJylcbiAgICAkb2wuY2hpbGRyZW4oKS5lYWNoIChpLGxpKSA9PlxuICAgICAgaWYgJChsaSkuZGF0YSgnaXRlbScpID09IGNvbm5lY3Rpb25cbiAgICAgICAgJG9sLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgICAkKGxpKS5hZGRDbGFzcygnZGVmYXVsdCcpXG4gICAgICAgIEBzZWxlY3RlZENvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LmNvbm5lY3Rpb25TZWxlY3RlZCcsW2Nvbm5lY3Rpb25dKVxuXG4gICNldmVudHNcbiAgb25Db25uZWN0aW9uU2VsZWN0ZWQ6IChjYWxsYmFjayktPlxuICAgIEBiaW5kICdxdWlja1F1ZXJ5LmNvbm5lY3Rpb25TZWxlY3RlZCcsIChlLGNvbm5lY3Rpb24pID0+XG4gICAgICBjYWxsYmFjayhjb25uZWN0aW9uKVxuXG4gIG9uQ29ubmVjdGlvbkRlbGV0ZWQ6IChjYWxsYmFjayktPlxuICAgIEBiaW5kICdxdWlja1F1ZXJ5LmNvbm5lY3Rpb25EZWxldGVkJywgKGUsY29ubmVjdGlvbikgPT5cbiAgICAgIGNhbGxiYWNrKGNvbm5lY3Rpb24pXG5cbiAgI3Jlc2l6aW5nIG1ldGhvZHMgY29waWVkIGZyb20gdHJlZS12aWV3XG4gIGhhbmRsZVJlc2l6ZUV2ZW50czogLT5cbiAgICBAb24gJ2RibGNsaWNrJywgJy50cmVlLXZpZXctcmVzaXplLWhhbmRsZScsICAoZSkgPT4gQHJlc2l6ZVRvRml0Q29udGVudCgpXG4gICAgQG9uICdtb3VzZWRvd24nLCAnLnRyZWUtdmlldy1yZXNpemUtaGFuZGxlJywgKGUpID0+IEByZXNpemVTdGFydGVkKGUpXG4gIHJlc2l6ZVN0YXJ0ZWQ6ID0+XG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEByZXNpemVUcmVlVmlldylcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICByZXNpemVTdG9wcGVkOiA9PlxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVRyZWVWaWV3KVxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICByZXNpemVUcmVlVmlldzogKHtwYWdlWCwgd2hpY2h9KSA9PlxuICAgIHJldHVybiBAcmVzaXplU3RvcHBlZCgpIHVubGVzcyB3aGljaCBpcyAxXG4gICAgaWYgQGRhdGEoJ3Nob3ctb24tcmlnaHQtc2lkZScpXG4gICAgICB3aWR0aCA9ICBAb3V0ZXJXaWR0aCgpICsgQG9mZnNldCgpLmxlZnQgLSBwYWdlWFxuICAgIGVsc2VcbiAgICAgIHdpZHRoID0gcGFnZVggLSBAb2Zmc2V0KCkubGVmdFxuICAgIEB3aWR0aCh3aWR0aClcbiAgcmVzaXplVG9GaXRDb250ZW50OiAtPlxuICAgIEB3aWR0aCgxKSAjIFNocmluayB0byBtZWFzdXJlIHRoZSBtaW5pbXVtIHdpZHRoIG9mIGxpc3RcbiAgICBAd2lkdGgoQGxpc3Qub3V0ZXJXaWR0aCgpKVxuIl19
