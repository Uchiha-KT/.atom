(function() {
  var $, QuickQueryConnectView, View, ref, remote,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  remote = require('remote');

  ({
    element: null
  });

  module.exports = QuickQueryConnectView = (function(superClass) {
    extend(QuickQueryConnectView, superClass);

    function QuickQueryConnectView(protocols) {
      this.protocols = protocols;
      this.connectionsStates = [];
      QuickQueryConnectView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryConnectView.prototype.initialize = function() {
      var key, option, portEditor, protocol, ref1;
      portEditor = this.find("#quick-query-port")[0].getModel();
      portEditor.setText('3306');
      this.find("#quick-query-file").attr('tabindex', 2);
      this.find("#quick-query-host").attr('tabindex', 2);
      this.find("#quick-query-port").attr('tabindex', 3);
      this.find("#quick-query-user").attr('tabindex', 4);
      this.find("#quick-query-pass").attr('tabindex', 5);
      this.find('#quick-query-connect').keydown(function(e) {
        if (e.keyCode === 13) {
          return $(this).click();
        }
      });
      this.find('#quick-query-protocol').keydown(function(e) {
        if (e.keyCode === 13) {
          $(e.target).css({
            height: 'auto'
          });
          return e.target.size = 3;
        } else if (e.keyCode === 37 || e.keyCode === 38) {
          return $(e.target).find('option:selected').prev().prop('selected', true);
        } else if (e.keyCode === 39 || e.keyCode === 40) {
          return $(e.target).find('option:selected').next().prop('selected', true);
        }
      }).blur(function(e) {
        $(e.target).css({
          height: ''
        });
        return e.target.size = 0;
      }).on('change blur', (function(_this) {
        return function(e) {
          var protocol;
          if ($(e.target).find('option:selected').length > 0) {
            protocol = $(e.target).find('option:selected').data('protocol');
            if (protocol.handler.fromFilesystem != null) {
              _this.showLocalInfo();
              if (protocol.handler.fileExtencions != null) {
                return _this.find('#quick-query-browse-file').data('extensions', protocol.handler.fileExtencions);
              } else {
                return _this.find('#quick-query-browse-file').data('extensions', false);
              }
            } else {
              _this.showRemoteInfo();
              return portEditor.setText(protocol.handler.defaultPort.toString());
            }
          }
        };
      })(this));
      this.find('#quick-query-browse-file').click((function(_this) {
        return function(e) {
          var currentWindow, dialog, options;
          options = {
            properties: ['openFile'],
            title: 'Open Database'
          };
          currentWindow = atom.getCurrentWindow();
          if ($(e.currentTarget).data("extensions")) {
            options.filters = [
              {
                name: 'Database',
                extensions: $(e.target).data("extensions")
              }
            ];
          }
          dialog = remote.require('dialog') || remote.require('electron').dialog;
          return dialog.showOpenDialog(currentWindow, options, function(files) {
            if (files != null) {
              return _this.find('#quick-query-file')[0].getModel().setText(files[0]);
            }
          });
        };
      })(this));
      ref1 = this.protocols;
      for (key in ref1) {
        protocol = ref1[key];
        option = $('<option/>').text(protocol.name).val(key).data('protocol', protocol);
        this.find('#quick-query-protocol').append(option);
      }
      return this.find('#quick-query-connect').click((function(_this) {
        return function(e) {
          var attr, connectionInfo, defaults, ref2, ref3, value;
          connectionInfo = {
            user: _this.find("#quick-query-user")[0].getModel().getText(),
            password: _this.find("#quick-query-pass")[0].getModel().getText(),
            protocol: _this.find("#quick-query-protocol").val()
          };
          if (((ref2 = _this.protocols[connectionInfo.protocol]) != null ? ref2.handler.fromFilesystem : void 0) != null) {
            connectionInfo.file = _this.find("#quick-query-file")[0].getModel().getText();
          } else {
            connectionInfo.host = _this.find("#quick-query-host")[0].getModel().getText();
            connectionInfo.port = _this.find("#quick-query-port")[0].getModel().getText();
          }
          if (((ref3 = _this.protocols[connectionInfo.protocol]) != null ? ref3["default"] : void 0) != null) {
            defaults = _this.protocols[connectionInfo.protocol]["default"];
            for (attr in defaults) {
              value = defaults[attr];
              connectionInfo[attr] = value;
            }
          }
          return $(_this.element).trigger('quickQuery.connect', [_this.buildConnection(connectionInfo)]);
        };
      })(this));
    };

    QuickQueryConnectView.prototype.addProtocol = function(key, protocol) {
      var i, len, option, ref1, results, state;
      this.protocols[key] = protocol;
      option = $('<option/>').text(protocol.name).val(key).data('protocol', protocol);
      this.find('#quick-query-protocol').append(option);
      ref1 = this.connectionsStates;
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        state = ref1[i];
        if (state.info.protocol === key) {
          results.push(state.callback(state.info));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    QuickQueryConnectView.prototype.buildConnection = function(connectionInfo) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var connection, protocolClass, ref1;
          protocolClass = (ref1 = _this.protocols[connectionInfo.protocol]) != null ? ref1.handler : void 0;
          if (protocolClass) {
            connection = new protocolClass(connectionInfo);
            return connection.connect(function(err) {
              if (err) {
                reject(err);
              } else {
                resolve(connection);
              }
              if (err == null) {
                return _this.trigger('quickQuery.connected', connection);
              }
            });
          } else {
            return _this.connectionsStates.push({
              info: connectionInfo,
              callback: function(connectionInfo) {
                protocolClass = _this.protocols[connectionInfo.protocol].handler;
                connection = new protocolClass(connectionInfo);
                return connection.connect(function(err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(connection);
                  }
                  if (err == null) {
                    return _this.trigger('quickQuery.connected', connection);
                  }
                });
              }
            });
          }
        };
      })(this));
    };

    QuickQueryConnectView.content = function() {
      return this.div({
        "class": 'dialog quick-query-connect'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "col-sm-12"
          }, function() {
            _this.label('protocol');
            return _this.select({
              "class": "form-control",
              id: "quick-query-protocol",
              tabindex: "1"
            });
          });
          _this.div({
            "class": "qq-remote-info row"
          }, function() {
            _this.div({
              "class": "col-sm-9"
            }, function() {
              _this.label('host');
              return _this.currentBuilder.tag('atom-text-editor', {
                id: "quick-query-host",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
            return _this.div({
              "class": "col-sm-3"
            }, function() {
              _this.label('port');
              return _this.currentBuilder.tag('atom-text-editor', {
                id: "quick-query-port",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
          });
          _this.div({
            "class": "qq-local-info row"
          }, function() {
            _this.div({
              "class": "col-sm-12"
            }, function() {
              return _this.label('file');
            });
            _this.div({
              "class": "col-sm-9"
            }, function() {
              return _this.currentBuilder.tag('atom-text-editor', {
                id: "quick-query-file",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
            return _this.div({
              "class": "col-sm-3"
            }, function() {
              return _this.button({
                id: "quick-query-browse-file",
                "class": "btn btn-default icon icon-file-directory"
              }, "Browse");
            });
          });
          _this.div({
            "class": "qq-auth-info row"
          }, function() {
            _this.div({
              "class": "col-sm-6"
            }, function() {
              _this.label('user');
              return _this.currentBuilder.tag('atom-text-editor', {
                id: "quick-query-user",
                "class": 'editor',
                mini: 'mini',
                type: 'string'
              });
            });
            return _this.div({
              "class": "col-sm-6"
            }, function() {
              _this.label('password');
              return _this.currentBuilder.tag('atom-text-editor', {
                id: "quick-query-pass",
                "class": 'editor',
                mini: 'mini'
              });
            });
          });
          return _this.div({
            "class": "col-sm-12"
          }, function() {
            return _this.button({
              id: "quick-query-connect",
              "class": "btn btn-default icon icon-plug",
              tabindex: "6"
            }, "Connect");
          });
        };
      })(this));
    };

    QuickQueryConnectView.prototype.destroy = function() {
      return this.element.remove();
    };

    QuickQueryConnectView.prototype.focusFirst = function() {
      return this.find('#quick-query-protocol').focus();
    };

    QuickQueryConnectView.prototype.showLocalInfo = function() {
      this.find(".qq-local-info").show();
      return this.find(".qq-remote-info").hide();
    };

    QuickQueryConnectView.prototype.showRemoteInfo = function() {
      this.find(".qq-remote-info").show();
      return this.find(".qq-local-info").hide();
    };

    QuickQueryConnectView.prototype.onWillConnect = function(callback) {
      return this.bind('quickQuery.connect', function(e, connectionPromise) {
        return callback(connectionPromise);
      });
    };

    QuickQueryConnectView.prototype.onConnectionStablished = function(callback) {
      return this.bind('quickQuery.connected', function(e, connection) {
        return callback(connection);
      });
    };

    return QuickQueryConnectView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LWNvbm5lY3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUE7OztFQUFBLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxlQUFELEVBQU87O0VBQ1AsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVULENBQUE7SUFBQSxPQUFBLEVBQVMsSUFBVDtHQUFBOztFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLCtCQUFDLFNBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtNQUNaLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtNQUNyQix3REFBQSxTQUFBO0lBRlc7O29DQUliLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsSUFBRCxDQUFNLG1CQUFOLENBQTJCLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBOUIsQ0FBQTtNQUNiLFVBQVUsQ0FBQyxPQUFYLENBQW1CLE1BQW5CO01BRUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEwQixDQUFDLElBQTNCLENBQWdDLFVBQWhDLEVBQTJDLENBQTNDO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEwQixDQUFDLElBQTNCLENBQWdDLFVBQWhDLEVBQTJDLENBQTNDO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEwQixDQUFDLElBQTNCLENBQWdDLFVBQWhDLEVBQTJDLENBQTNDO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEwQixDQUFDLElBQTNCLENBQWdDLFVBQWhDLEVBQTJDLENBQTNDO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEwQixDQUFDLElBQTNCLENBQWdDLFVBQWhDLEVBQTJDLENBQTNDO01BRUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxzQkFBTixDQUE2QixDQUFDLE9BQTlCLENBQXNDLFNBQUMsQ0FBRDtRQUNwQyxJQUFtQixDQUFDLENBQUMsT0FBRixLQUFhLEVBQWhDO2lCQUFBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxLQUFSLENBQUEsRUFBQTs7TUFEb0MsQ0FBdEM7TUFFQSxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOLENBQ0UsQ0FBQyxPQURILENBQ1csU0FBQyxDQUFEO1FBQ1AsSUFBRyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQWhCO1VBQ0UsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxHQUFaLENBQWdCO1lBQUEsTUFBQSxFQUFRLE1BQVI7V0FBaEI7aUJBQ0EsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFULEdBQWdCLEVBRmxCO1NBQUEsTUFHSyxJQUFJLENBQUMsQ0FBQyxPQUFGLEtBQWEsRUFBYixJQUFtQixDQUFDLENBQUMsT0FBRixLQUFhLEVBQXBDO2lCQUNILENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsSUFBWixDQUFpQixpQkFBakIsQ0FBbUMsQ0FBQyxJQUFwQyxDQUFBLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsVUFBaEQsRUFBMkQsSUFBM0QsRUFERztTQUFBLE1BRUEsSUFBSSxDQUFDLENBQUMsT0FBRixLQUFhLEVBQWIsSUFBbUIsQ0FBQyxDQUFDLE9BQUYsS0FBYSxFQUFwQztpQkFDSCxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLElBQVosQ0FBaUIsaUJBQWpCLENBQW1DLENBQUMsSUFBcEMsQ0FBQSxDQUEwQyxDQUFDLElBQTNDLENBQWdELFVBQWhELEVBQTJELElBQTNELEVBREc7O01BTkUsQ0FEWCxDQVNFLENBQUMsSUFUSCxDQVNRLFNBQUMsQ0FBRDtRQUNKLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsR0FBWixDQUFnQjtVQUFBLE1BQUEsRUFBUSxFQUFSO1NBQWhCO2VBQ0EsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFULEdBQWdCO01BRlosQ0FUUixDQVlFLENBQUMsRUFaSCxDQVlNLGFBWk4sRUFZcUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7QUFDakIsY0FBQTtVQUFBLElBQUcsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLGlCQUFqQixDQUFtQyxDQUFDLE1BQXBDLEdBQTZDLENBQWhEO1lBQ0UsUUFBQSxHQUFXLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsSUFBWixDQUFpQixpQkFBakIsQ0FBbUMsQ0FBQyxJQUFwQyxDQUF5QyxVQUF6QztZQUNYLElBQUcsdUNBQUg7Y0FDRSxLQUFDLENBQUEsYUFBRCxDQUFBO2NBQ0EsSUFBRyx1Q0FBSDt1QkFDRSxLQUFDLENBQUEsSUFBRCxDQUFNLDBCQUFOLENBQ0MsQ0FBQyxJQURGLENBQ08sWUFEUCxFQUNvQixRQUFRLENBQUMsT0FBTyxDQUFDLGNBRHJDLEVBREY7ZUFBQSxNQUFBO3VCQUlFLEtBQUMsQ0FBQSxJQUFELENBQU0sMEJBQU4sQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxZQUF2QyxFQUFvRCxLQUFwRCxFQUpGO2VBRkY7YUFBQSxNQUFBO2NBUUUsS0FBQyxDQUFBLGNBQUQsQ0FBQTtxQkFDQSxVQUFVLENBQUMsT0FBWCxDQUFtQixRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUE3QixDQUFBLENBQW5CLEVBVEY7YUFGRjs7UUFEaUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWnJCO01BMEJBLElBQUMsQ0FBQSxJQUFELENBQU0sMEJBQU4sQ0FBaUMsQ0FBQyxLQUFsQyxDQUF3QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtBQUNwQyxjQUFBO1VBQUEsT0FBQSxHQUNFO1lBQUEsVUFBQSxFQUFZLENBQUMsVUFBRCxDQUFaO1lBQ0EsS0FBQSxFQUFPLGVBRFA7O1VBRUYsYUFBQSxHQUFnQixJQUFJLENBQUMsZ0JBQUwsQ0FBQTtVQUNoQixJQUFHLENBQUEsQ0FBRSxDQUFDLENBQUMsYUFBSixDQUFrQixDQUFDLElBQW5CLENBQXdCLFlBQXhCLENBQUg7WUFDRSxPQUFPLENBQUMsT0FBUixHQUFrQjtjQUFDO2dCQUFFLElBQUEsRUFBTSxVQUFSO2dCQUFvQixVQUFBLEVBQVksQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLFlBQWpCLENBQWhDO2VBQUQ7Y0FEcEI7O1VBRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQUFBLElBQTRCLE1BQU0sQ0FBQyxPQUFQLENBQWUsVUFBZixDQUEwQixDQUFDO2lCQUNoRSxNQUFNLENBQUMsY0FBUCxDQUFzQixhQUF0QixFQUFxQyxPQUFyQyxFQUE4QyxTQUFDLEtBQUQ7WUFDNUMsSUFBOEQsYUFBOUQ7cUJBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEyQixDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQTlCLENBQUEsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxLQUFNLENBQUEsQ0FBQSxDQUF2RCxFQUFBOztVQUQ0QyxDQUE5QztRQVJvQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEM7QUFXQTtBQUFBLFdBQUEsV0FBQTs7UUFDRSxNQUFBLEdBQVMsQ0FBQSxDQUFFLFdBQUYsQ0FDUCxDQUFDLElBRE0sQ0FDRCxRQUFRLENBQUMsSUFEUixDQUVQLENBQUMsR0FGTSxDQUVGLEdBRkUsQ0FHUCxDQUFDLElBSE0sQ0FHRCxVQUhDLEVBR1UsUUFIVjtRQUlULElBQUMsQ0FBQSxJQUFELENBQU0sdUJBQU4sQ0FBOEIsQ0FBQyxNQUEvQixDQUFzQyxNQUF0QztBQUxGO2FBT0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxzQkFBTixDQUE2QixDQUFDLEtBQTlCLENBQW9DLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQ2xDLGNBQUE7VUFBQSxjQUFBLEdBQWlCO1lBQ2YsSUFBQSxFQUFNLEtBQUMsQ0FBQSxJQUFELENBQU0sbUJBQU4sQ0FBMkIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUE5QixDQUFBLENBQXdDLENBQUMsT0FBekMsQ0FBQSxDQURTO1lBRWYsUUFBQSxFQUFVLEtBQUMsQ0FBQSxJQUFELENBQU0sbUJBQU4sQ0FBMkIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUE5QixDQUFBLENBQXdDLENBQUMsT0FBekMsQ0FBQSxDQUZLO1lBR2YsUUFBQSxFQUFVLEtBQUMsQ0FBQSxJQUFELENBQU0sdUJBQU4sQ0FBOEIsQ0FBQyxHQUEvQixDQUFBLENBSEs7O1VBS2pCLElBQUcsMEdBQUg7WUFDRSxjQUFjLENBQUMsSUFBZixHQUFzQixLQUFDLENBQUEsSUFBRCxDQUFNLG1CQUFOLENBQTJCLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBOUIsQ0FBQSxDQUF3QyxDQUFDLE9BQXpDLENBQUEsRUFEeEI7V0FBQSxNQUFBO1lBR0UsY0FBYyxDQUFDLElBQWYsR0FBc0IsS0FBQyxDQUFBLElBQUQsQ0FBTSxtQkFBTixDQUEyQixDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQTlCLENBQUEsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFBO1lBQ3RCLGNBQWMsQ0FBQyxJQUFmLEdBQXNCLEtBQUMsQ0FBQSxJQUFELENBQU0sbUJBQU4sQ0FBMkIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUE5QixDQUFBLENBQXdDLENBQUMsT0FBekMsQ0FBQSxFQUp4Qjs7VUFLQSxJQUFHLDhGQUFIO1lBQ0UsUUFBQSxHQUFXLEtBQUMsQ0FBQSxTQUFVLENBQUEsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsRUFBQyxPQUFEO0FBQzlDLGlCQUFBLGdCQUFBOztjQUFBLGNBQWUsQ0FBQSxJQUFBLENBQWYsR0FBdUI7QUFBdkIsYUFGRjs7aUJBR0EsQ0FBQSxDQUFFLEtBQUMsQ0FBQSxPQUFILENBQVcsQ0FBQyxPQUFaLENBQW9CLG9CQUFwQixFQUF5QyxDQUFDLEtBQUMsQ0FBQSxlQUFELENBQWlCLGNBQWpCLENBQUQsQ0FBekM7UUFka0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO0lBeERVOztvQ0F3RVosV0FBQSxHQUFhLFNBQUMsR0FBRCxFQUFLLFFBQUw7QUFDWCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVUsQ0FBQSxHQUFBLENBQVgsR0FBa0I7TUFDbEIsTUFBQSxHQUFTLENBQUEsQ0FBRSxXQUFGLENBQ1AsQ0FBQyxJQURNLENBQ0QsUUFBUSxDQUFDLElBRFIsQ0FFUCxDQUFDLEdBRk0sQ0FFRixHQUZFLENBR1AsQ0FBQyxJQUhNLENBR0QsVUFIQyxFQUdVLFFBSFY7TUFJVCxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOLENBQThCLENBQUMsTUFBL0IsQ0FBc0MsTUFBdEM7QUFDQTtBQUFBO1dBQUEsc0NBQUE7O1FBQ0UsSUFBOEIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFYLEtBQXVCLEdBQXJEO3VCQUFBLEtBQUssQ0FBQyxRQUFOLENBQWUsS0FBSyxDQUFDLElBQXJCLEdBQUE7U0FBQSxNQUFBOytCQUFBOztBQURGOztJQVBXOztvQ0FVYixlQUFBLEdBQWlCLFNBQUMsY0FBRDthQUNYLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNWLGNBQUE7VUFBQSxhQUFBLG1FQUFtRCxDQUFFO1VBQ3JELElBQUcsYUFBSDtZQUNFLFVBQUEsR0FBaUIsSUFBQSxhQUFBLENBQWMsY0FBZDttQkFDakIsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsU0FBQyxHQUFEO2NBQ2pCLElBQUcsR0FBSDtnQkFBWSxNQUFBLENBQU8sR0FBUCxFQUFaO2VBQUEsTUFBQTtnQkFBNkIsT0FBQSxDQUFRLFVBQVIsRUFBN0I7O2NBQ0EsSUFBb0QsV0FBcEQ7dUJBQUEsS0FBQyxDQUFBLE9BQUQsQ0FBUyxzQkFBVCxFQUFnQyxVQUFoQyxFQUFBOztZQUZpQixDQUFuQixFQUZGO1dBQUEsTUFBQTttQkFNRSxLQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkIsQ0FDRTtjQUFBLElBQUEsRUFBTSxjQUFOO2NBQ0EsUUFBQSxFQUFVLFNBQUMsY0FBRDtnQkFDUixhQUFBLEdBQWdCLEtBQUMsQ0FBQSxTQUFVLENBQUEsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsQ0FBQztnQkFDcEQsVUFBQSxHQUFpQixJQUFBLGFBQUEsQ0FBYyxjQUFkO3VCQUNqQixVQUFVLENBQUMsT0FBWCxDQUFtQixTQUFDLEdBQUQ7a0JBQ2pCLElBQUcsR0FBSDtvQkFBWSxNQUFBLENBQU8sR0FBUCxFQUFaO21CQUFBLE1BQUE7b0JBQTZCLE9BQUEsQ0FBUSxVQUFSLEVBQTdCOztrQkFDQSxJQUFvRCxXQUFwRDsyQkFBQSxLQUFDLENBQUEsT0FBRCxDQUFTLHNCQUFULEVBQWdDLFVBQWhDLEVBQUE7O2dCQUZpQixDQUFuQjtjQUhRLENBRFY7YUFERixFQU5GOztRQUZVO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBRFc7O0lBa0JqQixxQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sNEJBQVA7T0FBTCxFQUEwQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDeEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sV0FBUDtXQUFMLEVBQTBCLFNBQUE7WUFDeEIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxVQUFQO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVE7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQVA7Y0FBd0IsRUFBQSxFQUFJLHNCQUE1QjtjQUFvRCxRQUFBLEVBQVUsR0FBOUQ7YUFBUjtVQUZ3QixDQUExQjtVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9CQUFQO1dBQUwsRUFBa0MsU0FBQTtZQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFQO2FBQUwsRUFBeUIsU0FBQTtjQUN2QixLQUFDLENBQUEsS0FBRCxDQUFPLE1BQVA7cUJBQ0EsS0FBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixDQUFvQixrQkFBcEIsRUFBd0M7Z0JBQUEsRUFBQSxFQUFJLGtCQUFKO2dCQUF3QixDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQS9CO2dCQUF5QyxJQUFBLEVBQU0sTUFBL0M7Z0JBQXVELElBQUEsRUFBTSxRQUE3RDtlQUF4QztZQUZ1QixDQUF6QjttQkFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxVQUFOO2FBQUwsRUFBd0IsU0FBQTtjQUN0QixLQUFDLENBQUEsS0FBRCxDQUFPLE1BQVA7cUJBQ0EsS0FBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixDQUFvQixrQkFBcEIsRUFBd0M7Z0JBQUEsRUFBQSxFQUFJLGtCQUFKO2dCQUF3QixDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQS9CO2dCQUF5QyxJQUFBLEVBQU0sTUFBL0M7Z0JBQXVELElBQUEsRUFBTSxRQUE3RDtlQUF4QztZQUZzQixDQUF4QjtVQUpnQyxDQUFsQztVQU9BLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1CQUFQO1dBQUwsRUFBa0MsU0FBQTtZQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO2FBQUwsRUFBeUIsU0FBQTtxQkFDdkIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQO1lBRHVCLENBQXpCO1lBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBUDthQUFMLEVBQXdCLFNBQUE7cUJBQ3RCLEtBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBb0Isa0JBQXBCLEVBQXdDO2dCQUFBLEVBQUEsRUFBSSxrQkFBSjtnQkFBd0IsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUEvQjtnQkFBeUMsSUFBQSxFQUFNLE1BQS9DO2dCQUF1RCxJQUFBLEVBQU0sUUFBN0Q7ZUFBeEM7WUFEc0IsQ0FBeEI7bUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBUDthQUFMLEVBQXdCLFNBQUE7cUJBQ3RCLEtBQUMsQ0FBQSxNQUFELENBQVE7Z0JBQUEsRUFBQSxFQUFHLHlCQUFIO2dCQUE4QixDQUFBLEtBQUEsQ0FBQSxFQUFPLDBDQUFyQztlQUFSLEVBQXlGLFFBQXpGO1lBRHNCLENBQXhCO1VBTGdDLENBQWxDO1VBT0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0JBQVA7V0FBTCxFQUFnQyxTQUFBO1lBQzlCLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQVA7YUFBTCxFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUDtxQkFDQSxLQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLGtCQUFwQixFQUF3QztnQkFBQSxFQUFBLEVBQUksa0JBQUo7Z0JBQXdCLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBL0I7Z0JBQXlDLElBQUEsRUFBTSxNQUEvQztnQkFBdUQsSUFBQSxFQUFNLFFBQTdEO2VBQXhDO1lBRnVCLENBQXpCO21CQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFVBQVA7YUFBTCxFQUF5QixTQUFBO2NBQ3ZCLEtBQUMsQ0FBQSxLQUFELENBQU8sVUFBUDtxQkFDQSxLQUFDLENBQUEsY0FBYyxDQUFDLEdBQWhCLENBQW9CLGtCQUFwQixFQUF3QztnQkFBQSxFQUFBLEVBQUksa0JBQUo7Z0JBQXdCLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBL0I7Z0JBQXlDLElBQUEsRUFBTSxNQUEvQztlQUF4QztZQUZ1QixDQUF6QjtVQUo4QixDQUFoQztpQkFPQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO1dBQUwsRUFBMEIsU0FBQTttQkFDeEIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtjQUFBLEVBQUEsRUFBRyxxQkFBSDtjQUEwQixDQUFBLEtBQUEsQ0FBQSxFQUFPLGdDQUFqQztjQUFvRSxRQUFBLEVBQVUsR0FBOUU7YUFBUixFQUE0RixTQUE1RjtVQUR3QixDQUExQjtRQXpCd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFDO0lBRFE7O29DQTZCVixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO0lBRE87O29DQUVULFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBTSx1QkFBTixDQUE4QixDQUFDLEtBQS9CLENBQUE7SUFEVTs7b0NBR1osYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFDLENBQUEsSUFBRCxDQUFNLGdCQUFOLENBQXVCLENBQUMsSUFBeEIsQ0FBQTthQUNBLElBQUMsQ0FBQSxJQUFELENBQU0saUJBQU4sQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0lBRmE7O29DQUlmLGNBQUEsR0FBZ0IsU0FBQTtNQUNkLElBQUMsQ0FBQSxJQUFELENBQU0saUJBQU4sQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxnQkFBTixDQUF1QixDQUFDLElBQXhCLENBQUE7SUFGYzs7b0NBSWhCLGFBQUEsR0FBZSxTQUFDLFFBQUQ7YUFDYixJQUFDLENBQUEsSUFBRCxDQUFNLG9CQUFOLEVBQTRCLFNBQUMsQ0FBRCxFQUFHLGlCQUFIO2VBQzFCLFFBQUEsQ0FBUyxpQkFBVDtNQUQwQixDQUE1QjtJQURhOztvQ0FJZixzQkFBQSxHQUF3QixTQUFDLFFBQUQ7YUFDdEIsSUFBQyxDQUFBLElBQUQsQ0FBTSxzQkFBTixFQUE4QixTQUFDLENBQUQsRUFBRyxVQUFIO2VBQzVCLFFBQUEsQ0FBUyxVQUFUO01BRDRCLENBQTlCO0lBRHNCOzs7O0tBdkpVO0FBTnBDIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXcsICR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5yZW1vdGUgPSByZXF1aXJlICdyZW1vdGUnXG5cbmVsZW1lbnQ6IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUXVpY2tRdWVyeUNvbm5lY3RWaWV3IGV4dGVuZHMgVmlld1xuICBjb25zdHJ1Y3RvcjogKEBwcm90b2NvbHMpIC0+XG4gICAgQGNvbm5lY3Rpb25zU3RhdGVzID0gW11cbiAgICBzdXBlclxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgcG9ydEVkaXRvciA9IEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LXBvcnRcIilbMF0uZ2V0TW9kZWwoKVxuICAgIHBvcnRFZGl0b3Iuc2V0VGV4dCgnMzMwNicpXG5cbiAgICBAZmluZChcIiNxdWljay1xdWVyeS1maWxlXCIpLmF0dHIoJ3RhYmluZGV4JywyKVxuICAgIEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LWhvc3RcIikuYXR0cigndGFiaW5kZXgnLDIpXG4gICAgQGZpbmQoXCIjcXVpY2stcXVlcnktcG9ydFwiKS5hdHRyKCd0YWJpbmRleCcsMylcbiAgICBAZmluZChcIiNxdWljay1xdWVyeS11c2VyXCIpLmF0dHIoJ3RhYmluZGV4Jyw0KVxuICAgIEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LXBhc3NcIikuYXR0cigndGFiaW5kZXgnLDUpXG5cbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWNvbm5lY3QnKS5rZXlkb3duIChlKSAtPlxuICAgICAgJCh0aGlzKS5jbGljaygpIGlmIGUua2V5Q29kZSA9PSAxM1xuICAgIEBmaW5kKCcjcXVpY2stcXVlcnktcHJvdG9jb2wnKVxuICAgICAgLmtleWRvd24gKGUpIC0+XG4gICAgICAgIGlmIGUua2V5Q29kZSA9PSAxM1xuICAgICAgICAgICQoZS50YXJnZXQpLmNzcyBoZWlnaHQ6ICdhdXRvJ1xuICAgICAgICAgIGUudGFyZ2V0LnNpemUgPSAzXG4gICAgICAgIGVsc2UgaWYgIGUua2V5Q29kZSA9PSAzNyB8fCBlLmtleUNvZGUgPT0gMzhcbiAgICAgICAgICAkKGUudGFyZ2V0KS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5wcmV2KCkucHJvcCgnc2VsZWN0ZWQnLHRydWUpXG4gICAgICAgIGVsc2UgaWYgIGUua2V5Q29kZSA9PSAzOSB8fCBlLmtleUNvZGUgPT0gNDBcbiAgICAgICAgICAkKGUudGFyZ2V0KS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5uZXh0KCkucHJvcCgnc2VsZWN0ZWQnLHRydWUpXG4gICAgICAuYmx1ciAoZSkgLT5cbiAgICAgICAgJChlLnRhcmdldCkuY3NzIGhlaWdodDogJydcbiAgICAgICAgZS50YXJnZXQuc2l6ZSA9IDBcbiAgICAgIC5vbiAnY2hhbmdlIGJsdXInLCAoZSkgPT5cbiAgICAgICAgaWYgJChlLnRhcmdldCkuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykubGVuZ3RoID4gMFxuICAgICAgICAgIHByb3RvY29sID0gJChlLnRhcmdldCkuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuZGF0YSgncHJvdG9jb2wnKVxuICAgICAgICAgIGlmIHByb3RvY29sLmhhbmRsZXIuZnJvbUZpbGVzeXN0ZW0/XG4gICAgICAgICAgICBAc2hvd0xvY2FsSW5mbygpXG4gICAgICAgICAgICBpZiBwcm90b2NvbC5oYW5kbGVyLmZpbGVFeHRlbmNpb25zP1xuICAgICAgICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWJyb3dzZS1maWxlJylcbiAgICAgICAgICAgICAgIC5kYXRhKCdleHRlbnNpb25zJyxwcm90b2NvbC5oYW5kbGVyLmZpbGVFeHRlbmNpb25zKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWJyb3dzZS1maWxlJykuZGF0YSgnZXh0ZW5zaW9ucycsZmFsc2UpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNob3dSZW1vdGVJbmZvKClcbiAgICAgICAgICAgIHBvcnRFZGl0b3Iuc2V0VGV4dChwcm90b2NvbC5oYW5kbGVyLmRlZmF1bHRQb3J0LnRvU3RyaW5nKCkpXG5cbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWJyb3dzZS1maWxlJykuY2xpY2sgKGUpID0+XG4gICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXVxuICAgICAgICAgIHRpdGxlOiAnT3BlbiBEYXRhYmFzZSdcbiAgICAgICAgY3VycmVudFdpbmRvdyA9IGF0b20uZ2V0Q3VycmVudFdpbmRvdygpXG4gICAgICAgIGlmICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKFwiZXh0ZW5zaW9uc1wiKVxuICAgICAgICAgIG9wdGlvbnMuZmlsdGVycyA9IFt7IG5hbWU6ICdEYXRhYmFzZScsIGV4dGVuc2lvbnM6ICQoZS50YXJnZXQpLmRhdGEoXCJleHRlbnNpb25zXCIpIH1dXG4gICAgICAgIGRpYWxvZyA9IHJlbW90ZS5yZXF1aXJlKCdkaWFsb2cnKSB8fCByZW1vdGUucmVxdWlyZSgnZWxlY3Ryb24nKS5kaWFsb2dcbiAgICAgICAgZGlhbG9nLnNob3dPcGVuRGlhbG9nIGN1cnJlbnRXaW5kb3csIG9wdGlvbnMsIChmaWxlcykgPT5cbiAgICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWZpbGUnKVswXS5nZXRNb2RlbCgpLnNldFRleHQoZmlsZXNbMF0pIGlmIGZpbGVzP1xuXG4gICAgZm9yIGtleSxwcm90b2NvbCBvZiBAcHJvdG9jb2xzXG4gICAgICBvcHRpb24gPSAkKCc8b3B0aW9uLz4nKVxuICAgICAgICAudGV4dChwcm90b2NvbC5uYW1lKVxuICAgICAgICAudmFsKGtleSlcbiAgICAgICAgLmRhdGEoJ3Byb3RvY29sJyxwcm90b2NvbClcbiAgICAgIEBmaW5kKCcjcXVpY2stcXVlcnktcHJvdG9jb2wnKS5hcHBlbmQob3B0aW9uKVxuXG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1jb25uZWN0JykuY2xpY2sgKGUpID0+XG4gICAgICBjb25uZWN0aW9uSW5mbyA9IHtcbiAgICAgICAgdXNlcjogQGZpbmQoXCIjcXVpY2stcXVlcnktdXNlclwiKVswXS5nZXRNb2RlbCgpLmdldFRleHQoKSxcbiAgICAgICAgcGFzc3dvcmQ6IEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LXBhc3NcIilbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgICAgcHJvdG9jb2w6IEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LXByb3RvY29sXCIpLnZhbCgpXG4gICAgICB9XG4gICAgICBpZiBAcHJvdG9jb2xzW2Nvbm5lY3Rpb25JbmZvLnByb3RvY29sXT8uaGFuZGxlci5mcm9tRmlsZXN5c3RlbT9cbiAgICAgICAgY29ubmVjdGlvbkluZm8uZmlsZSA9IEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LWZpbGVcIilbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgIGVsc2VcbiAgICAgICAgY29ubmVjdGlvbkluZm8uaG9zdCA9IEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LWhvc3RcIilbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgICAgY29ubmVjdGlvbkluZm8ucG9ydCA9IEBmaW5kKFwiI3F1aWNrLXF1ZXJ5LXBvcnRcIilbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICAgIGlmIEBwcm90b2NvbHNbY29ubmVjdGlvbkluZm8ucHJvdG9jb2xdPy5kZWZhdWx0P1xuICAgICAgICBkZWZhdWx0cyA9IEBwcm90b2NvbHNbY29ubmVjdGlvbkluZm8ucHJvdG9jb2xdLmRlZmF1bHRcbiAgICAgICAgY29ubmVjdGlvbkluZm9bYXR0cl0gPSB2YWx1ZSBmb3IgYXR0cix2YWx1ZSBvZiBkZWZhdWx0c1xuICAgICAgJChAZWxlbWVudCkudHJpZ2dlcigncXVpY2tRdWVyeS5jb25uZWN0JyxbQGJ1aWxkQ29ubmVjdGlvbihjb25uZWN0aW9uSW5mbyldKVxuXG4gIGFkZFByb3RvY29sOiAoa2V5LHByb3RvY29sKS0+XG4gICAgQHByb3RvY29sc1trZXldID0gcHJvdG9jb2xcbiAgICBvcHRpb24gPSAkKCc8b3B0aW9uLz4nKVxuICAgICAgLnRleHQocHJvdG9jb2wubmFtZSlcbiAgICAgIC52YWwoa2V5KVxuICAgICAgLmRhdGEoJ3Byb3RvY29sJyxwcm90b2NvbClcbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LXByb3RvY29sJykuYXBwZW5kKG9wdGlvbilcbiAgICBmb3Igc3RhdGUgaW4gQGNvbm5lY3Rpb25zU3RhdGVzXG4gICAgICBzdGF0ZS5jYWxsYmFjayhzdGF0ZS5pbmZvKSBpZiBzdGF0ZS5pbmZvLnByb3RvY29sID09IGtleVxuXG4gIGJ1aWxkQ29ubmVjdGlvbjogKGNvbm5lY3Rpb25JbmZvKS0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCk9PlxuICAgICAgcHJvdG9jb2xDbGFzcyA9IEBwcm90b2NvbHNbY29ubmVjdGlvbkluZm8ucHJvdG9jb2xdPy5oYW5kbGVyXG4gICAgICBpZiBwcm90b2NvbENsYXNzXG4gICAgICAgIGNvbm5lY3Rpb24gPSBuZXcgcHJvdG9jb2xDbGFzcyhjb25uZWN0aW9uSW5mbylcbiAgICAgICAgY29ubmVjdGlvbi5jb25uZWN0IChlcnIpID0+XG4gICAgICAgICAgaWYgZXJyIHRoZW4gcmVqZWN0KGVycikgZWxzZSByZXNvbHZlKGNvbm5lY3Rpb24pXG4gICAgICAgICAgQHRyaWdnZXIoJ3F1aWNrUXVlcnkuY29ubmVjdGVkJyxjb25uZWN0aW9uKSAgdW5sZXNzIGVycj9cbiAgICAgIGVsc2UgI3doYWl0IHVudGlsIHRoZSBwYWNrYWdlIGlzIGxvYWRlZFxuICAgICAgICBAY29ubmVjdGlvbnNTdGF0ZXMucHVzaFxuICAgICAgICAgIGluZm86IGNvbm5lY3Rpb25JbmZvXG4gICAgICAgICAgY2FsbGJhY2s6IChjb25uZWN0aW9uSW5mbykgPT5cbiAgICAgICAgICAgIHByb3RvY29sQ2xhc3MgPSBAcHJvdG9jb2xzW2Nvbm5lY3Rpb25JbmZvLnByb3RvY29sXS5oYW5kbGVyXG4gICAgICAgICAgICBjb25uZWN0aW9uID0gbmV3IHByb3RvY29sQ2xhc3MoY29ubmVjdGlvbkluZm8pXG4gICAgICAgICAgICBjb25uZWN0aW9uLmNvbm5lY3QgKGVycikgPT5cbiAgICAgICAgICAgICAgaWYgZXJyIHRoZW4gcmVqZWN0KGVycikgZWxzZSByZXNvbHZlKGNvbm5lY3Rpb24pXG4gICAgICAgICAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LmNvbm5lY3RlZCcsY29ubmVjdGlvbikgIHVubGVzcyBlcnI/XG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2RpYWxvZyBxdWljay1xdWVyeS1jb25uZWN0JywgPT5cbiAgICAgIEBkaXYgY2xhc3M6IFwiY29sLXNtLTEyXCIgLCA9PlxuICAgICAgICBAbGFiZWwgJ3Byb3RvY29sJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiBcImZvcm0tY29udHJvbFwiICwgaWQ6IFwicXVpY2stcXVlcnktcHJvdG9jb2xcIiwgdGFiaW5kZXg6IFwiMVwiXG4gICAgICBAZGl2IGNsYXNzOiBcInFxLXJlbW90ZS1pbmZvIHJvd1wiLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS05XCIgLCA9PlxuICAgICAgICAgIEBsYWJlbCAnaG9zdCdcbiAgICAgICAgICBAY3VycmVudEJ1aWxkZXIudGFnICdhdG9tLXRleHQtZWRpdG9yJywgaWQ6IFwicXVpY2stcXVlcnktaG9zdFwiLCBjbGFzczogJ2VkaXRvcicsIG1pbmk6ICdtaW5pJywgdHlwZTogJ3N0cmluZydcbiAgICAgICAgQGRpdiBjbGFzczpcImNvbC1zbS0zXCIgLCA9PlxuICAgICAgICAgIEBsYWJlbCAncG9ydCdcbiAgICAgICAgICBAY3VycmVudEJ1aWxkZXIudGFnICdhdG9tLXRleHQtZWRpdG9yJywgaWQ6IFwicXVpY2stcXVlcnktcG9ydFwiLCBjbGFzczogJ2VkaXRvcicsIG1pbmk6ICdtaW5pJywgdHlwZTogJ3N0cmluZydcbiAgICAgIEBkaXYgY2xhc3M6IFwicXEtbG9jYWwtaW5mbyByb3dcIiAsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLXNtLTEyXCIsID0+XG4gICAgICAgICAgQGxhYmVsICdmaWxlJ1xuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC1zbS05XCIsID0+XG4gICAgICAgICAgQGN1cnJlbnRCdWlsZGVyLnRhZyAnYXRvbS10ZXh0LWVkaXRvcicsIGlkOiBcInF1aWNrLXF1ZXJ5LWZpbGVcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaScsIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLXNtLTNcIiwgPT5cbiAgICAgICAgICBAYnV0dG9uIGlkOlwicXVpY2stcXVlcnktYnJvd3NlLWZpbGVcIiwgY2xhc3M6IFwiYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi1maWxlLWRpcmVjdG9yeVwiLCBcIkJyb3dzZVwiXG4gICAgICBAZGl2IGNsYXNzOiBcInFxLWF1dGgtaW5mbyByb3dcIiwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtc20tNlwiICwgPT5cbiAgICAgICAgICBAbGFiZWwgJ3VzZXInXG4gICAgICAgICAgQGN1cnJlbnRCdWlsZGVyLnRhZyAnYXRvbS10ZXh0LWVkaXRvcicsIGlkOiBcInF1aWNrLXF1ZXJ5LXVzZXJcIiwgY2xhc3M6ICdlZGl0b3InLCBtaW5pOiAnbWluaScsIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLXNtLTZcIiAsID0+XG4gICAgICAgICAgQGxhYmVsICdwYXNzd29yZCdcbiAgICAgICAgICBAY3VycmVudEJ1aWxkZXIudGFnICdhdG9tLXRleHQtZWRpdG9yJywgaWQ6IFwicXVpY2stcXVlcnktcGFzc1wiLCBjbGFzczogJ2VkaXRvcicsIG1pbmk6ICdtaW5pJ1xuICAgICAgQGRpdiBjbGFzczogXCJjb2wtc20tMTJcIiAsID0+XG4gICAgICAgIEBidXR0b24gaWQ6XCJxdWljay1xdWVyeS1jb25uZWN0XCIsIGNsYXNzOiBcImJ0biBidG4tZGVmYXVsdCBpY29uIGljb24tcGx1Z1wiICwgdGFiaW5kZXg6IFwiNlwiICwgXCJDb25uZWN0XCJcblxuICBkZXN0cm95OiAtPlxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG4gIGZvY3VzRmlyc3Q6IC0+XG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1wcm90b2NvbCcpLmZvY3VzKClcblxuICBzaG93TG9jYWxJbmZvOiAtPlxuICAgIEBmaW5kKFwiLnFxLWxvY2FsLWluZm9cIikuc2hvdygpXG4gICAgQGZpbmQoXCIucXEtcmVtb3RlLWluZm9cIikuaGlkZSgpXG5cbiAgc2hvd1JlbW90ZUluZm86IC0+XG4gICAgQGZpbmQoXCIucXEtcmVtb3RlLWluZm9cIikuc2hvdygpXG4gICAgQGZpbmQoXCIucXEtbG9jYWwtaW5mb1wiKS5oaWRlKClcblxuICBvbldpbGxDb25uZWN0OiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jb25uZWN0JywgKGUsY29ubmVjdGlvblByb21pc2UpIC0+XG4gICAgICBjYWxsYmFjayhjb25uZWN0aW9uUHJvbWlzZSlcblxuICBvbkNvbm5lY3Rpb25TdGFibGlzaGVkOiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5jb25uZWN0ZWQnLCAoZSxjb25uZWN0aW9uKSAtPlxuICAgICAgY2FsbGJhY2soY29ubmVjdGlvbilcbiJdfQ==
