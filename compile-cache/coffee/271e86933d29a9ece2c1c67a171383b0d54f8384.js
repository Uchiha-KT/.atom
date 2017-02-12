(function() {
  var CompositeDisposable, QuickQuery, QuickQueryAutocomplete, QuickQueryBrowserView, QuickQueryConnectView, QuickQueryEditorView, QuickQueryMysqlConnection, QuickQueryPostgresConnection, QuickQueryResultView, QuickQueryTableFinderView;

  QuickQueryConnectView = require('./quick-query-connect-view');

  QuickQueryResultView = require('./quick-query-result-view');

  QuickQueryBrowserView = require('./quick-query-browser-view');

  QuickQueryEditorView = require('./quick-query-editor-view');

  QuickQueryTableFinderView = require('./quick-query-table-finder-view');

  QuickQueryMysqlConnection = require('./quick-query-mysql-connection');

  QuickQueryPostgresConnection = require('./quick-query-postgres-connection');

  QuickQueryAutocomplete = require('./quick-query-autocomplete');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = QuickQuery = {
    config: {
      autompleteIntegration: {
        type: 'boolean',
        "default": true,
        title: 'Autocomplete integration'
      },
      canUseStatusBar: {
        type: 'boolean',
        "default": true,
        title: 'Show info in status bar'
      },
      resultsInTab: {
        type: 'boolean',
        "default": false,
        title: 'Show results in a tab'
      },
      showBrowserOnLeftSide: {
        type: 'boolean',
        "default": false,
        title: 'Show browser on left side'
      }
    },
    editorView: null,
    browser: null,
    modalPanel: null,
    bottomPanel: null,
    sidePanel: null,
    subscriptions: null,
    connection: null,
    connections: null,
    queryEditors: [],
    tableFinder: null,
    activate: function(state) {
      var connectionInfo, connectionPromise, j, len, protocols, ref;
      protocols = {
        mysql: {
          name: "MySql",
          handler: QuickQueryMysqlConnection
        },
        postgres: {
          name: "PostgreSQL",
          handler: QuickQueryPostgresConnection
        },
        "ssl-postgres": {
          name: "PostgreSQL (ssl)",
          handler: QuickQueryPostgresConnection,
          "default": {
            protocol: 'postgres',
            ssl: true
          }
        }
      };
      this.connections = [];
      this.tableFinder = new QuickQueryTableFinderView();
      this.browser = new QuickQueryBrowserView();
      if (state.browserWidth != null) {
        this.browser.width(state.browserWidth);
      }
      this.connectView = new QuickQueryConnectView(protocols);
      if (state.connections) {
        ref = state.connections;
        for (j = 0, len = ref.length; j < len; j++) {
          connectionInfo = ref[j];
          connectionPromise = this.connectView.buildConnection(connectionInfo);
          this.browser.addConnection(connectionPromise);
        }
      }
      this.browser.onConnectionSelected((function(_this) {
        return function(connection) {
          return _this.connection = connection;
        };
      })(this));
      this.browser.onConnectionDeleted((function(_this) {
        return function(connection) {
          var i;
          i = _this.connections.indexOf(connection);
          _this.connections.splice(i, 1);
          connection.close();
          if (_this.connections.length > 0) {
            return _this.browser.selectConnection(_this.connections[_this.connections.length - 1]);
          } else {
            return _this.connection = null;
          }
        };
      })(this));
      this.browser.bind('quickQuery.edit', (function(_this) {
        return function(e, action, model) {
          _this.editorView = new QuickQueryEditorView(action, model);
          if (action === 'drop') {
            return _this.editorView.openTextEditor();
          } else {
            if (_this.modalPanel != null) {
              _this.modalPanel.destroy();
            }
            _this.modalPanel = atom.workspace.addModalPanel({
              item: _this.editorView,
              visible: true
            });
            return _this.editorView.focusFirst();
          }
        };
      })(this));
      this.tableFinder.onCanceled((function(_this) {
        return function() {
          return _this.modalPanel.destroy();
        };
      })(this));
      this.tableFinder.onFound((function(_this) {
        return function(table) {
          _this.modalPanel.destroy();
          return _this.browser.reveal(table, function() {
            return _this.browser.simpleSelect();
          });
        };
      })(this));
      this.connectView.onConnectionStablished((function(_this) {
        return function(connection) {
          _this.connections.push(connection);
          return connection.sentenceReady(function(text) {
            return _this.addSentence(text);
          });
        };
      })(this));
      this.connectView.onWillConnect((function(_this) {
        return function(connectionPromise) {
          _this.browser.addConnection(connectionPromise);
          return connectionPromise.then(function(connection) {
            return _this.modalPanel.destroy();
          }, function(err) {
            return _this.setModalPanel({
              content: err,
              type: 'error'
            });
          });
        };
      })(this));
      if (atom.config.get('quick-query.showBrowserOnLeftSide')) {
        this.sidePanel = atom.workspace.addLeftPanel({
          item: this.browser,
          visible: false
        });
      } else {
        this.sidePanel = atom.workspace.addRightPanel({
          item: this.browser,
          visible: false
        });
      }
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'quick-query:run': (function(_this) {
          return function() {
            return _this.run();
          };
        })(this),
        'quick-query:new-editor': (function(_this) {
          return function() {
            return _this.newEditor();
          };
        })(this),
        'quick-query:toggle-browser': (function(_this) {
          return function() {
            return _this.toggleBrowser();
          };
        })(this),
        'quick-query:toggle-results': (function(_this) {
          return function() {
            return _this.toggleResults();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'quick-query:new-connection': (function(_this) {
          return function() {
            return _this.newConnection();
          };
        })(this),
        'quick-query:find-table-to-select': (function(_this) {
          return function() {
            return _this.findTable();
          };
        })(this)
      }));
      atom.commands.add('.quick-query-result', {
        'quick-query:copy': (function(_this) {
          return function() {
            return _this.activeResultView().copy();
          };
        })(this),
        'quick-query:copy-all': (function(_this) {
          return function() {
            return _this.activeResultView().copyAll();
          };
        })(this),
        'quick-query:save-csv': (function(_this) {
          return function() {
            return _this.activeResultView().saveCSV();
          };
        })(this),
        'quick-query:insert': (function(_this) {
          return function() {
            return _this.activeResultView().insertRecord();
          };
        })(this),
        'quick-query:null': (function(_this) {
          return function() {
            return _this.activeResultView().setNull();
          };
        })(this),
        'quick-query:undo': (function(_this) {
          return function() {
            return _this.activeResultView().undo();
          };
        })(this),
        'quick-query:delete': (function(_this) {
          return function() {
            return _this.activeResultView().deleteRecord();
          };
        })(this),
        'quick-query:apply': (function(_this) {
          return function() {
            return _this.activeResultView().apply();
          };
        })(this)
      });
      atom.config.onDidChange('quick-query.resultsInTab', (function(_this) {
        return function(arg) {
          var i, k, len1, newValue, oldValue, ref1;
          newValue = arg.newValue, oldValue = arg.oldValue;
          if (!newValue) {
            ref1 = _this.queryEditors;
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              i = ref1[k];
              i.panel.hide();
              i.panel.destroy();
            }
            return _this.queryEditors = [];
          }
        };
      })(this));
      atom.config.onDidChange('quick-query.showBrowserOnLeftSide', (function(_this) {
        return function(arg) {
          var newValue, oldValue, visible;
          newValue = arg.newValue, oldValue = arg.oldValue;
          visible = _this.browser.is(':visible');
          _this.browser.attr('data-show-on-right-side', !newValue);
          _this.browser.data('show-on-right-side', !newValue);
          _this.sidePanel.destroy();
          if (newValue) {
            return _this.sidePanel = atom.workspace.addLeftPanel({
              item: _this.browser,
              visible: visible
            });
          } else {
            return _this.sidePanel = atom.workspace.addRightPanel({
              item: _this.browser,
              visible: visible
            });
          }
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var i, k, len1, ref1, resultView, results;
          _this.hideStatusBar();
          if (!atom.config.get('quick-query.resultsInTab')) {
            ref1 = _this.queryEditors;
            results = [];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              i = ref1[k];
              resultView = i.panel.getItem();
              if (i.editor === item && !resultView.hiddenResults()) {
                i.panel.show();
                resultView.fixNumbers();
              } else {
                i.panel.hide();
              }
              if (i.editor === item) {
                results.push(_this.updateStatusBar(resultView));
              } else {
                results.push(void 0);
              }
            }
            return results;
          } else if (item instanceof QuickQueryResultView) {
            return _this.updateStatusBar(item);
          }
        };
      })(this));
      return atom.workspace.paneContainer.onDidDestroyPaneItem((function(_this) {
        return function(d) {
          return _this.queryEditors = _this.queryEditors.filter(function(i) {
            if (i.editor === d.item) {
              i.panel.destroy();
            }
            return i.editor !== d.item;
          });
        };
      })(this));
    },
    addSentence: function(text) {
      var queryEditor;
      queryEditor = atom.workspace.getActiveTextEditor();
      if (queryEditor) {
        queryEditor.moveToBottom();
        queryEditor.insertNewline();
        return queryEditor.insertText(text);
      } else {
        return atom.workspace.open().then((function(_this) {
          return function(editor) {
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
          };
        })(this));
      }
    },
    deactivate: function() {
      var c, i, item, j, k, l, len, len1, len2, pane, ref, ref1, ref2, ref3, ref4, results;
      ref = this.connections;
      for (j = 0, len = ref.length; j < len; j++) {
        c = ref[j];
        c.close();
      }
      this.subscriptions.dispose();
      ref1 = this.queryEditors;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        i = ref1[k];
        i.panel.destroy();
      }
      this.browser.destroy();
      this.connectView.destroy();
      if ((ref2 = this.modalPanel) != null) {
        ref2.destroy();
      }
      if ((ref3 = this.statusBarTile) != null) {
        ref3.destroy();
      }
      pane = atom.workspace.getActivePane();
      ref4 = pane.getItems();
      results = [];
      for (l = 0, len2 = ref4.length; l < len2; l++) {
        item = ref4[l];
        if (item instanceof QuickQueryResultView) {
          results.push(pane.destroyItem(item));
        }
      }
      return results;
    },
    serialize: function() {
      return {
        connections: this.connections.map(function(c) {
          return c.serialize();
        }),
        browserWidth: this.browser.width()
      };
    },
    newEditor: function() {
      return atom.workspace.open().then((function(_this) {
        return function(editor) {
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
          return editor.setGrammar(grammar);
        };
      })(this));
    },
    newConnection: function() {
      if (this.modalPanel != null) {
        this.modalPanel.destroy();
      }
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.connectView,
        visible: true
      });
      return this.connectView.focusFirst();
    },
    run: function() {
      var text;
      this.queryEditor = atom.workspace.getActiveTextEditor();
      if (!this.queryEditor) {
        this.setModalPanel({
          content: "This tab is not an editor",
          type: 'error'
        });
        return;
      }
      text = this.queryEditor.getSelectedText();
      if (text === '') {
        text = this.queryEditor.getText();
      }
      if (this.connection) {
        this.setModalPanel({
          content: "Running query...",
          spinner: true
        });
        return this.connection.query(text, (function(_this) {
          return function(message, rows, fields) {
            var queryResult;
            if (_this.modalPanel != null) {
              _this.modalPanel.destroy();
            }
            if (message) {
              if (message.type === 'error') {
                _this.setModalPanel(message);
              } else {
                _this.addInfoNotification(message.content);
              }
              if (message.type === 'success') {
                return _this.afterExecute(_this.queryEditor);
              }
            } else {
              _this.setModalPanel({
                content: "Loading results...",
                spinner: true
              });
              if (atom.config.get('quick-query.resultsInTab')) {
                queryResult = _this.showResultInTab();
              } else {
                queryResult = _this.showResultView(_this.queryEditor);
              }
              queryResult.showRows(rows, fields, _this.connection, function() {
                if (_this.modalPanel) {
                  _this.modalPanel.destroy();
                }
                if (rows.length > 100) {
                  return queryResult.fixSizes();
                }
              });
              queryResult.fixSizes();
              return _this.updateStatusBar(queryResult);
            }
          };
        })(this));
      } else {
        return this.addWarningNotification("No connection selected");
      }
    },
    toggleBrowser: function() {
      if (this.browser.is(':visible')) {
        return this.sidePanel.hide();
      } else {
        this.browser.showConnections();
        return this.sidePanel.show();
      }
    },
    findTable: function() {
      if (this.connection) {
        this.tableFinder.searchTable(this.connection);
        if (this.modalPanel != null) {
          this.modalPanel.destroy();
        }
        this.modalPanel = atom.workspace.addModalPanel({
          item: this.tableFinder,
          visible: true
        });
        return this.tableFinder.focusFilterEditor();
      } else {
        return this.addWarningNotification("No connection selected");
      }
    },
    addWarningNotification: function(message) {
      var notification, ref;
      notification = atom.notifications.addWarning(message);
      return (ref = atom.views.getView(notification)) != null ? ref.addEventListener('click', function(e) {
        return this.removeNotification();
      }) : void 0;
    },
    addInfoNotification: function(message) {
      var notification, ref;
      notification = atom.notifications.addInfo(message);
      return (ref = atom.views.getView(notification)) != null ? ref.addEventListener('click', function(e) {
        return this.removeNotification();
      }) : void 0;
    },
    setModalPanel: function(message) {
      var close, copy, item, spinner;
      item = document.createElement('div');
      item.classList.add('quick-query-modal-message');
      item.textContent = message.content;
      if ((message.spinner != null) && message.spinner) {
        spinner = document.createElement('span');
        spinner.classList.add('loading');
        spinner.classList.add('loading-spinner-tiny');
        spinner.classList.add('inline-block');
        item.insertBefore(spinner, item.childNodes[0]);
      }
      if (message.type === 'error') {
        item.classList.add('text-error');
        copy = document.createElement('span');
        copy.classList.add('icon');
        copy.classList.add('icon-clippy');
        copy.setAttribute('title', "Copy to clipboard");
        copy.setAttribute('data-error', message.content);
        item.onmouseover = (function() {
          return this.classList.add('animated');
        });
        copy.onclick = (function() {
          return atom.clipboard.write(this.getAttribute('data-error'));
        });
        item.appendChild(copy);
      }
      close = document.createElement('span');
      close.classList.add('icon');
      close.classList.add('icon-x');
      close.onclick = ((function(_this) {
        return function() {
          return _this.modalPanel.destroy();
        };
      })(this));
      item.appendChild(close);
      if (this.modalPanel != null) {
        this.modalPanel.destroy();
      }
      return this.modalPanel = atom.workspace.addModalPanel({
        item: item,
        visible: true
      });
    },
    showResultInTab: function() {
      var filter, pane, queryResult;
      pane = atom.workspace.getActivePane();
      filter = pane.getItems().filter(function(item) {
        return item instanceof QuickQueryResultView;
      });
      if (filter.length === 0) {
        queryResult = new QuickQueryResultView();
        queryResult.onRowStatusChanged((function(_this) {
          return function() {
            return _this.updateStatusBar(queryResult);
          };
        })(this));
        pane.addItem(queryResult);
      } else {
        queryResult = filter[0];
      }
      pane.activateItem(queryResult);
      return queryResult;
    },
    afterExecute: function(queryEditor) {
      if (this.editorView && this.editorView.editor === queryEditor) {
        if (!(typeof queryEditor.getPath === "function" ? queryEditor.getPath() : void 0)) {
          queryEditor.setText('');
          atom.workspace.destroyActivePaneItem();
        }
        this.browser.refreshTree(this.editorView.model);
        if (this.modalPanel) {
          this.modalPanel.destroy();
        }
        return this.editorView = null;
      }
    },
    showResultView: function(queryEditor) {
      var bottomPanel, e, i, queryResult;
      e = (function() {
        var j, len, ref, results;
        ref = this.queryEditors;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (i.editor === queryEditor) {
            results.push(i);
          }
        }
        return results;
      }).call(this);
      if (e.length > 0) {
        e[0].panel.show();
        queryResult = e[0].panel.getItem();
      } else {
        queryResult = new QuickQueryResultView();
        queryResult.onRowStatusChanged((function(_this) {
          return function() {
            return _this.updateStatusBar(queryResult);
          };
        })(this));
        bottomPanel = atom.workspace.addBottomPanel({
          item: queryResult,
          visible: true
        });
        this.queryEditors.push({
          editor: queryEditor,
          panel: bottomPanel
        });
      }
      return queryResult;
    },
    activeResultView: function() {
      var editor, i, j, len, ref;
      if (atom.config.get('quick-query.resultsInTab')) {
        return atom.workspace.getActivePaneItem();
      } else {
        editor = atom.workspace.getActiveTextEditor();
        ref = this.queryEditors;
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (i.editor === editor) {
            return i.panel.getItem();
          }
        }
      }
    },
    provideBrowserView: function() {
      return this.browser;
    },
    provideConnectView: function() {
      return this.connectView;
    },
    provideAutocomplete: function() {
      return new QuickQueryAutocomplete(this.browser);
    },
    consumeStatusBar: function(statusBar) {
      var element;
      element = document.createElement('a');
      element.classList.add('quick-query-tile');
      element.classList.add('hide');
      element.onclick = ((function(_this) {
        return function() {
          return _this.toggleResults();
        };
      })(this));
      return this.statusBarTile = statusBar.addLeftTile({
        item: element,
        priority: 10
      });
    },
    hideStatusBar: function() {
      var span;
      if (this.statusBarTile != null) {
        span = this.statusBarTile.getItem();
        return span.classList.add('hide');
      }
    },
    updateStatusBar: function(queryResult) {
      var element;
      if (!((this.statusBarTile != null) && ((queryResult != null ? queryResult.rows : void 0) != null))) {
        return;
      }
      if (!atom.config.get('quick-query.canUseStatusBar')) {
        return;
      }
      element = this.statusBarTile.getItem();
      element.classList.remove('hide');
      if (atom.config.get('quick-query.resultsInTab')) {
        return element.textContent = "(" + (queryResult.rowsStatus()) + ")";
      } else {
        return element.textContent = (queryResult.getTitle()) + " (" + (queryResult.rowsStatus()) + ")";
      }
    },
    toggleResults: function() {
      var editor, i, j, len, ref, resultView, results;
      if (!atom.config.get('quick-query.resultsInTab')) {
        editor = atom.workspace.getActiveTextEditor();
        ref = this.queryEditors;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          if (!(i.editor === editor)) {
            continue;
          }
          resultView = i.panel.getItem();
          if (resultView.is(':visible')) {
            i.panel.hide();
            results.push(resultView.hideResults());
          } else {
            i.panel.show();
            results.push(resultView.showResults());
          }
        }
        return results;
      }
    },
    cancel: function() {
      var i, j, len, ref, resultView, results;
      if (this.modalPanel) {
        this.modalPanel.destroy();
      }
      ref = this.queryEditors;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        if (i.editor === atom.workspace.getActiveTextEditor()) {
          resultView = i.panel.getItem();
          i.panel.hide();
          results.push(resultView.hideResults());
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEscUJBQUEsR0FBd0IsT0FBQSxDQUFRLDRCQUFSOztFQUN4QixvQkFBQSxHQUF1QixPQUFBLENBQVEsMkJBQVI7O0VBQ3ZCLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSw0QkFBUjs7RUFDeEIsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDJCQUFSOztFQUN2Qix5QkFBQSxHQUE0QixPQUFBLENBQVEsaUNBQVI7O0VBQzVCLHlCQUFBLEdBQTRCLE9BQUEsQ0FBUSxnQ0FBUjs7RUFDNUIsNEJBQUEsR0FBK0IsT0FBQSxDQUFRLG1DQUFSOztFQUMvQixzQkFBQSxHQUF5QixPQUFBLENBQVEsNEJBQVI7O0VBRXhCLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLDBCQUZQO09BREY7TUFJQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyx5QkFGUDtPQUxGO01BUUEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxLQUFBLEVBQU8sdUJBRlA7T0FURjtNQVlBLHFCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLEtBQUEsRUFBTywyQkFGUDtPQWJGO0tBREY7SUFr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QSxVQUExQjtRQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLEVBQUE7O0FBQ0E7QUFBQTtXQUFBLHFDQUFBOztRQUNFLElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBZjtVQUNFLFVBQUEsR0FBYSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQVIsQ0FBQTtVQUNiLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBUixDQUFBO3VCQUNBLFVBQVUsQ0FBQyxXQUFYLENBQUEsR0FIRjtTQUFBLE1BQUE7K0JBQUE7O0FBREY7O0lBRk0sQ0EvV1I7O0FBWkYiLCJzb3VyY2VzQ29udGVudCI6WyJRdWlja1F1ZXJ5Q29ubmVjdFZpZXcgPSByZXF1aXJlICcuL3F1aWNrLXF1ZXJ5LWNvbm5lY3QtdmlldydcblF1aWNrUXVlcnlSZXN1bHRWaWV3ID0gcmVxdWlyZSAnLi9xdWljay1xdWVyeS1yZXN1bHQtdmlldydcblF1aWNrUXVlcnlCcm93c2VyVmlldyA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktYnJvd3Nlci12aWV3J1xuUXVpY2tRdWVyeUVkaXRvclZpZXcgPSByZXF1aXJlICcuL3F1aWNrLXF1ZXJ5LWVkaXRvci12aWV3J1xuUXVpY2tRdWVyeVRhYmxlRmluZGVyVmlldyA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktdGFibGUtZmluZGVyLXZpZXcnXG5RdWlja1F1ZXJ5TXlzcWxDb25uZWN0aW9uID0gcmVxdWlyZSAnLi9xdWljay1xdWVyeS1teXNxbC1jb25uZWN0aW9uJ1xuUXVpY2tRdWVyeVBvc3RncmVzQ29ubmVjdGlvbiA9IHJlcXVpcmUgJy4vcXVpY2stcXVlcnktcG9zdGdyZXMtY29ubmVjdGlvbidcblF1aWNrUXVlcnlBdXRvY29tcGxldGUgPSByZXF1aXJlICcuL3F1aWNrLXF1ZXJ5LWF1dG9jb21wbGV0ZSdcblxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPSBRdWlja1F1ZXJ5ID1cbiAgY29uZmlnOlxuICAgIGF1dG9tcGxldGVJbnRlZ3JhdGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgdGl0bGU6ICdBdXRvY29tcGxldGUgaW50ZWdyYXRpb24nXG4gICAgY2FuVXNlU3RhdHVzQmFyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB0aXRsZTogJ1Nob3cgaW5mbyBpbiBzdGF0dXMgYmFyJ1xuICAgIHJlc3VsdHNJblRhYjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnU2hvdyByZXN1bHRzIGluIGEgdGFiJ1xuICAgIHNob3dCcm93c2VyT25MZWZ0U2lkZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIHRpdGxlOiAnU2hvdyBicm93c2VyIG9uIGxlZnQgc2lkZSdcblxuICBlZGl0b3JWaWV3OiBudWxsXG4gIGJyb3dzZXI6IG51bGxcbiAgbW9kYWxQYW5lbDogbnVsbFxuICBib3R0b21QYW5lbDogbnVsbFxuICBzaWRlUGFuZWw6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBjb25uZWN0aW9uOiBudWxsXG4gIGNvbm5lY3Rpb25zOiBudWxsXG4gIHF1ZXJ5RWRpdG9yczogW11cbiAgdGFibGVGaW5kZXI6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIHByb3RvY29scyA9XG4gICAgICBteXNxbDpcbiAgICAgICAgbmFtZTogXCJNeVNxbFwiXG4gICAgICAgIGhhbmRsZXI6UXVpY2tRdWVyeU15c3FsQ29ubmVjdGlvblxuICAgICAgcG9zdGdyZXM6XG4gICAgICAgIG5hbWU6IFwiUG9zdGdyZVNRTFwiXG4gICAgICAgIGhhbmRsZXI6IFF1aWNrUXVlcnlQb3N0Z3Jlc0Nvbm5lY3Rpb25cbiAgICAgIFwic3NsLXBvc3RncmVzXCI6XG4gICAgICAgIG5hbWU6IFwiUG9zdGdyZVNRTCAoc3NsKVwiXG4gICAgICAgIGhhbmRsZXI6IFF1aWNrUXVlcnlQb3N0Z3Jlc0Nvbm5lY3Rpb25cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBwcm90b2NvbDogJ3Bvc3RncmVzJ1xuICAgICAgICAgIHNzbDogdHJ1ZVxuXG4gICAgQGNvbm5lY3Rpb25zID0gW11cblxuICAgIEB0YWJsZUZpbmRlciA9IG5ldyBRdWlja1F1ZXJ5VGFibGVGaW5kZXJWaWV3KClcblxuICAgIEBicm93c2VyID0gbmV3IFF1aWNrUXVlcnlCcm93c2VyVmlldygpXG4gICAgQGJyb3dzZXIud2lkdGgoc3RhdGUuYnJvd3NlcldpZHRoKSBpZiBzdGF0ZS5icm93c2VyV2lkdGg/XG5cbiAgICBAY29ubmVjdFZpZXcgPSBuZXcgUXVpY2tRdWVyeUNvbm5lY3RWaWV3KHByb3RvY29scylcblxuICAgIGlmIHN0YXRlLmNvbm5lY3Rpb25zXG4gICAgICBmb3IgY29ubmVjdGlvbkluZm8gaW4gc3RhdGUuY29ubmVjdGlvbnNcbiAgICAgICAgY29ubmVjdGlvblByb21pc2UgPSBAY29ubmVjdFZpZXcuYnVpbGRDb25uZWN0aW9uKGNvbm5lY3Rpb25JbmZvKVxuICAgICAgICBAYnJvd3Nlci5hZGRDb25uZWN0aW9uKGNvbm5lY3Rpb25Qcm9taXNlKVxuXG4gICAgQGJyb3dzZXIub25Db25uZWN0aW9uU2VsZWN0ZWQgKGNvbm5lY3Rpb24pID0+XG4gICAgICBAY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cblxuICAgIEBicm93c2VyLm9uQ29ubmVjdGlvbkRlbGV0ZWQgKGNvbm5lY3Rpb24pID0+XG4gICAgICBpID0gQGNvbm5lY3Rpb25zLmluZGV4T2YoY29ubmVjdGlvbilcbiAgICAgIEBjb25uZWN0aW9ucy5zcGxpY2UoaSwxKVxuICAgICAgY29ubmVjdGlvbi5jbG9zZSgpXG4gICAgICBpZiBAY29ubmVjdGlvbnMubGVuZ3RoID4gMFxuICAgICAgICBAYnJvd3Nlci5zZWxlY3RDb25uZWN0aW9uKEBjb25uZWN0aW9uc1tAY29ubmVjdGlvbnMubGVuZ3RoLTFdKVxuICAgICAgZWxzZVxuICAgICAgICBAY29ubmVjdGlvbiA9IG51bGxcblxuICAgIEBicm93c2VyLmJpbmQgJ3F1aWNrUXVlcnkuZWRpdCcsIChlLGFjdGlvbixtb2RlbCkgPT5cbiAgICAgIEBlZGl0b3JWaWV3ID0gbmV3IFF1aWNrUXVlcnlFZGl0b3JWaWV3KGFjdGlvbixtb2RlbClcbiAgICAgIGlmIGFjdGlvbiA9PSAnZHJvcCdcbiAgICAgICAgQGVkaXRvclZpZXcub3BlblRleHRFZGl0b3IoKVxuICAgICAgZWxzZVxuICAgICAgICBAbW9kYWxQYW5lbC5kZXN0cm95KCkgaWYgQG1vZGFsUGFuZWw/XG4gICAgICAgIEBtb2RhbFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiBAZWRpdG9yVmlldyAsIHZpc2libGU6IHRydWUpXG4gICAgICAgIEBlZGl0b3JWaWV3LmZvY3VzRmlyc3QoKVxuXG4gICAgQHRhYmxlRmluZGVyLm9uQ2FuY2VsZWQgPT4gQG1vZGFsUGFuZWwuZGVzdHJveSgpXG4gICAgQHRhYmxlRmluZGVyLm9uRm91bmQgKHRhYmxlKSA9PlxuICAgICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpXG4gICAgICBAYnJvd3Nlci5yZXZlYWwgdGFibGUsID0+XG4gICAgICAgIEBicm93c2VyLnNpbXBsZVNlbGVjdCgpXG5cbiAgICBAY29ubmVjdFZpZXcub25Db25uZWN0aW9uU3RhYmxpc2hlZCAoY29ubmVjdGlvbik9PlxuICAgICAgQGNvbm5lY3Rpb25zLnB1c2goY29ubmVjdGlvbilcbiAgICAgIGNvbm5lY3Rpb24uc2VudGVuY2VSZWFkeSAodGV4dCkgPT5cbiAgICAgICAgQGFkZFNlbnRlbmNlKHRleHQpXG5cbiAgICBAY29ubmVjdFZpZXcub25XaWxsQ29ubmVjdCAoY29ubmVjdGlvblByb21pc2UpID0+XG4gICAgICBAYnJvd3Nlci5hZGRDb25uZWN0aW9uKGNvbm5lY3Rpb25Qcm9taXNlKVxuICAgICAgY29ubmVjdGlvblByb21pc2UudGhlbihcbiAgICAgICAgKGNvbm5lY3Rpb24pID0+IEBtb2RhbFBhbmVsLmRlc3Ryb3koKVxuICAgICAgICAoZXJyKSA9PiBAc2V0TW9kYWxQYW5lbCBjb250ZW50OiBlcnIsIHR5cGU6ICdlcnJvcidcbiAgICAgIClcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkuc2hvd0Jyb3dzZXJPbkxlZnRTaWRlJylcbiAgICAgIEBzaWRlUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRMZWZ0UGFuZWwoaXRlbTogQGJyb3dzZXIsIHZpc2libGU6ZmFsc2UgKVxuICAgIGVsc2VcbiAgICAgIEBzaWRlUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKGl0ZW06IEBicm93c2VyLCB2aXNpYmxlOmZhbHNlIClcblxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3F1aWNrLXF1ZXJ5OnJ1bic6ID0+IEBydW4oKVxuICAgICAgJ3F1aWNrLXF1ZXJ5Om5ldy1lZGl0b3InOiA9PiBAbmV3RWRpdG9yKClcbiAgICAgICdxdWljay1xdWVyeTp0b2dnbGUtYnJvd3Nlcic6ID0+IEB0b2dnbGVCcm93c2VyKClcbiAgICAgICdxdWljay1xdWVyeTp0b2dnbGUtcmVzdWx0cyc6ID0+IEB0b2dnbGVSZXN1bHRzKClcbiAgICAgICdjb3JlOmNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuICAgICAgJ3F1aWNrLXF1ZXJ5Om5ldy1jb25uZWN0aW9uJzogPT4gQG5ld0Nvbm5lY3Rpb24oKVxuICAgICAgJ3F1aWNrLXF1ZXJ5OmZpbmQtdGFibGUtdG8tc2VsZWN0JzogPT4gQGZpbmRUYWJsZSgpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnF1aWNrLXF1ZXJ5LXJlc3VsdCcsXG4gICAgICdxdWljay1xdWVyeTpjb3B5JzogPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5jb3B5KClcbiAgICAgJ3F1aWNrLXF1ZXJ5OmNvcHktYWxsJzogPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5jb3B5QWxsKClcbiAgICAgJ3F1aWNrLXF1ZXJ5OnNhdmUtY3N2JzogPT4gQGFjdGl2ZVJlc3VsdFZpZXcoKS5zYXZlQ1NWKClcbiAgICAgJ3F1aWNrLXF1ZXJ5Omluc2VydCc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuaW5zZXJ0UmVjb3JkKClcbiAgICAgJ3F1aWNrLXF1ZXJ5Om51bGwnOiA9PiBAYWN0aXZlUmVzdWx0VmlldygpLnNldE51bGwoKVxuICAgICAncXVpY2stcXVlcnk6dW5kbyc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkudW5kbygpXG4gICAgICdxdWljay1xdWVyeTpkZWxldGUnOiA9PiBAYWN0aXZlUmVzdWx0VmlldygpLmRlbGV0ZVJlY29yZCgpXG4gICAgICdxdWljay1xdWVyeTphcHBseSc6ID0+IEBhY3RpdmVSZXN1bHRWaWV3KCkuYXBwbHkoKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3F1aWNrLXF1ZXJ5LnJlc3VsdHNJblRhYicsICh7bmV3VmFsdWUsIG9sZFZhbHVlfSkgPT5cbiAgICAgIGlmICFuZXdWYWx1ZVxuICAgICAgICBmb3IgaSBpbiBAcXVlcnlFZGl0b3JzXG4gICAgICAgICAgaS5wYW5lbC5oaWRlKClcbiAgICAgICAgICBpLnBhbmVsLmRlc3Ryb3koKVxuICAgICAgICBAcXVlcnlFZGl0b3JzID0gW11cblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdxdWljay1xdWVyeS5zaG93QnJvd3Nlck9uTGVmdFNpZGUnLCAoe25ld1ZhbHVlLCBvbGRWYWx1ZX0pID0+XG4gICAgICB2aXNpYmxlID0gQGJyb3dzZXIuaXMoJzp2aXNpYmxlJylcbiAgICAgIEBicm93c2VyLmF0dHIoJ2RhdGEtc2hvdy1vbi1yaWdodC1zaWRlJywhbmV3VmFsdWUpXG4gICAgICBAYnJvd3Nlci5kYXRhKCdzaG93LW9uLXJpZ2h0LXNpZGUnLCFuZXdWYWx1ZSlcbiAgICAgIEBzaWRlUGFuZWwuZGVzdHJveSgpXG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBAc2lkZVBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKGl0ZW06IEBicm93c2VyLCB2aXNpYmxlOiB2aXNpYmxlIClcbiAgICAgIGVsc2VcbiAgICAgICAgQHNpZGVQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoaXRlbTogQGJyb3dzZXIsIHZpc2libGU6IHZpc2libGUgKVxuXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgQGhpZGVTdGF0dXNCYXIoKVxuICAgICAgaWYgIWF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkucmVzdWx0c0luVGFiJylcbiAgICAgICAgZm9yIGkgaW4gQHF1ZXJ5RWRpdG9yc1xuICAgICAgICAgIHJlc3VsdFZpZXcgPSBpLnBhbmVsLmdldEl0ZW0oKVxuICAgICAgICAgIGlmIGkuZWRpdG9yID09IGl0ZW0gJiYgIXJlc3VsdFZpZXcuaGlkZGVuUmVzdWx0cygpXG4gICAgICAgICAgICBpLnBhbmVsLnNob3coKVxuICAgICAgICAgICAgcmVzdWx0Vmlldy5maXhOdW1iZXJzKClcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBpLnBhbmVsLmhpZGUoKVxuICAgICAgICAgIEB1cGRhdGVTdGF0dXNCYXIocmVzdWx0VmlldykgaWYgaS5lZGl0b3IgPT0gaXRlbVxuICAgICAgZWxzZSBpZiBpdGVtIGluc3RhbmNlb2YgUXVpY2tRdWVyeVJlc3VsdFZpZXdcbiAgICAgICAgQHVwZGF0ZVN0YXR1c0JhcihpdGVtKVxuXG4gICAgYXRvbS53b3Jrc3BhY2UucGFuZUNvbnRhaW5lci5vbkRpZERlc3Ryb3lQYW5lSXRlbSAoZCkgPT5cbiAgICAgIEBxdWVyeUVkaXRvcnMgPSBAcXVlcnlFZGl0b3JzLmZpbHRlciAoaSkgPT5cbiAgICAgICAgaS5wYW5lbC5kZXN0cm95KCkgaWYgaS5lZGl0b3IgPT0gZC5pdGVtXG4gICAgICAgIGkuZWRpdG9yICE9IGQuaXRlbVxuXG4gIGFkZFNlbnRlbmNlOiAodGV4dCkgLT5cbiAgICBxdWVyeUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIHF1ZXJ5RWRpdG9yXG4gICAgICBxdWVyeUVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgcXVlcnlFZGl0b3IuaW5zZXJ0TmV3bGluZSgpXG4gICAgICBxdWVyeUVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gICAgZWxzZVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGVkaXRvcikgPT5cbiAgICAgICAgZ3JhbW1hcnMgPSBhdG9tLmdyYW1tYXJzLmdldEdyYW1tYXJzKClcbiAgICAgICAgZ3JhbW1hciA9IChpIGZvciBpIGluIGdyYW1tYXJzIHdoZW4gaS5uYW1lIGlzICdTUUwnKVswXVxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgYy5jbG9zZSgpIGZvciBjIGluIEBjb25uZWN0aW9uc1xuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGkucGFuZWwuZGVzdHJveSgpIGZvciBpIGluIEBxdWVyeUVkaXRvcnNcbiAgICBAYnJvd3Nlci5kZXN0cm95KClcbiAgICBAY29ubmVjdFZpZXcuZGVzdHJveSgpXG4gICAgQG1vZGFsUGFuZWw/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgZm9yIGl0ZW0gaW4gcGFuZS5nZXRJdGVtcygpIHdoZW4gaXRlbSBpbnN0YW5jZW9mIFF1aWNrUXVlcnlSZXN1bHRWaWV3XG4gICAgICBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgICBjb25uZWN0aW9uczogQGNvbm5lY3Rpb25zLm1hcCgoYyktPiBjLnNlcmlhbGl6ZSgpKSxcbiAgICAgYnJvd3NlcldpZHRoOiBAYnJvd3Nlci53aWR0aCgpXG4gIG5ld0VkaXRvcjogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZWRpdG9yKSA9PlxuICAgICAgZ3JhbW1hcnMgPSBhdG9tLmdyYW1tYXJzLmdldEdyYW1tYXJzKClcbiAgICAgIGdyYW1tYXIgPSAoaSBmb3IgaSBpbiBncmFtbWFycyB3aGVuIGkubmFtZSBpcyAnU1FMJylbMF1cbiAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gIG5ld0Nvbm5lY3Rpb246IC0+XG4gICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpIGlmIEBtb2RhbFBhbmVsP1xuICAgIEBtb2RhbFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiBAY29ubmVjdFZpZXcsIHZpc2libGU6IHRydWUpXG4gICAgQGNvbm5lY3RWaWV3LmZvY3VzRmlyc3QoKVxuICBydW46IC0+XG4gICAgQHF1ZXJ5RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgdW5sZXNzIEBxdWVyeUVkaXRvclxuICAgICAgQHNldE1vZGFsUGFuZWwgY29udGVudDpcIlRoaXMgdGFiIGlzIG5vdCBhbiBlZGl0b3JcIiwgdHlwZTonZXJyb3InXG4gICAgICByZXR1cm5cbiAgICB0ZXh0ID0gQHF1ZXJ5RWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgdGV4dCA9IEBxdWVyeUVkaXRvci5nZXRUZXh0KCkgaWYodGV4dCA9PSAnJylcblxuICAgIGlmIEBjb25uZWN0aW9uXG4gICAgICBAc2V0TW9kYWxQYW5lbCBjb250ZW50OlwiUnVubmluZyBxdWVyeS4uLlwiLCBzcGlubmVyOiB0cnVlXG4gICAgICBAY29ubmVjdGlvbi5xdWVyeSB0ZXh0LCAobWVzc2FnZSwgcm93cywgZmllbGRzKSA9PlxuICAgICAgICBAbW9kYWxQYW5lbC5kZXN0cm95KCkgaWYgQG1vZGFsUGFuZWw/XG4gICAgICAgIGlmIChtZXNzYWdlKVxuICAgICAgICAgIGlmIG1lc3NhZ2UudHlwZSA9PSAnZXJyb3InXG4gICAgICAgICAgICBAc2V0TW9kYWxQYW5lbCBtZXNzYWdlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGFkZEluZm9Ob3RpZmljYXRpb24obWVzc2FnZS5jb250ZW50KTtcbiAgICAgICAgICBpZiBtZXNzYWdlLnR5cGUgPT0gJ3N1Y2Nlc3MnXG4gICAgICAgICAgICBAYWZ0ZXJFeGVjdXRlKEBxdWVyeUVkaXRvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBzZXRNb2RhbFBhbmVsIGNvbnRlbnQ6XCJMb2FkaW5nIHJlc3VsdHMuLi5cIiwgc3Bpbm5lcjogdHJ1ZVxuICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkucmVzdWx0c0luVGFiJylcbiAgICAgICAgICAgIHF1ZXJ5UmVzdWx0ID0gQHNob3dSZXN1bHRJblRhYigpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcXVlcnlSZXN1bHQgPSBAc2hvd1Jlc3VsdFZpZXcoQHF1ZXJ5RWRpdG9yKVxuICAgICAgICAgIHF1ZXJ5UmVzdWx0LnNob3dSb3dzIHJvd3MsIGZpZWxkcywgQGNvbm5lY3Rpb24gLCA9PlxuICAgICAgICAgICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpIGlmIEBtb2RhbFBhbmVsXG4gICAgICAgICAgICBxdWVyeVJlc3VsdC5maXhTaXplcygpIGlmIHJvd3MubGVuZ3RoID4gMTAwXG4gICAgICAgICAgcXVlcnlSZXN1bHQuZml4U2l6ZXMoKVxuICAgICAgICAgIEB1cGRhdGVTdGF0dXNCYXIocXVlcnlSZXN1bHQpXG5cbiAgICBlbHNlXG4gICAgICBAYWRkV2FybmluZ05vdGlmaWNhdGlvbihcIk5vIGNvbm5lY3Rpb24gc2VsZWN0ZWRcIilcblxuICB0b2dnbGVCcm93c2VyOiAtPlxuICAgIGlmIEBicm93c2VyLmlzKCc6dmlzaWJsZScpXG4gICAgICBAc2lkZVBhbmVsLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEBicm93c2VyLnNob3dDb25uZWN0aW9ucygpXG4gICAgICBAc2lkZVBhbmVsLnNob3coKVxuXG4gIGZpbmRUYWJsZTogKCktPlxuICAgIGlmIEBjb25uZWN0aW9uXG4gICAgICBAdGFibGVGaW5kZXIuc2VhcmNoVGFibGUoQGNvbm5lY3Rpb24pXG4gICAgICBAbW9kYWxQYW5lbC5kZXN0cm95KCkgaWYgQG1vZGFsUGFuZWw/XG4gICAgICBAbW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogQHRhYmxlRmluZGVyICwgdmlzaWJsZTogdHJ1ZSlcbiAgICAgIEB0YWJsZUZpbmRlci5mb2N1c0ZpbHRlckVkaXRvcigpXG4gICAgZWxzZVxuICAgICAgQGFkZFdhcm5pbmdOb3RpZmljYXRpb24gXCJObyBjb25uZWN0aW9uIHNlbGVjdGVkXCJcblxuICBhZGRXYXJuaW5nTm90aWZpY2F0aW9uOihtZXNzYWdlKSAtPlxuICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UpO1xuICAgIGF0b20udmlld3MuZ2V0Vmlldyhub3RpZmljYXRpb24pPy5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBAcmVtb3ZlTm90aWZpY2F0aW9uKClcblxuICBhZGRJbmZvTm90aWZpY2F0aW9uOiAobWVzc2FnZSktPlxuICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UpO1xuICAgIGF0b20udmlld3MuZ2V0Vmlldyhub3RpZmljYXRpb24pPy5hZGRFdmVudExpc3RlbmVyICdjbGljaycsIChlKSAtPiBAcmVtb3ZlTm90aWZpY2F0aW9uKClcblxuICBzZXRNb2RhbFBhbmVsOiAobWVzc2FnZSktPlxuICAgIGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgncXVpY2stcXVlcnktbW9kYWwtbWVzc2FnZScpXG4gICAgaXRlbS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuY29udGVudFxuICAgIGlmIG1lc3NhZ2Uuc3Bpbm5lcj8gJiYgbWVzc2FnZS5zcGlubmVyXG4gICAgICBzcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICBzcGlubmVyLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKVxuICAgICAgc3Bpbm5lci5jbGFzc0xpc3QuYWRkKCdsb2FkaW5nLXNwaW5uZXItdGlueScpXG4gICAgICBzcGlubmVyLmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycpXG4gICAgICBpdGVtLmluc2VydEJlZm9yZShzcGlubmVyLGl0ZW0uY2hpbGROb2Rlc1swXSlcbiAgICBpZiBtZXNzYWdlLnR5cGUgPT0gJ2Vycm9yJ1xuICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCd0ZXh0LWVycm9yJylcbiAgICAgIGNvcHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgIGNvcHkuY2xhc3NMaXN0LmFkZCgnaWNvbicpXG4gICAgICBjb3B5LmNsYXNzTGlzdC5hZGQoJ2ljb24tY2xpcHB5JylcbiAgICAgIGNvcHkuc2V0QXR0cmlidXRlKCd0aXRsZScsXCJDb3B5IHRvIGNsaXBib2FyZFwiKVxuICAgICAgY29weS5zZXRBdHRyaWJ1dGUoJ2RhdGEtZXJyb3InLG1lc3NhZ2UuY29udGVudClcbiAgICAgIGl0ZW0ub25tb3VzZW92ZXIgPSAoLT4gQGNsYXNzTGlzdC5hZGQoJ2FuaW1hdGVkJykgKVxuICAgICAgY29weS5vbmNsaWNrID0gKC0+YXRvbS5jbGlwYm9hcmQud3JpdGUoQGdldEF0dHJpYnV0ZSgnZGF0YS1lcnJvcicpKSlcbiAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoY29weSlcbiAgICBjbG9zZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIGNsb3NlLmNsYXNzTGlzdC5hZGQoJ2ljb24nKVxuICAgIGNsb3NlLmNsYXNzTGlzdC5hZGQoJ2ljb24teCcpXG4gICAgY2xvc2Uub25jbGljayA9ICg9PiBAbW9kYWxQYW5lbC5kZXN0cm95KCkpXG4gICAgaXRlbS5hcHBlbmRDaGlsZChjbG9zZSlcbiAgICBAbW9kYWxQYW5lbC5kZXN0cm95KCkgaWYgQG1vZGFsUGFuZWw/XG4gICAgQG1vZGFsUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IGl0ZW0gLCB2aXNpYmxlOiB0cnVlKVxuXG4gIHNob3dSZXN1bHRJblRhYjogLT5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgZmlsdGVyID0gcGFuZS5nZXRJdGVtcygpLmZpbHRlciAoaXRlbSkgLT5cbiAgICAgIGl0ZW0gaW5zdGFuY2VvZiBRdWlja1F1ZXJ5UmVzdWx0Vmlld1xuICAgIGlmIGZpbHRlci5sZW5ndGggPT0gMFxuICAgICAgcXVlcnlSZXN1bHQgPSBuZXcgUXVpY2tRdWVyeVJlc3VsdFZpZXcoKVxuICAgICAgcXVlcnlSZXN1bHQub25Sb3dTdGF0dXNDaGFuZ2VkID0+IEB1cGRhdGVTdGF0dXNCYXIocXVlcnlSZXN1bHQpXG4gICAgICBwYW5lLmFkZEl0ZW0gcXVlcnlSZXN1bHRcbiAgICBlbHNlXG4gICAgICBxdWVyeVJlc3VsdCA9IGZpbHRlclswXVxuICAgIHBhbmUuYWN0aXZhdGVJdGVtIHF1ZXJ5UmVzdWx0XG4gICAgcXVlcnlSZXN1bHRcblxuICBhZnRlckV4ZWN1dGU6IChxdWVyeUVkaXRvciktPlxuICAgIGlmIEBlZGl0b3JWaWV3ICYmIEBlZGl0b3JWaWV3LmVkaXRvciA9PSBxdWVyeUVkaXRvclxuICAgICAgaWYgIXF1ZXJ5RWRpdG9yLmdldFBhdGg/KClcbiAgICAgICAgcXVlcnlFZGl0b3Iuc2V0VGV4dCgnJylcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIEBicm93c2VyLnJlZnJlc2hUcmVlKEBlZGl0b3JWaWV3Lm1vZGVsKVxuICAgICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpIGlmIEBtb2RhbFBhbmVsXG4gICAgICBAZWRpdG9yVmlldyA9IG51bGxcblxuICBzaG93UmVzdWx0VmlldzogKHF1ZXJ5RWRpdG9yKS0+XG4gICAgZSA9IChpIGZvciBpIGluIEBxdWVyeUVkaXRvcnMgd2hlbiBpLmVkaXRvciA9PSBxdWVyeUVkaXRvcilcbiAgICBpZiBlLmxlbmd0aCA+IDBcbiAgICAgIGVbMF0ucGFuZWwuc2hvdygpXG4gICAgICBxdWVyeVJlc3VsdCA9IGVbMF0ucGFuZWwuZ2V0SXRlbSgpXG4gICAgZWxzZVxuICAgICAgcXVlcnlSZXN1bHQgPSBuZXcgUXVpY2tRdWVyeVJlc3VsdFZpZXcoKVxuICAgICAgcXVlcnlSZXN1bHQub25Sb3dTdGF0dXNDaGFuZ2VkID0+IEB1cGRhdGVTdGF0dXNCYXIocXVlcnlSZXN1bHQpXG4gICAgICBib3R0b21QYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHF1ZXJ5UmVzdWx0LCB2aXNpYmxlOnRydWUgKVxuICAgICAgQHF1ZXJ5RWRpdG9ycy5wdXNoKHtlZGl0b3I6IHF1ZXJ5RWRpdG9yLCAgcGFuZWw6IGJvdHRvbVBhbmVsfSlcbiAgICBxdWVyeVJlc3VsdFxuXG4gIGFjdGl2ZVJlc3VsdFZpZXc6IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5yZXN1bHRzSW5UYWInKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGVsc2VcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgZm9yIGkgaW4gQHF1ZXJ5RWRpdG9yc1xuICAgICAgICByZXR1cm4gaS5wYW5lbC5nZXRJdGVtKCkgaWYgaS5lZGl0b3IgPT0gZWRpdG9yXG5cbiAgcHJvdmlkZUJyb3dzZXJWaWV3OiAtPiBAYnJvd3NlclxuXG4gIHByb3ZpZGVDb25uZWN0VmlldzogLT4gQGNvbm5lY3RWaWV3XG5cbiAgcHJvdmlkZUF1dG9jb21wbGV0ZTogLT4gbmV3IFF1aWNrUXVlcnlBdXRvY29tcGxldGUoQGJyb3dzZXIpXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdxdWljay1xdWVyeS10aWxlJylcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICAgIGVsZW1lbnQub25jbGljayA9ICg9PiBAdG9nZ2xlUmVzdWx0cygpKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKGl0ZW06IGVsZW1lbnQsIHByaW9yaXR5OiAxMClcblxuICBoaWRlU3RhdHVzQmFyOiAtPlxuICAgIGlmIEBzdGF0dXNCYXJUaWxlP1xuICAgICAgc3BhbiA9IEBzdGF0dXNCYXJUaWxlLmdldEl0ZW0oKVxuICAgICAgc3Bhbi5jbGFzc0xpc3QuYWRkKCdoaWRlJylcblxuICB1cGRhdGVTdGF0dXNCYXI6IChxdWVyeVJlc3VsdCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBzdGF0dXNCYXJUaWxlPyAmJiBxdWVyeVJlc3VsdD8ucm93cz9cbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCgncXVpY2stcXVlcnkuY2FuVXNlU3RhdHVzQmFyJylcbiAgICBlbGVtZW50ID0gQHN0YXR1c0JhclRpbGUuZ2V0SXRlbSgpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJylcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3F1aWNrLXF1ZXJ5LnJlc3VsdHNJblRhYicpXG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gXCIoI3txdWVyeVJlc3VsdC5yb3dzU3RhdHVzKCl9KVwiXG4gICAgZWxzZVxuICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IFwiI3txdWVyeVJlc3VsdC5nZXRUaXRsZSgpfSAoI3txdWVyeVJlc3VsdC5yb3dzU3RhdHVzKCl9KVwiXG5cbiAgdG9nZ2xlUmVzdWx0czogLT5cbiAgICBpZiAhYXRvbS5jb25maWcuZ2V0KCdxdWljay1xdWVyeS5yZXN1bHRzSW5UYWInKVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBmb3IgaSBpbiBAcXVlcnlFZGl0b3JzIHdoZW4gaS5lZGl0b3IgPT0gZWRpdG9yXG4gICAgICAgIHJlc3VsdFZpZXcgPSBpLnBhbmVsLmdldEl0ZW0oKVxuICAgICAgICBpZiByZXN1bHRWaWV3LmlzKCc6dmlzaWJsZScpXG4gICAgICAgICBpLnBhbmVsLmhpZGUoKVxuICAgICAgICAgcmVzdWx0Vmlldy5oaWRlUmVzdWx0cygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgIGkucGFuZWwuc2hvdygpXG4gICAgICAgICByZXN1bHRWaWV3LnNob3dSZXN1bHRzKClcblxuICBjYW5jZWw6IC0+XG4gICAgQG1vZGFsUGFuZWwuZGVzdHJveSgpIGlmIEBtb2RhbFBhbmVsXG4gICAgZm9yIGkgaW4gQHF1ZXJ5RWRpdG9yc1xuICAgICAgaWYgaS5lZGl0b3IgPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHJlc3VsdFZpZXcgPSBpLnBhbmVsLmdldEl0ZW0oKVxuICAgICAgICBpLnBhbmVsLmhpZGUoKVxuICAgICAgICByZXN1bHRWaWV3LmhpZGVSZXN1bHRzKClcbiJdfQ==
