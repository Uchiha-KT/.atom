(function() {
  var $, QuickQueryResultView, View, fs, json2csv, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  json2csv = require('json2csv');

  fs = require('fs');

  module.exports = QuickQueryResultView = (function(superClass) {
    extend(QuickQueryResultView, superClass);

    QuickQueryResultView.prototype.keepHidden = false;

    QuickQueryResultView.prototype.rows = null;

    QuickQueryResultView.prototype.fields = null;

    function QuickQueryResultView() {
      this.resizeResultView = bind(this.resizeResultView, this);
      QuickQueryResultView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryResultView.prototype.initialize = function() {
      $(window).resize((function(_this) {
        return function() {
          return _this.fixSizes();
        };
      })(this));
      return this.handleResizeEvents();
    };

    QuickQueryResultView.prototype.getTitle = function() {
      return 'Query Result';
    };

    QuickQueryResultView.prototype.serialize = function() {};

    QuickQueryResultView.content = function() {
      return this.div({
        "class": 'quick-query-result'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'quick-query-result-resize-handler'
          }, '');
          return _this.div({
            "class": 'quick-query-result-table-wrapper',
            outlet: 'tableWrapper'
          }, function() {
            _this.table({
              "class": 'table quick-query-result-numbers'
            }, function() {
              _this.thead(function() {
                return _this.tr(function() {
                  return _this.th('#');
                });
              });
              return _this.tbody({
                outlet: 'numbers'
              }, '');
            });
            return _this.table({
              "class": 'quick-query-result-table table',
              outlet: 'table'
            }, '');
          });
        };
      })(this));
    };

    QuickQueryResultView.prototype.destroy = function() {};

    QuickQueryResultView.prototype.showRows = function(rows1, fields1, connection, done) {
      var $tbody, $th, $thead, $tr, field, k, len, ref1;
      this.rows = rows1;
      this.fields = fields1;
      this.connection = connection;
      this.table.css('height', '');
      this.attr('data-allow-edition', (function(_this) {
        return function() {
          if (_this.connection.allowEdition) {
            return 'yes';
          } else {
            return null;
          }
        };
      })(this));
      this.keepHidden = false;
      $thead = $('<thead/>');
      $tr = $('<tr/>');
      ref1 = this.fields;
      for (k = 0, len = ref1.length; k < len; k++) {
        field = ref1[k];
        $th = $('<th/>');
        $th.text(field.name);
        $tr.append($th);
      }
      $thead.html($tr);
      this.table.html($thead);
      this.numbers.empty();
      $tbody = $('<tbody/>');
      this.forEachChunk(this.rows, done, (function(_this) {
        return function(row, i) {
          var $td, array_row, j, l, len1, ref2, row_value;
          array_row = Array.isArray(row);
          $tr = $('<tr/>');
          $td = $('<td/>');
          $td.text(i + 1);
          _this.numbers.append($('<tr/>').html($td));
          ref2 = _this.fields;
          for (j = l = 0, len1 = ref2.length; l < len1; j = ++l) {
            field = ref2[j];
            $td = $('<td/>');
            row_value = array_row ? row[j] : row[field.name];
            if (row_value != null) {
              $td.attr('data-original-value', row_value);
              $td.text(row_value);
            } else {
              $td.data('original-value-null', true);
              $td.addClass('null').text('NULL');
            }
            $td.mousedown(function(e) {
              $(this).closest('table').find('td').removeClass('selected');
              return $(this).addClass('selected');
            });
            if (_this.connection.allowEdition) {
              $td.dblclick(function(e) {
                return _this.editRecord($(e.currentTarget));
              });
            }
            $tr.append($td);
          }
          return $tbody.append($tr);
        };
      })(this));
      this.table.append($tbody);
      if (atom.config.get('quick-query.resultsInTab')) {
        this.find('.quick-query-result-resize-handler').hide();
        this.find('.quick-query-result-numbers').css({
          top: 0
        });
        $thead.css({
          'margin-top': 0
        });
      }
      return this.tableWrapper.unbind('scroll').scroll((function(_this) {
        return function(e) {
          var scroll;
          scroll = $(e.target).scrollTop() - $thead.outerHeight();
          _this.numbers.css({
            'margin-top': -1 * scroll
          });
          scroll = $(e.target).scrollLeft();
          return $thead.css({
            'margin-left': -1 * scroll
          });
        };
      })(this));
    };

    QuickQueryResultView.prototype.forEachChunk = function(array, done, fn) {
      var chuncksize, doChunk, index;
      chuncksize = 100;
      index = 0;
      doChunk = (function(_this) {
        return function() {
          var cnt;
          cnt = chuncksize;
          while (cnt > 0 && index < array.length) {
            fn.call(_this, array[index], index, array);
            ++index;
            cnt--;
          }
          if (index < array.length) {
            return setTimeout(doChunk, 1);
          } else {
            return typeof done === "function" ? done() : void 0;
          }
        };
      })(this);
      return doChunk();
    };

    QuickQueryResultView.prototype.rowsStatus = function() {
      var added, modified, removed, status;
      added = this.table.find('tr.added').length;
      status = (this.rows.length + added).toString();
      status += status === '1' ? ' row' : ' rows';
      if (added > 0) {
        status += "," + added + " added";
      }
      modified = this.table.find('tr.modified').length;
      if (modified > 0) {
        status += "," + modified + " modified";
      }
      removed = this.table.find('tr.removed').length;
      if (removed > 0) {
        status += "," + removed + " deleted";
      }
      return status;
    };

    QuickQueryResultView.prototype.copy = function() {
      var $td;
      $td = this.find('td.selected');
      if ($td.length === 1) {
        return atom.clipboard.write($td.text());
      }
    };

    QuickQueryResultView.prototype.copyAll = function() {
      var fields, rows;
      if ((this.rows != null) && (this.fields != null)) {
        if (Array.isArray(this.rows[0])) {
          fields = this.fields.map(function(field, i) {
            return {
              label: field.name,
              value: function(row) {
                return row[i];
              }
            };
          });
        } else {
          fields = this.fields.map(function(field) {
            return field.name;
          });
        }
        rows = this.rows.map(function(row) {
          var simpleRow;
          simpleRow = JSON.parse(JSON.stringify(row));
          return simpleRow;
        });
        return json2csv({
          del: "\t",
          data: rows,
          fields: fields,
          defaultValue: ''
        }, function(err, csv) {
          if (err) {
            return console.log(err);
          } else {
            return atom.clipboard.write(csv);
          }
        });
      }
    };

    QuickQueryResultView.prototype.saveCSV = function() {
      var fields, filepath, rows;
      if ((this.rows != null) && (this.fields != null)) {
        filepath = atom.showSaveDialogSync();
        if (filepath != null) {
          if (Array.isArray(this.rows[0])) {
            fields = this.fields.map(function(field, i) {
              return {
                label: field.name,
                value: function(row) {
                  return row[i];
                }
              };
            });
          } else {
            fields = this.fields.map(function(field) {
              return field.name;
            });
          }
          rows = this.rows.map(function(row) {
            var field, k, len, simpleRow;
            simpleRow = JSON.parse(JSON.stringify(row));
            for (k = 0, len = fields.length; k < len; k++) {
              field = fields[k];
              if (simpleRow[field] == null) {
                simpleRow[field] = '';
              }
            }
            return simpleRow;
          });
          return json2csv({
            data: rows,
            fields: fields,
            defaultValue: ''
          }, function(err, csv) {
            if (err) {
              return console.log(err);
            } else {
              return fs.writeFile(filepath, csv, function(err) {
                if (err) {
                  return console.log(err);
                } else {
                  return console.log('file saved');
                }
              });
            }
          });
        }
      }
    };

    QuickQueryResultView.prototype.editRecord = function($td) {
      var editor, textEditor;
      if ($td.children().length === 0) {
        $td.addClass('editing');
        editor = $("<atom-text-editor/>").attr('mini', 'mini').addClass('editor');
        textEditor = editor[0].getModel();
        if (!$td.hasClass('null')) {
          textEditor.setText($td.text());
        }
        $td.html(editor);
        editor.width(editor.width());
        editor.keydown(function(e) {
          if (e.keyCode === 13) {
            return $(this).blur();
          }
        });
        textEditor.onDidChangeCursorPosition((function(_this) {
          return function(e) {
            var charWidth, column, left, tdleft, trleft, width;
            if (editor.width() > _this.tableWrapper.width()) {
              charWidth = textEditor.getDefaultCharWidth();
              column = e.newScreenPosition.column;
              trleft = -1 * editor.closest('tr').offset().left;
              tdleft = editor.closest('td').offset().left;
              width = _this.tableWrapper.width() / 2;
              left = trleft + tdleft - width;
              if (Math.abs(_this.tableWrapper.scrollLeft() - (left + column * charWidth)) > width) {
                return _this.tableWrapper.scrollLeft(left + column * charWidth);
              }
            }
          };
        })(this));
        editor.blur((function(_this) {
          return function(e) {
            var $tr;
            $td = $(e.currentTarget).parent();
            $td.removeClass('editing selected');
            $tr = $td.closest('tr');
            $td.removeClass('null');
            $td.text(e.currentTarget.getModel().getText());
            _this.fixSizes();
            if ($tr.hasClass('added')) {
              $td.removeClass('default');
              $td.addClass('status-added');
            } else {
              if (e.target.getModel().getText() !== $td.attr('data-original-value')) {
                $tr.addClass('modified');
                $td.addClass('status-modified');
              } else {
                $td.removeClass('status-modified');
                if ($tr.find('td.status-modified').length === 0) {
                  $tr.removeClass('modified');
                }
              }
            }
            return _this.trigger('quickQuery.rowStatusChanged', [$tr]);
          };
        })(this));
        return editor.focus();
      }
    };

    QuickQueryResultView.prototype.insertRecord = function() {
      var $td, $tr;
      $td = $("<td/>").text(this.numbers.children().length + 1);
      $tr = $("<tr/>").html($td);
      this.numbers.append($tr);
      $tr = $("<tr/>");
      $tr.addClass('added');
      this.table.find("th").each((function(_this) {
        return function() {
          $td = $("<td/>");
          $td.mousedown(function(e) {
            $(this).closest('table').find('td').removeClass('selected');
            return $(this).addClass('selected');
          });
          $td.addClass('default');
          $td.dblclick(function(e) {
            return _this.editRecord($(e.currentTarget));
          });
          return $tr.append($td);
        };
      })(this));
      this.table.find('tbody').append($tr);
      this.tableWrapper.scrollTop(function() {
        return this.scrollHeight;
      });
      return this.trigger('quickQuery.rowStatusChanged', [$tr]);
    };

    QuickQueryResultView.prototype.deleteRecord = function() {
      var $td, $tr;
      $td = this.find('td.selected');
      if ($td.length === 1) {
        $tr = $td.parent();
        $tr.removeClass('modified');
        $tr.find('td').removeClass('status-modified selected');
        $tr.addClass('status-removed removed');
        return this.trigger('quickQuery.rowStatusChanged', [$tr]);
      }
    };

    QuickQueryResultView.prototype.undo = function() {
      var $td, $tr, value;
      $td = this.find('td.selected');
      if ($td.length === 1) {
        $tr = $td.closest('tr');
        if ($tr.hasClass('removed')) {
          $tr.removeClass('status-removed removed');
        } else if ($tr.hasClass('added')) {
          $td.removeClass('null').addClass('default').text('');
        } else {
          if ($td.data('original-value-null')) {
            $td.addClass('null').text('NULL');
          } else {
            value = $td.attr('data-original-value');
            $td.removeClass('null').text(value);
          }
          $td.removeClass('status-modified');
          if ($tr.find('td.status-modified').length === 0) {
            $tr.removeClass('modified');
          }
        }
        return this.trigger('quickQuery.rowStatusChanged', [$tr]);
      }
    };

    QuickQueryResultView.prototype.setNull = function() {
      var $td, $tr;
      $td = this.find('td.selected');
      if ($td.length === 1 && !$td.hasClass('null')) {
        $tr = $td.closest('tr');
        $td.text('NULL');
        $td.addClass('null');
        if ($tr.hasClass('added')) {
          $td.removeClass('default');
          $td.addClass('status-added');
        } else {
          $tr.addClass('modified');
          $td.addClass('status-modified');
        }
        $td.removeClass('selected');
        return this.trigger('quickQuery.rowStatusChanged', [$tr]);
      }
    };

    QuickQueryResultView.prototype.apply = function() {
      return this.table.find('tbody tr').each((function(_this) {
        return function(i, tr) {
          var fields, row, values;
          values = {};
          if ($(tr).hasClass('modified')) {
            row = _this.rows[i];
            $(tr).find('td').each(function(j, td) {
              if ($(td).hasClass('status-modified')) {
                return values[_this.fields[j].name] = $(td).hasClass('null') ? null : $(td).text();
              }
            });
            fields = _this.fields.filter(function(field) {
              return values.hasOwnProperty(field.name);
            });
            return _this.connection.updateRecord(row, fields, values);
          } else if ($(tr).hasClass('added')) {
            $(tr).find('td').each(function(j, td) {
              if (!$(td).hasClass('default')) {
                return values[_this.fields[j].name] = $(td).hasClass('null') ? null : $(td).text();
              }
            });
            fields = _this.fields.filter(function(field) {
              return values.hasOwnProperty(field.name);
            });
            return _this.connection.insertRecord(fields, values);
          } else if ($(tr).hasClass('status-removed')) {
            row = _this.rows[i];
            return _this.connection.deleteRecord(row, _this.fields);
          }
        };
      })(this));
    };

    QuickQueryResultView.prototype.hiddenResults = function() {
      return this.keepHidden;
    };

    QuickQueryResultView.prototype.showResults = function() {
      return this.keepHidden = false;
    };

    QuickQueryResultView.prototype.hideResults = function() {
      return this.keepHidden = true;
    };

    QuickQueryResultView.prototype.fixSizes = function() {
      var tds;
      if (this.table.find('tbody tr').length > 0) {
        tds = this.table.find('tbody tr:first').children();
        this.table.find('thead tr').children().each((function(_this) {
          return function(i, th) {
            var td, tdw, thw, w;
            td = tds[i];
            thw = $(th).outerWidth();
            tdw = $(td).outerWidth();
            w = Math.max(tdw, thw);
            $(td).css('min-width', w + "px");
            return $(th).css('min-width', w + "px");
          };
        })(this));
        return this.fixScrolls();
      } else {
        return this.table.width(this.table.find('thead').width());
      }
    };

    QuickQueryResultView.prototype.fixScrolls = function() {
      var headerHeght, numbersWidth, scroll;
      headerHeght = this.table.find('thead').outerHeight();
      numbersWidth = this.numbers.width();
      this.tableWrapper.css({
        'margin-left': numbersWidth,
        'margin-top': headerHeght - 1
      });
      this.tableWrapper.height(this.height() - headerHeght - 1);
      scroll = headerHeght - this.tableWrapper.scrollTop();
      this.numbers.css({
        'margin-top': scroll
      });
      scroll = -1 * this.tableWrapper.scrollLeft();
      return this.table.find('thead').css({
        'margin-left': scroll
      });
    };

    QuickQueryResultView.prototype.fixNumbers = function() {
      this.table.height(this.table.height() + 1);
      return this.table.height(this.table.height() - 1);
    };

    QuickQueryResultView.prototype.onRowStatusChanged = function(callback) {
      return this.bind('quickQuery.rowStatusChanged', function(e, row) {
        return callback(row);
      });
    };

    QuickQueryResultView.prototype.handleResizeEvents = function() {
      return this.on('mousedown', '.quick-query-result-resize-handler', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
    };

    QuickQueryResultView.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeResultView);
      return $(document).on('mouseup', this.resizeStopped);
    };

    QuickQueryResultView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeResultView);
      return $(document).off('mouseup', this.resizeStopped);
    };

    QuickQueryResultView.prototype.resizeResultView = function(arg) {
      var height, pageY, which;
      pageY = arg.pageY, which = arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      height = this.outerHeight() + this.offset().top - pageY;
      this.height(height);
      return this.fixScrolls();
    };

    return QuickQueryResultView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LXJlc3VsdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTs7OztFQUFBLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxlQUFELEVBQU87O0VBQ1AsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7bUNBQ0osVUFBQSxHQUFZOzttQ0FDWixJQUFBLEdBQU07O21DQUNOLE1BQUEsR0FBUTs7SUFFTSw4QkFBQTs7TUFDWix1REFBQSxTQUFBO0lBRFk7O21DQUdkLFVBQUEsR0FBWSxTQUFBO01BQ1YsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNmLEtBQUMsQ0FBQSxRQUFELENBQUE7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7YUFFQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtJQUhVOzttQ0FLWixRQUFBLEdBQVUsU0FBQTtBQUNSLGFBQU87SUFEQzs7bUNBRVYsU0FBQSxHQUFXLFNBQUEsR0FBQTs7SUFFWCxvQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0JBQVA7T0FBTCxFQUFtQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDakMsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUNBQVA7V0FBTCxFQUFpRCxFQUFqRDtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEs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LGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsSUFBQyxDQUFBLEVBQUQsQ0FBSSxXQUFKLEVBQWlCLG9DQUFqQixFQUF1RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFBTyxLQUFDLENBQUEsYUFBRCxDQUFlLENBQWY7UUFBUDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQ7SUFEa0I7O21DQUVwQixhQUFBLEdBQWUsU0FBQTtNQUNiLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixJQUFDLENBQUEsZ0JBQTdCO2FBQ0EsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxTQUFmLEVBQTBCLElBQUMsQ0FBQSxhQUEzQjtJQUZhOzttQ0FHZixhQUFBLEdBQWUsU0FBQTtNQUNiLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFdBQWhCLEVBQTZCLElBQUMsQ0FBQSxnQkFBOUI7YUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixTQUFoQixFQUEyQixJQUFDLENBQUEsYUFBNUI7SUFGYTs7bUNBR2YsZ0JBQUEsR0FBa0IsU0FBQyxHQUFEO0FBQ2hCLFVBQUE7TUFEa0IsbUJBQU87TUFDekIsSUFBK0IsS0FBQSxLQUFTLENBQXhDO0FBQUEsZUFBTyxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQVA7O01BQ0EsTUFBQSxHQUFTLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxHQUFpQixJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxHQUEzQixHQUFpQztNQUMxQyxJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVI7YUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBO0lBSmdCOzs7O0tBaFVlO0FBTG5DIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXcsICR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5qc29uMmNzdiA9IHJlcXVpcmUoJ2pzb24yY3N2JylcbmZzID0gcmVxdWlyZSgnZnMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBRdWlja1F1ZXJ5UmVzdWx0VmlldyBleHRlbmRzIFZpZXdcbiAga2VlcEhpZGRlbjogZmFsc2VcbiAgcm93czogbnVsbCxcbiAgZmllbGRzOiBudWxsXG5cbiAgY29uc3RydWN0b3I6ICAoKS0+XG4gICAgc3VwZXJcblxuICBpbml0aWFsaXplOiAtPlxuICAgICQod2luZG93KS5yZXNpemUgPT5cbiAgICAgIEBmaXhTaXplcygpXG4gICAgQGhhbmRsZVJlc2l6ZUV2ZW50cygpXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgcmV0dXJuICdRdWVyeSBSZXN1bHQnXG4gIHNlcmlhbGl6ZTogLT5cblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAncXVpY2stcXVlcnktcmVzdWx0JyAsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncXVpY2stcXVlcnktcmVzdWx0LXJlc2l6ZS1oYW5kbGVyJywgJydcbiAgICAgIEBkaXYgY2xhc3M6ICdxdWljay1xdWVyeS1yZXN1bHQtdGFibGUtd3JhcHBlcicsIG91dGxldDogJ3RhYmxlV3JhcHBlcicgLCA9PlxuICAgICAgICBAdGFibGUgY2xhc3M6ICd0YWJsZSBxdWljay1xdWVyeS1yZXN1bHQtbnVtYmVycycsID0+XG4gICAgICAgICAgQHRoZWFkID0+IChAdHIgPT4gQHRoICcjJylcbiAgICAgICAgICBAdGJvZHkgb3V0bGV0OiAnbnVtYmVycycsICcnXG4gICAgICAgIEB0YWJsZSBjbGFzczogJ3F1aWNrLXF1ZXJ5LXJlc3VsdC10YWJsZSB0YWJsZScsIG91dGxldDogJ3RhYmxlJyAsICcnXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICAjIEBlbGVtZW50LnJlbW92ZSgpXG5cbiAgc2hvd1Jvd3M6IChAcm93cywgQGZpZWxkcyxAY29ubmVjdGlvbixkb25lKS0+XG4gICAgQHRhYmxlLmNzcygnaGVpZ2h0JywnJykgI2FkZGVkIGluIGZpeE51bWJlcnMoKVxuICAgIEBhdHRyICdkYXRhLWFsbG93LWVkaXRpb24nICwgPT5cbiAgICAgIGlmIEBjb25uZWN0aW9uLmFsbG93RWRpdGlvbiB0aGVuICd5ZXMnIGVsc2UgbnVsbFxuICAgIEBrZWVwSGlkZGVuID0gZmFsc2VcbiAgICAkdGhlYWQgPSAkKCc8dGhlYWQvPicpXG4gICAgJHRyID0gJCgnPHRyLz4nKVxuICAgIGZvciBmaWVsZCBpbiBAZmllbGRzXG4gICAgICAkdGggPSAkKCc8dGgvPicpXG4gICAgICAkdGgudGV4dChmaWVsZC5uYW1lKVxuICAgICAgJHRyLmFwcGVuZCgkdGgpXG4gICAgJHRoZWFkLmh0bWwoJHRyKVxuICAgIEB0YWJsZS5odG1sKCR0aGVhZClcbiAgICBAbnVtYmVycy5lbXB0eSgpXG4gICAgJHRib2R5ID0gJCgnPHRib2R5Lz4nKVxuICAgICMgZm9yIHJvdyxpIGluIEByb3dzXG4gICAgQGZvckVhY2hDaHVuayBAcm93cyAsIGRvbmUgLCAocm93LGkpID0+XG4gICAgICBhcnJheV9yb3cgPSBBcnJheS5pc0FycmF5KHJvdylcbiAgICAgICR0ciA9ICQoJzx0ci8+JylcbiAgICAgICR0ZCA9ICQoJzx0ZC8+JylcbiAgICAgICR0ZC50ZXh0KGkrMSlcbiAgICAgIEBudW1iZXJzLmFwcGVuZCgkKCc8dHIvPicpLmh0bWwoJHRkKSlcbiAgICAgIGZvciBmaWVsZCxqIGluIEBmaWVsZHNcbiAgICAgICAgJHRkID0gJCgnPHRkLz4nKVxuICAgICAgICByb3dfdmFsdWUgPSBpZiBhcnJheV9yb3cgdGhlbiByb3dbal0gZWxzZSByb3dbZmllbGQubmFtZV1cbiAgICAgICAgaWYgcm93X3ZhbHVlP1xuICAgICAgICAgICR0ZC5hdHRyKCdkYXRhLW9yaWdpbmFsLXZhbHVlJyxyb3dfdmFsdWUpXG4gICAgICAgICAgJHRkLnRleHQocm93X3ZhbHVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgJHRkLmRhdGEoJ29yaWdpbmFsLXZhbHVlLW51bGwnLHRydWUpXG4gICAgICAgICAgJHRkLmFkZENsYXNzKCdudWxsJykudGV4dCgnTlVMTCcpXG4gICAgICAgICR0ZC5tb3VzZWRvd24gKGUpLT5cbiAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ3RhYmxlJykuZmluZCgndGQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgaWYgQGNvbm5lY3Rpb24uYWxsb3dFZGl0aW9uXG4gICAgICAgICAgJHRkLmRibGNsaWNrIChlKT0+IEBlZGl0UmVjb3JkKCQoZS5jdXJyZW50VGFyZ2V0KSlcbiAgICAgICAgJHRyLmFwcGVuZCgkdGQpXG4gICAgICAkdGJvZHkuYXBwZW5kKCR0cilcbiAgICBAdGFibGUuYXBwZW5kKCR0Ym9keSlcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3F1aWNrLXF1ZXJ5LnJlc3VsdHNJblRhYicpXG4gICAgICBAZmluZCgnLnF1aWNrLXF1ZXJ5LXJlc3VsdC1yZXNpemUtaGFuZGxlcicpLmhpZGUoKVxuICAgICAgQGZpbmQoJy5xdWljay1xdWVyeS1yZXN1bHQtbnVtYmVycycpLmNzcyB0b3A6MFxuICAgICAgJHRoZWFkLmNzcyAnbWFyZ2luLXRvcCc6MFxuICAgIEB0YWJsZVdyYXBwZXIudW5iaW5kKCdzY3JvbGwnKS5zY3JvbGwgKGUpID0+XG4gICAgICBzY3JvbGwgPSAkKGUudGFyZ2V0KS5zY3JvbGxUb3AoKSAtICR0aGVhZC5vdXRlckhlaWdodCgpXG4gICAgICBAbnVtYmVycy5jc3MgJ21hcmdpbi10b3AnOiAoLTEqc2Nyb2xsKVxuICAgICAgc2Nyb2xsID0gJChlLnRhcmdldCkuc2Nyb2xsTGVmdCgpXG4gICAgICAkdGhlYWQuY3NzICdtYXJnaW4tbGVmdCc6ICgtMSpzY3JvbGwpXG5cbiAgZm9yRWFjaENodW5rOiAoYXJyYXksZG9uZSxmbiktPlxuICAgIGNodW5ja3NpemUgPSAxMDBcbiAgICBpbmRleCA9IDBcbiAgICBkb0NodW5rID0gKCk9PlxuICAgICAgY250ID0gY2h1bmNrc2l6ZTtcbiAgICAgIHdoaWxlIGNudCA+IDAgJiYgaW5kZXggPCBhcnJheS5sZW5ndGhcbiAgICAgICAgZm4uY2FsbChALGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KVxuICAgICAgICArK2luZGV4XG4gICAgICAgIGNudC0tXG4gICAgICBpZiBpbmRleCA8IGFycmF5Lmxlbmd0aFxuICAgICAgICBzZXRUaW1lb3V0KGRvQ2h1bmssIDEpXG4gICAgICBlbHNlXG4gICAgICAgZG9uZT8oKVxuICAgIGRvQ2h1bmsoKVxuXG4gIHJvd3NTdGF0dXM6IC0+XG4gICAgYWRkZWQgPSBAdGFibGUuZmluZCgndHIuYWRkZWQnKS5sZW5ndGhcbiAgICBzdGF0dXMgPSAoQHJvd3MubGVuZ3RoICsgYWRkZWQpLnRvU3RyaW5nKClcbiAgICBzdGF0dXMgKz0gaWYgc3RhdHVzID09ICcxJyB0aGVuICcgcm93JyBlbHNlICcgcm93cydcbiAgICBzdGF0dXMgKz0gXCIsI3thZGRlZH0gYWRkZWRcIiBpZiBhZGRlZCA+IDBcbiAgICBtb2RpZmllZCA9IEB0YWJsZS5maW5kKCd0ci5tb2RpZmllZCcpLmxlbmd0aFxuICAgIHN0YXR1cyArPSBcIiwje21vZGlmaWVkfSBtb2RpZmllZFwiIGlmIG1vZGlmaWVkID4gMFxuICAgIHJlbW92ZWQgPSBAdGFibGUuZmluZCgndHIucmVtb3ZlZCcpLmxlbmd0aFxuICAgIHN0YXR1cyArPSBcIiwje3JlbW92ZWR9IGRlbGV0ZWRcIiBpZiByZW1vdmVkID4gMFxuICAgIHN0YXR1c1xuXG4gIGNvcHk6IC0+XG4gICAgJHRkID0gQGZpbmQoJ3RkLnNlbGVjdGVkJylcbiAgICBpZiAkdGQubGVuZ3RoID09IDFcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKCR0ZC50ZXh0KCkpXG5cbiAgY29weUFsbDogLT5cbiAgICBpZiBAcm93cz8gJiYgQGZpZWxkcz9cbiAgICAgIGlmIEFycmF5LmlzQXJyYXkoQHJvd3NbMF0pXG4gICAgICAgIGZpZWxkcyA9IEBmaWVsZHMubWFwIChmaWVsZCxpKSAtPlxuICAgICAgICAgIGxhYmVsOiBmaWVsZC5uYW1lXG4gICAgICAgICAgdmFsdWU6IChyb3cpLT4gcm93W2ldXG4gICAgICBlbHNlXG4gICAgICAgIGZpZWxkcyA9IEBmaWVsZHMubWFwIChmaWVsZCkgLT4gZmllbGQubmFtZVxuICAgICAgcm93cyA9IEByb3dzLm1hcCAocm93KSAtPlxuICAgICAgICBzaW1wbGVSb3cgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJvdykpXG4gICAgICAgIHNpbXBsZVJvd1xuICAgICAganNvbjJjc3YgZGVsOiBcIlxcdFwiLCBkYXRhOiByb3dzICwgZmllbGRzOiBmaWVsZHMgLCBkZWZhdWx0VmFsdWU6ICcnICwgKGVyciwgY3N2KS0+XG4gICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoY3N2KVxuXG4gIHNhdmVDU1Y6IC0+XG4gICAgaWYgQHJvd3M/ICYmIEBmaWVsZHM/XG4gICAgICBmaWxlcGF0aCA9IGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKClcbiAgICAgIGlmIGZpbGVwYXRoP1xuICAgICAgICBpZiBBcnJheS5pc0FycmF5KEByb3dzWzBdKVxuICAgICAgICAgIGZpZWxkcyA9IEBmaWVsZHMubWFwIChmaWVsZCxpKSAtPlxuICAgICAgICAgICAgbGFiZWw6IGZpZWxkLm5hbWVcbiAgICAgICAgICAgIHZhbHVlOiAocm93KS0+IHJvd1tpXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmllbGRzID0gQGZpZWxkcy5tYXAgKGZpZWxkKSAtPiBmaWVsZC5uYW1lXG4gICAgICAgIHJvd3MgPSBAcm93cy5tYXAgKHJvdykgLT5cbiAgICAgICAgICBzaW1wbGVSb3cgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJvdykpXG4gICAgICAgICAgc2ltcGxlUm93W2ZpZWxkXSA/PSAnJyBmb3IgZmllbGQgaW4gZmllbGRzICNIRVJFXG4gICAgICAgICAgc2ltcGxlUm93XG4gICAgICAgIGpzb24yY3N2ICBkYXRhOiByb3dzICwgZmllbGRzOiBmaWVsZHMgLCBkZWZhdWx0VmFsdWU6ICcnICwgKGVyciwgY3N2KS0+XG4gICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBmcy53cml0ZUZpbGUgZmlsZXBhdGgsIGNzdiwgKGVyciktPlxuICAgICAgICAgICAgICBpZiAoZXJyKSB0aGVuIGNvbnNvbGUubG9nKGVycikgZWxzZSBjb25zb2xlLmxvZygnZmlsZSBzYXZlZCcpXG5cbiAgZWRpdFJlY29yZDogKCR0ZCktPlxuICAgIGlmICR0ZC5jaGlsZHJlbigpLmxlbmd0aCA9PSAwXG4gICAgICAkdGQuYWRkQ2xhc3MoJ2VkaXRpbmcnKVxuICAgICAgZWRpdG9yID0gJChcIjxhdG9tLXRleHQtZWRpdG9yLz5cIikuYXR0cignbWluaScsJ21pbmknKS5hZGRDbGFzcygnZWRpdG9yJylcbiAgICAgIHRleHRFZGl0b3IgPSBlZGl0b3JbMF0uZ2V0TW9kZWwoKVxuICAgICAgdGV4dEVkaXRvci5zZXRUZXh0KCR0ZC50ZXh0KCkpIGlmICEkdGQuaGFzQ2xhc3MoJ251bGwnKVxuICAgICAgJHRkLmh0bWwoZWRpdG9yKVxuICAgICAgZWRpdG9yLndpZHRoKGVkaXRvci53aWR0aCgpKSAjSEFDSyBmb3IgT25lIHRoZW1lXG4gICAgICBlZGl0b3Iua2V5ZG93biAoZSkgLT5cbiAgICAgICAgJCh0aGlzKS5ibHVyKCkgaWYgZS5rZXlDb2RlID09IDEzXG4gICAgICB0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGUpID0+XG4gICAgICAgIGlmIGVkaXRvci53aWR0aCgpID4gQHRhYmxlV3JhcHBlci53aWR0aCgpICNjZW50ZXIgY3Vyc29yIG9uIHNjcmVlblxuICAgICAgICAgIGNoYXJXaWR0aCA9ICB0ZXh0RWRpdG9yLmdldERlZmF1bHRDaGFyV2lkdGgoKVxuICAgICAgICAgIGNvbHVtbiA9IGUubmV3U2NyZWVuUG9zaXRpb24uY29sdW1uXG4gICAgICAgICAgdHJsZWZ0ID0gLTEgKiBlZGl0b3IuY2xvc2VzdCgndHInKS5vZmZzZXQoKS5sZWZ0XG4gICAgICAgICAgdGRsZWZ0ID0gIGVkaXRvci5jbG9zZXN0KCd0ZCcpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgICB3aWR0aCA9IEB0YWJsZVdyYXBwZXIud2lkdGgoKSAvIDJcbiAgICAgICAgICBsZWZ0ID0gdHJsZWZ0ICsgdGRsZWZ0IC0gd2lkdGhcbiAgICAgICAgICBpZiBNYXRoLmFicyhAdGFibGVXcmFwcGVyLnNjcm9sbExlZnQoKSAtIChsZWZ0ICsgY29sdW1uICogY2hhcldpZHRoKSkgPiB3aWR0aFxuICAgICAgICAgICAgQHRhYmxlV3JhcHBlci5zY3JvbGxMZWZ0KGxlZnQgKyBjb2x1bW4gKiBjaGFyV2lkdGgpXG4gICAgICBlZGl0b3IuYmx1ciAoZSkgPT5cbiAgICAgICAgJHRkID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpXG4gICAgICAgICR0ZC5yZW1vdmVDbGFzcygnZWRpdGluZyBzZWxlY3RlZCcpXG4gICAgICAgICR0ciA9ICR0ZC5jbG9zZXN0KCd0cicpXG4gICAgICAgICMkdHIuaGFzQ2xhc3MoJ3N0YXR1cy1yZW1vdmVkJykgcmV0dXJuXG4gICAgICAgICR0ZC5yZW1vdmVDbGFzcygnbnVsbCcpXG4gICAgICAgICR0ZC50ZXh0KGUuY3VycmVudFRhcmdldC5nZXRNb2RlbCgpLmdldFRleHQoKSlcbiAgICAgICAgQGZpeFNpemVzKClcbiAgICAgICAgaWYgJHRyLmhhc0NsYXNzKCdhZGRlZCcpXG4gICAgICAgICAgJHRkLnJlbW92ZUNsYXNzKCdkZWZhdWx0JylcbiAgICAgICAgICAkdGQuYWRkQ2xhc3MoJ3N0YXR1cy1hZGRlZCcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBlLnRhcmdldC5nZXRNb2RlbCgpLmdldFRleHQoKSAhPSAkdGQuYXR0cignZGF0YS1vcmlnaW5hbC12YWx1ZScpXG4gICAgICAgICAgICAkdHIuYWRkQ2xhc3MoJ21vZGlmaWVkJylcbiAgICAgICAgICAgICR0ZC5hZGRDbGFzcygnc3RhdHVzLW1vZGlmaWVkJylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAkdGQucmVtb3ZlQ2xhc3MoJ3N0YXR1cy1tb2RpZmllZCcpXG4gICAgICAgICAgICBpZiAkdHIuZmluZCgndGQuc3RhdHVzLW1vZGlmaWVkJykubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgJHRyLnJlbW92ZUNsYXNzKCdtb2RpZmllZCcpXG4gICAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LnJvd1N0YXR1c0NoYW5nZWQnLFskdHJdKVxuICAgICAgZWRpdG9yLmZvY3VzKClcblxuICBpbnNlcnRSZWNvcmQ6IC0+XG4gICAgJHRkID0gJChcIjx0ZC8+XCIpLnRleHQoQG51bWJlcnMuY2hpbGRyZW4oKS5sZW5ndGggKyAxKVxuICAgICR0ciA9ICQoXCI8dHIvPlwiKS5odG1sKCR0ZClcbiAgICBAbnVtYmVycy5hcHBlbmQoJHRyKVxuICAgICR0ciA9ICQoXCI8dHIvPlwiKVxuICAgICR0ci5hZGRDbGFzcygnYWRkZWQnKVxuICAgIEB0YWJsZS5maW5kKFwidGhcIikuZWFjaCA9PlxuICAgICAgJHRkID0gJChcIjx0ZC8+XCIpXG4gICAgICAkdGQubW91c2Vkb3duIChlKS0+XG4gICAgICAgICQodGhpcykuY2xvc2VzdCgndGFibGUnKS5maW5kKCd0ZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICR0ZC5hZGRDbGFzcygnZGVmYXVsdCcpXG4gICAgICAkdGQuZGJsY2xpY2sgKGUpID0+IEBlZGl0UmVjb3JkKCQoZS5jdXJyZW50VGFyZ2V0KSlcbiAgICAgICR0ci5hcHBlbmQoJHRkKVxuICAgIEB0YWJsZS5maW5kKCd0Ym9keScpLmFwcGVuZCgkdHIpXG4gICAgQHRhYmxlV3JhcHBlci5zY3JvbGxUb3AgLT4gdGhpcy5zY3JvbGxIZWlnaHRcbiAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbJHRyXSlcblxuICBkZWxldGVSZWNvcmQ6IC0+XG4gICAgJHRkID0gQGZpbmQoJ3RkLnNlbGVjdGVkJylcbiAgICBpZiAkdGQubGVuZ3RoID09IDFcbiAgICAgICR0ciA9ICR0ZC5wYXJlbnQoKVxuICAgICAgJHRyLnJlbW92ZUNsYXNzKCdtb2RpZmllZCcpXG4gICAgICAkdHIuZmluZCgndGQnKS5yZW1vdmVDbGFzcygnc3RhdHVzLW1vZGlmaWVkIHNlbGVjdGVkJylcbiAgICAgICR0ci5hZGRDbGFzcygnc3RhdHVzLXJlbW92ZWQgcmVtb3ZlZCcpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbJHRyXSlcblxuICB1bmRvOiAtPlxuICAgICR0ZCA9IEBmaW5kKCd0ZC5zZWxlY3RlZCcpXG4gICAgaWYgJHRkLmxlbmd0aCA9PSAxXG4gICAgICAkdHIgPSAkdGQuY2xvc2VzdCgndHInKVxuICAgICAgaWYgJHRyLmhhc0NsYXNzKCdyZW1vdmVkJylcbiAgICAgICAgJHRyLnJlbW92ZUNsYXNzKCdzdGF0dXMtcmVtb3ZlZCByZW1vdmVkJylcbiAgICAgIGVsc2UgaWYgJHRyLmhhc0NsYXNzKCdhZGRlZCcpXG4gICAgICAgICR0ZC5yZW1vdmVDbGFzcygnbnVsbCcpLmFkZENsYXNzKCdkZWZhdWx0JykudGV4dCgnJylcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgJHRkLmRhdGEoJ29yaWdpbmFsLXZhbHVlLW51bGwnKVxuICAgICAgICAgICR0ZC5hZGRDbGFzcygnbnVsbCcpLnRleHQoJ05VTEwnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdmFsdWUgPSAkdGQuYXR0cignZGF0YS1vcmlnaW5hbC12YWx1ZScpXG4gICAgICAgICAgJHRkLnJlbW92ZUNsYXNzKCdudWxsJykudGV4dCh2YWx1ZSlcbiAgICAgICAgJHRkLnJlbW92ZUNsYXNzKCdzdGF0dXMtbW9kaWZpZWQnKVxuICAgICAgICBpZiAkdHIuZmluZCgndGQuc3RhdHVzLW1vZGlmaWVkJykubGVuZ3RoID09IDBcbiAgICAgICAgICAkdHIucmVtb3ZlQ2xhc3MoJ21vZGlmaWVkJylcbiAgICAgIEB0cmlnZ2VyKCdxdWlja1F1ZXJ5LnJvd1N0YXR1c0NoYW5nZWQnLFskdHJdKVxuXG4gIHNldE51bGw6IC0+XG4gICAgJHRkID0gQGZpbmQoJ3RkLnNlbGVjdGVkJylcbiAgICBpZiAkdGQubGVuZ3RoID09IDEgJiYgISR0ZC5oYXNDbGFzcygnbnVsbCcpXG4gICAgICAkdHIgPSAkdGQuY2xvc2VzdCgndHInKVxuICAgICAgIyR0ci5oYXNDbGFzcygnc3RhdHVzLXJlbW92ZWQnKSByZXR1cm5cbiAgICAgICR0ZC50ZXh0KCdOVUxMJylcbiAgICAgICR0ZC5hZGRDbGFzcygnbnVsbCcpXG4gICAgICBpZiAkdHIuaGFzQ2xhc3MoJ2FkZGVkJylcbiAgICAgICAgJHRkLnJlbW92ZUNsYXNzKCdkZWZhdWx0JylcbiAgICAgICAgJHRkLmFkZENsYXNzKCdzdGF0dXMtYWRkZWQnKVxuICAgICAgZWxzZVxuICAgICAgICAkdHIuYWRkQ2xhc3MoJ21vZGlmaWVkJylcbiAgICAgICAgJHRkLmFkZENsYXNzKCdzdGF0dXMtbW9kaWZpZWQnKVxuICAgICAgJHRkLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICBAdHJpZ2dlcigncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJyxbJHRyXSlcblxuICBhcHBseTogLT5cbiAgICBAdGFibGUuZmluZCgndGJvZHkgdHInKS5lYWNoIChpLHRyKT0+XG4gICAgICB2YWx1ZXMgPSB7fVxuICAgICAgaWYgJCh0cikuaGFzQ2xhc3MoJ21vZGlmaWVkJylcbiAgICAgICAgcm93ID0gQHJvd3NbaV1cbiAgICAgICAgJCh0cikuZmluZCgndGQnKS5lYWNoIChqLHRkKSA9PlxuICAgICAgICAgIGlmICQodGQpLmhhc0NsYXNzKCdzdGF0dXMtbW9kaWZpZWQnKVxuICAgICAgICAgICAgdmFsdWVzW0BmaWVsZHNbal0ubmFtZV0gPSBpZiAkKHRkKS5oYXNDbGFzcygnbnVsbCcpIHRoZW4gbnVsbCBlbHNlICQodGQpLnRleHQoKVxuICAgICAgICBmaWVsZHMgPSBAZmllbGRzLmZpbHRlciAoZmllbGQpIC0+IHZhbHVlcy5oYXNPd25Qcm9wZXJ0eShmaWVsZC5uYW1lKVxuICAgICAgICBAY29ubmVjdGlvbi51cGRhdGVSZWNvcmQocm93LGZpZWxkcyx2YWx1ZXMpXG4gICAgICBlbHNlIGlmICQodHIpLmhhc0NsYXNzKCdhZGRlZCcpXG4gICAgICAgICQodHIpLmZpbmQoJ3RkJykuZWFjaCAoaix0ZCkgPT5cbiAgICAgICAgICB1bmxlc3MgJCh0ZCkuaGFzQ2xhc3MoJ2RlZmF1bHQnKVxuICAgICAgICAgICAgdmFsdWVzW0BmaWVsZHNbal0ubmFtZV0gPSBpZiAkKHRkKS5oYXNDbGFzcygnbnVsbCcpIHRoZW4gbnVsbCBlbHNlICQodGQpLnRleHQoKVxuICAgICAgICBmaWVsZHMgPSBAZmllbGRzLmZpbHRlciAoZmllbGQpIC0+IHZhbHVlcy5oYXNPd25Qcm9wZXJ0eShmaWVsZC5uYW1lKVxuICAgICAgICBAY29ubmVjdGlvbi5pbnNlcnRSZWNvcmQoZmllbGRzLHZhbHVlcylcbiAgICAgIGVsc2UgaWYgJCh0cikuaGFzQ2xhc3MoJ3N0YXR1cy1yZW1vdmVkJylcbiAgICAgICAgcm93ID0gQHJvd3NbaV1cbiAgICAgICAgQGNvbm5lY3Rpb24uZGVsZXRlUmVjb3JkKHJvdyxAZmllbGRzKVxuXG4gIGhpZGRlblJlc3VsdHM6IC0+XG4gICAgQGtlZXBIaWRkZW5cblxuICBzaG93UmVzdWx0czogLT5cbiAgICBAa2VlcEhpZGRlbiA9IGZhbHNlXG5cbiAgaGlkZVJlc3VsdHM6IC0+XG4gICAgQGtlZXBIaWRkZW4gPSB0cnVlXG5cbiAgZml4U2l6ZXM6IC0+XG4gICAgaWYgQHRhYmxlLmZpbmQoJ3Rib2R5IHRyJykubGVuZ3RoID4gMFxuICAgICAgdGRzID0gQHRhYmxlLmZpbmQoJ3Rib2R5IHRyOmZpcnN0JykuY2hpbGRyZW4oKVxuICAgICAgQHRhYmxlLmZpbmQoJ3RoZWFkIHRyJykuY2hpbGRyZW4oKS5lYWNoIChpLCB0aCkgPT5cbiAgICAgICAgdGQgPSB0ZHNbaV1cbiAgICAgICAgdGh3ID0gJCh0aCkub3V0ZXJXaWR0aCgpXG4gICAgICAgIHRkdyA9ICQodGQpLm91dGVyV2lkdGgoKVxuICAgICAgICB3ID0gTWF0aC5tYXgodGR3LHRodylcbiAgICAgICAgJCh0ZCkuY3NzKCdtaW4td2lkdGgnLHcrXCJweFwiKVxuICAgICAgICAkKHRoKS5jc3MoJ21pbi13aWR0aCcsdytcInB4XCIpXG4gICAgICBAZml4U2Nyb2xscygpXG4gICAgZWxzZVxuICAgICAgQHRhYmxlLndpZHRoKEB0YWJsZS5maW5kKCd0aGVhZCcpLndpZHRoKCkpXG5cbiAgZml4U2Nyb2xsczogLT5cbiAgICBoZWFkZXJIZWdodCA9IEB0YWJsZS5maW5kKCd0aGVhZCcpLm91dGVySGVpZ2h0KClcbiAgICBudW1iZXJzV2lkdGggPSBAbnVtYmVycy53aWR0aCgpXG4gICAgQHRhYmxlV3JhcHBlci5jc3MgJ21hcmdpbi1sZWZ0JzogbnVtYmVyc1dpZHRoICwgJ21hcmdpbi10b3AnOiAoaGVhZGVySGVnaHQgLSAxKVxuICAgIEB0YWJsZVdyYXBwZXIuaGVpZ2h0KCBAaGVpZ2h0KCkgLSBoZWFkZXJIZWdodCAtIDEpXG4gICAgc2Nyb2xsID0gaGVhZGVySGVnaHQgIC0gQHRhYmxlV3JhcHBlci5zY3JvbGxUb3AoKVxuICAgIEBudW1iZXJzLmNzcyAnbWFyZ2luLXRvcCc6IHNjcm9sbFxuICAgIHNjcm9sbCA9IC0xICogQHRhYmxlV3JhcHBlci5zY3JvbGxMZWZ0KClcbiAgICBAdGFibGUuZmluZCgndGhlYWQnKS5jc3MgJ21hcmdpbi1sZWZ0Jzogc2Nyb2xsXG5cbiAgZml4TnVtYmVyczogLT4gICN1Z2x5IEhBQ0tcbiAgICBAdGFibGUuaGVpZ2h0KEB0YWJsZS5oZWlnaHQoKSsxKVxuICAgIEB0YWJsZS5oZWlnaHQoQHRhYmxlLmhlaWdodCgpLTEpXG5cbiAgb25Sb3dTdGF0dXNDaGFuZ2VkOiAoY2FsbGJhY2spLT5cbiAgICBAYmluZCAncXVpY2tRdWVyeS5yb3dTdGF0dXNDaGFuZ2VkJywgKGUscm93KS0+IGNhbGxiYWNrKHJvdylcblxuICBoYW5kbGVSZXNpemVFdmVudHM6IC0+XG4gICAgQG9uICdtb3VzZWRvd24nLCAnLnF1aWNrLXF1ZXJ5LXJlc3VsdC1yZXNpemUtaGFuZGxlcicsIChlKSA9PiBAcmVzaXplU3RhcnRlZChlKVxuICByZXNpemVTdGFydGVkOiAtPlxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAcmVzaXplUmVzdWx0VmlldylcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICByZXNpemVTdG9wcGVkOiAtPlxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVJlc3VsdFZpZXcpXG4gICAgJChkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gIHJlc2l6ZVJlc3VsdFZpZXc6ICh7cGFnZVksIHdoaWNofSkgPT5cbiAgICByZXR1cm4gQHJlc2l6ZVN0b3BwZWQoKSB1bmxlc3Mgd2hpY2ggaXMgMVxuICAgIGhlaWdodCA9IEBvdXRlckhlaWdodCgpICsgQG9mZnNldCgpLnRvcCAtIHBhZ2VZXG4gICAgQGhlaWdodChoZWlnaHQpXG4gICAgQGZpeFNjcm9sbHMoKVxuIl19
