(function() {
  var $, QuickQueryEditorView, SelectDataType, SelectListView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, SelectListView = ref.SelectListView, $ = ref.$;

  SelectDataType = (function(superClass) {
    extend(SelectDataType, superClass);

    function SelectDataType() {
      return SelectDataType.__super__.constructor.apply(this, arguments);
    }

    SelectDataType.prototype.initialize = function() {
      SelectDataType.__super__.initialize.apply(this, arguments);
      this.list.hide();
      this.filterEditorView.focus((function(_this) {
        return function(e) {
          return _this.list.show();
        };
      })(this));
      return this.filterEditorView.blur((function(_this) {
        return function(e) {
          return _this.list.hide();
        };
      })(this));
    };

    SelectDataType.prototype.viewForItem = function(item) {
      return "<li> " + item + " </li>";
    };

    SelectDataType.prototype.confirmed = function(item) {
      this.filterEditorView.getModel().setText(item);
      return this.list.hide();
    };

    SelectDataType.prototype.setError = function(message) {
      if (message == null) {
        message = '';
      }
    };

    SelectDataType.prototype.cancel = function() {};

    return SelectDataType;

  })(SelectListView);

  module.exports = QuickQueryEditorView = (function(superClass) {
    extend(QuickQueryEditorView, superClass);

    QuickQueryEditorView.prototype.editor = null;

    QuickQueryEditorView.prototype.action = null;

    QuickQueryEditorView.prototype.model = null;

    QuickQueryEditorView.prototype.model_type = null;

    function QuickQueryEditorView(action, model) {
      this.action = action;
      this.model = model;
      if (this.action === 'create') {
        this.model_type = this.model.child_type;
      } else {
        this.model_type = this.model.type;
      }
      QuickQueryEditorView.__super__.constructor.apply(this, arguments);
    }

    QuickQueryEditorView.prototype.initialize = function() {
      var connection;
      connection = this.model.type === 'connection' ? this.model : this.model.connection;
      this.selectDataType.setItems(connection.getDataTypes());
      this.nameEditor = this.find('#quick-query-editor-name')[0].getModel();
      this.datatypeEditor = this.selectDataType.filterEditorView.getModel();
      this.defaultValueEditor = this.find('#quick-query-default')[0].getModel();
      this.find('#quick-query-nullable').click(function(e) {
        $(this).toggleClass('selected');
        return $(this).html($(this).hasClass('selected') ? 'YES' : 'NO');
      });
      this.find('#quick-query-null').change((function(_this) {
        return function(e) {
          var $null;
          $null = $(e.currentTarget);
          if ($null.is(':checked')) {
            _this.find('#quick-query-default').addClass('hide');
            return _this.find('#quick-query-default-is-null').removeClass('hide');
          } else {
            _this.find('#quick-query-default').removeClass('hide');
            return _this.find('#quick-query-default-is-null').addClass('hide');
          }
        };
      })(this));
      this.find('#quick-query-editor-done, #quick-query-nullable').keydown(function(e) {
        if (e.keyCode === 13) {
          return $(this).click();
        }
      });
      this.find('#quick-query-editor-done').click((function(_this) {
        return function(e) {
          _this.openTextEditor();
          return _this.closest('atom-panel.modal').hide();
        };
      })(this));
      if (this.action !== 'create') {
        this.nameEditor.insertText(this.model.name);
      }
      if (this.model_type === 'column') {
        this.find('.quick-query-column-editor').removeClass('hide');
      }
      if (this.model_type === 'column' && this.action === 'alter') {
        this.datatypeEditor.setText(this.model.datatype);
        this.defaultValueEditor.setText(this.model["default"] || "");
        this.find('#quick-query-null').prop('checked', this.model["default"] == null).change();
        if (this.model.nullable) {
          return this.find('#quick-query-nullable').click();
        }
      }
    };

    QuickQueryEditorView.content = function() {
      return this.div({
        "class": 'quick-query-editor'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'row'
          }, function() {
            return _this.div({
              "class": 'col-sm-12'
            }, function() {
              _this.label('name');
              return _this.currentBuilder.tag('atom-text-editor', {
                id: 'quick-query-editor-name',
                "class": 'editor',
                mini: 'mini'
              });
            });
          });
          _this.div({
            "class": 'row quick-query-column-editor hide'
          }, function() {
            _this.div({
              "class": 'col-sm-6'
            }, function() {
              _this.label('type');
              return _this.subview('selectDataType', new SelectDataType());
            });
            _this.div({
              "class": 'col-sm-2'
            }, function() {
              _this.label('nullable');
              return _this.button({
                id: 'quick-query-nullable',
                "class": 'btn'
              }, 'NO');
            });
            _this.div({
              "class": 'col-sm-3'
            }, function() {
              _this.label('default');
              _this.currentBuilder.tag('atom-text-editor', {
                id: 'quick-query-default',
                "class": 'editor',
                mini: 'mini'
              });
              return _this.div({
                id: 'quick-query-default-is-null',
                "class": 'hide'
              }, "Null");
            });
            return _this.div({
              "class": 'col-sm-1'
            }, function() {
              return _this.input({
                id: 'quick-query-null',
                type: 'checkbox',
                style: "margin-top:24px;"
              });
            });
          });
          return _this.div({
            "class": 'row'
          }, function() {
            return _this.div({
              "class": 'col-sm-12'
            }, function() {
              return _this.button('Done', {
                id: 'quick-query-editor-done',
                "class": 'btn btn-default icon icon-check'
              });
            });
          });
        };
      })(this));
    };

    QuickQueryEditorView.prototype.openTextEditor = function() {
      var comment, editText;
      comment = "-- Check the sentence before execute it\n" + "-- This editor will close after you run the sentence \n";
      editText = (function() {
        switch (this.action) {
          case 'create':
            return this.getCreateText();
          case 'alter':
            return this.getAlterText();
          case 'drop':
            return this.getDropText();
        }
      }).call(this);
      if (editText !== '') {
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
            editor.insertText(comment + editText);
            return _this.editor = editor;
          };
        })(this));
      }
    };

    QuickQueryEditorView.prototype.getCreateText = function() {
      var datatype, defaultValue, info, newName, nullable;
      newName = this.nameEditor.getText();
      switch (this.model_type) {
        case 'database':
          info = {
            name: newName
          };
          return this.model.createDatabase(this.model, info);
        case 'table':
          info = {
            name: newName
          };
          return this.model.connection.createTable(this.model, info);
        case 'schema':
          info = {
            name: newName
          };
          return this.model.connection.createSchema(this.model, info);
        case 'column':
          datatype = this.datatypeEditor.getText();
          nullable = this.find('#quick-query-nullable').hasClass('selected');
          defaultValue = this.find('#quick-query-null').is(':checked') ? null : this.defaultValueEditor.getText();
          info = {
            name: newName,
            datatype: datatype,
            nullable: nullable,
            "default": defaultValue
          };
          return this.model.connection.createColumn(this.model, info);
      }
    };

    QuickQueryEditorView.prototype.getAlterText = function() {
      var datatype, defaultValue, delta, newName, nullable;
      newName = this.nameEditor.getText();
      switch (this.model_type) {
        case 'table':
          delta = {
            old_name: this.model.name,
            new_name: newName
          };
          return this.model.connection.alterTable(this.model, delta);
        case 'column':
          datatype = this.datatypeEditor.getText();
          nullable = this.find('#quick-query-nullable').hasClass('selected');
          defaultValue = this.find('#quick-query-null').is(':checked') ? null : this.defaultValueEditor.getText();
          delta = {
            old_name: this.model.name,
            new_name: newName,
            datatype: datatype,
            nullable: nullable,
            "default": defaultValue
          };
          return this.model.connection.alterColumn(this.model, delta);
      }
    };

    QuickQueryEditorView.prototype.getDropText = function() {
      switch (this.model_type) {
        case 'database':
          return this.model.connection.dropDatabase(this.model);
        case 'schema':
          return this.model.connection.dropSchema(this.model);
        case 'table':
          return this.model.connection.dropTable(this.model);
        case 'column':
          return this.model.connection.dropColumn(this.model);
      }
    };

    QuickQueryEditorView.prototype.getColumnInfo = function() {};

    QuickQueryEditorView.prototype.focusFirst = function() {
      return setTimeout(((function(_this) {
        return function() {
          return _this.find('#quick-query-editor-name').focus();
        };
      })(this)), 10);
    };

    return QuickQueryEditorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvcXVpY2stcXVlcnkvbGliL3F1aWNrLXF1ZXJ5LWVkaXRvci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0VBQUE7SUFBQTs7O0VBQUEsTUFBOEIsT0FBQSxDQUFRLHNCQUFSLENBQTlCLEVBQUMsZUFBRCxFQUFPLG1DQUFQLEVBQXlCOztFQUduQjs7Ozs7Ozs2QkFDSixVQUFBLEdBQVksU0FBQTtNQUNWLGdEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQTtNQUNBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxLQUFsQixDQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFDdEIsS0FBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUE7UUFEc0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO2FBRUEsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUNyQixLQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQTtRQURxQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7SUFMVTs7NkJBT1osV0FBQSxHQUFhLFNBQUMsSUFBRDthQUNWLE9BQUEsR0FBUSxJQUFSLEdBQWE7SUFESDs7NkJBRWIsU0FBQSxHQUFXLFNBQUMsSUFBRDtNQUNULElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxRQUFsQixDQUFBLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsSUFBckM7YUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBQTtJQUZTOzs2QkFHWCxRQUFBLEdBQVUsU0FBQyxPQUFEOztRQUFDLFVBQVE7O0lBQVQ7OzZCQUVWLE1BQUEsR0FBUSxTQUFBLEdBQUE7Ozs7S0FmbUI7O0VB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dyAgLCAkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5cbmNsYXNzIFNlbGVjdERhdGFUeXBlIGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBsaXN0LmhpZGUoKVxuICAgIEBmaWx0ZXJFZGl0b3JWaWV3LmZvY3VzIChlKT0+XG4gICAgICBAbGlzdC5zaG93KClcbiAgICBAZmlsdGVyRWRpdG9yVmlldy5ibHVyIChlKT0+XG4gICAgICBAbGlzdC5oaWRlKClcbiAgdmlld0Zvckl0ZW06IChpdGVtKSAtPlxuICAgICBcIjxsaT4gI3tpdGVtfSA8L2xpPlwiXG4gIGNvbmZpcm1lZDogKGl0ZW0pIC0+XG4gICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5zZXRUZXh0KGl0ZW0pXG4gICAgQGxpc3QuaGlkZSgpXG4gIHNldEVycm9yOiAobWVzc2FnZT0nJykgLT5cbiAgICAjZG8gbm90aGluZ1xuICBjYW5jZWw6IC0+XG4gICAgI2RvIG5vdGhpbmdcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFF1aWNrUXVlcnlFZGl0b3JWaWV3IGV4dGVuZHMgVmlld1xuXG4gIGVkaXRvcjogbnVsbFxuICBhY3Rpb246IG51bGxcbiAgbW9kZWw6IG51bGxcbiAgbW9kZWxfdHlwZTogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGFjdGlvbixAbW9kZWwpIC0+XG4gICAgaWYgQGFjdGlvbiA9PSAnY3JlYXRlJ1xuICAgICAgQG1vZGVsX3R5cGUgPSBAbW9kZWwuY2hpbGRfdHlwZVxuICAgIGVsc2VcbiAgICAgIEBtb2RlbF90eXBlID0gQG1vZGVsLnR5cGVcbiAgICBzdXBlclxuXG4gIGluaXRpYWxpemU6IC0+XG5cbiAgICBjb25uZWN0aW9uID0gaWYgQG1vZGVsLnR5cGUgPT0gJ2Nvbm5lY3Rpb24nIHRoZW4gQG1vZGVsIGVsc2UgQG1vZGVsLmNvbm5lY3Rpb25cbiAgICBAc2VsZWN0RGF0YVR5cGUuc2V0SXRlbXMoY29ubmVjdGlvbi5nZXREYXRhVHlwZXMoKSlcblxuICAgIEBuYW1lRWRpdG9yID0gQGZpbmQoJyNxdWljay1xdWVyeS1lZGl0b3ItbmFtZScpWzBdLmdldE1vZGVsKClcbiAgICAjIEBkYXRhdHlwZUVkaXRvciA9IEBmaW5kKCcjcXVpY2stcXVlcnktZGF0YXR5cGUnKVswXS5nZXRNb2RlbCgpXG4gICAgQGRhdGF0eXBlRWRpdG9yID0gQHNlbGVjdERhdGFUeXBlLmZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKTtcbiAgICBAZGVmYXVsdFZhbHVlRWRpdG9yID0gQGZpbmQoJyNxdWljay1xdWVyeS1kZWZhdWx0JylbMF0uZ2V0TW9kZWwoKVxuXG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1udWxsYWJsZScpLmNsaWNrIChlKSAtPlxuICAgICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgICAkKHRoaXMpLmh0bWwoaWYgJCh0aGlzKS5oYXNDbGFzcygnc2VsZWN0ZWQnKSB0aGVuICdZRVMnIGVsc2UgJ05PJylcblxuICAgIEBmaW5kKCcjcXVpY2stcXVlcnktbnVsbCcpLmNoYW5nZSAoZSkgPT5cbiAgICAgICRudWxsID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICBpZiAkbnVsbC5pcygnOmNoZWNrZWQnKVxuICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWRlZmF1bHQnKS5hZGRDbGFzcygnaGlkZScpXG4gICAgICAgIEBmaW5kKCcjcXVpY2stcXVlcnktZGVmYXVsdC1pcy1udWxsJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKVxuICAgICAgZWxzZVxuICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWRlZmF1bHQnKS5yZW1vdmVDbGFzcygnaGlkZScpXG4gICAgICAgIEBmaW5kKCcjcXVpY2stcXVlcnktZGVmYXVsdC1pcy1udWxsJykuYWRkQ2xhc3MoJ2hpZGUnKVxuXG4gICAgQGZpbmQoJyNxdWljay1xdWVyeS1lZGl0b3ItZG9uZSwgI3F1aWNrLXF1ZXJ5LW51bGxhYmxlJykua2V5ZG93biAoZSkgLT5cbiAgICAgICQodGhpcykuY2xpY2soKSBpZiBlLmtleUNvZGUgPT0gMTNcbiAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LWVkaXRvci1kb25lJykuY2xpY2sgKGUpID0+XG4gICAgICBAb3BlblRleHRFZGl0b3IoKVxuICAgICAgQGNsb3Nlc3QoJ2F0b20tcGFuZWwubW9kYWwnKS5oaWRlKClcblxuICAgIGlmIEBhY3Rpb24gIT0gJ2NyZWF0ZSdcbiAgICAgIEBuYW1lRWRpdG9yLmluc2VydFRleHQoQG1vZGVsLm5hbWUpXG5cbiAgICBpZiBAbW9kZWxfdHlwZSA9PSAnY29sdW1uJ1xuICAgICAgQGZpbmQoJy5xdWljay1xdWVyeS1jb2x1bW4tZWRpdG9yJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKVxuICAgIGlmIEBtb2RlbF90eXBlID09ICdjb2x1bW4nICYmIEBhY3Rpb24gPT0gJ2FsdGVyJ1xuICAgICAgQGRhdGF0eXBlRWRpdG9yLnNldFRleHQoQG1vZGVsLmRhdGF0eXBlKVxuICAgICAgQGRlZmF1bHRWYWx1ZUVkaXRvci5zZXRUZXh0KEBtb2RlbC5kZWZhdWx0IHx8IFwiXCIpXG4gICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LW51bGwnKS5wcm9wKCdjaGVja2VkJywgIUBtb2RlbC5kZWZhdWx0PykuY2hhbmdlKClcbiAgICAgIGlmIEBtb2RlbC5udWxsYWJsZVxuICAgICAgICBAZmluZCgnI3F1aWNrLXF1ZXJ5LW51bGxhYmxlJykuY2xpY2soKVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdxdWljay1xdWVyeS1lZGl0b3InICwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdyb3cnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnY29sLXNtLTEyJyAsID0+XG4gICAgICAgICAgQGxhYmVsICduYW1lJ1xuICAgICAgICAgIEBjdXJyZW50QnVpbGRlci50YWcgJ2F0b20tdGV4dC1lZGl0b3InLCBpZDogJ3F1aWNrLXF1ZXJ5LWVkaXRvci1uYW1lJyAsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknXG4gICAgICBAZGl2IGNsYXNzOiAncm93IHF1aWNrLXF1ZXJ5LWNvbHVtbi1lZGl0b3IgaGlkZScsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tNicgLCA9PlxuICAgICAgICAgIEBsYWJlbCAndHlwZSdcbiAgICAgICAgICAjIEBjdXJyZW50QnVpbGRlci50YWcgJ2F0b20tdGV4dC1lZGl0b3InLCBpZDogJ3F1aWNrLXF1ZXJ5LWRhdGF0eXBlJyAsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknXG4gICAgICAgICAgQHN1YnZpZXcgJ3NlbGVjdERhdGFUeXBlJywgbmV3IFNlbGVjdERhdGFUeXBlKClcbiAgICAgICAgQGRpdiBjbGFzczogJ2NvbC1zbS0yJyAsID0+XG4gICAgICAgICAgQGxhYmVsICdudWxsYWJsZSdcbiAgICAgICAgICBAYnV0dG9uIGlkOidxdWljay1xdWVyeS1udWxsYWJsZScsY2xhc3M6ICdidG4nICwnTk8nXG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tMycgLCA9PlxuICAgICAgICAgIEBsYWJlbCAnZGVmYXVsdCdcbiAgICAgICAgICBAY3VycmVudEJ1aWxkZXIudGFnICdhdG9tLXRleHQtZWRpdG9yJywgaWQ6ICdxdWljay1xdWVyeS1kZWZhdWx0JyAsIGNsYXNzOiAnZWRpdG9yJywgbWluaTogJ21pbmknXG4gICAgICAgICAgQGRpdiBpZDogJ3F1aWNrLXF1ZXJ5LWRlZmF1bHQtaXMtbnVsbCcgLGNsYXNzOidoaWRlJyAsIFwiTnVsbFwiXG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tMScgLCA9PlxuICAgICAgICAgIEBpbnB1dCAgaWQ6ICdxdWljay1xdWVyeS1udWxsJywgdHlwZTogJ2NoZWNrYm94JyAsIHN0eWxlOiBcIm1hcmdpbi10b3A6MjRweDtcIlxuICAgICAgQGRpdiBjbGFzczogJ3JvdycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjb2wtc20tMTInLCA9PlxuICAgICAgICAgIEBidXR0b24gJ0RvbmUnLCBpZDogJ3F1aWNrLXF1ZXJ5LWVkaXRvci1kb25lJyAsIGNsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi1jaGVjaydcblxuXG4gIG9wZW5UZXh0RWRpdG9yOiAoKS0+XG4gICAgY29tbWVudCAgPSBcIi0tIENoZWNrIHRoZSBzZW50ZW5jZSBiZWZvcmUgZXhlY3V0ZSBpdFxcblwiK1xuICAgICAgICAgICAgICAgXCItLSBUaGlzIGVkaXRvciB3aWxsIGNsb3NlIGFmdGVyIHlvdSBydW4gdGhlIHNlbnRlbmNlIFxcblwiXG4gICAgZWRpdFRleHQgPSBzd2l0Y2ggQGFjdGlvblxuICAgICAgd2hlbiAnY3JlYXRlJ1xuICAgICAgICBAZ2V0Q3JlYXRlVGV4dCgpXG4gICAgICB3aGVuICdhbHRlcidcbiAgICAgICAgQGdldEFsdGVyVGV4dCgpXG4gICAgICB3aGVuICdkcm9wJ1xuICAgICAgICBAZ2V0RHJvcFRleHQoKVxuICAgIGlmIGVkaXRUZXh0ICE9ICcnXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZWRpdG9yKSA9PlxuICAgICAgICBncmFtbWFycyA9IGF0b20uZ3JhbW1hcnMuZ2V0R3JhbW1hcnMoKVxuICAgICAgICBncmFtbWFyID0gKGkgZm9yIGkgaW4gZ3JhbW1hcnMgd2hlbiBpLm5hbWUgaXMgJ1NRTCcpWzBdXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGNvbW1lbnQrZWRpdFRleHQpXG4gICAgICAgIEBlZGl0b3IgPSBlZGl0b3JcblxuICBnZXRDcmVhdGVUZXh0OiAoKS0+XG4gICAgbmV3TmFtZT0gQG5hbWVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgc3dpdGNoIEBtb2RlbF90eXBlXG4gICAgICB3aGVuICdkYXRhYmFzZSdcbiAgICAgICAgaW5mbyA9IHtuYW1lOiBuZXdOYW1lIH1cbiAgICAgICAgQG1vZGVsLmNyZWF0ZURhdGFiYXNlKEBtb2RlbCxpbmZvKVxuICAgICAgd2hlbiAndGFibGUnXG4gICAgICAgIGluZm8gPSB7bmFtZTogbmV3TmFtZSB9XG4gICAgICAgIEBtb2RlbC5jb25uZWN0aW9uLmNyZWF0ZVRhYmxlKEBtb2RlbCxpbmZvKVxuICAgICAgd2hlbiAnc2NoZW1hJ1xuICAgICAgICBpbmZvID0ge25hbWU6IG5ld05hbWUgfVxuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5jcmVhdGVTY2hlbWEoQG1vZGVsLGluZm8pXG4gICAgICB3aGVuICdjb2x1bW4nXG4gICAgICAgIGRhdGF0eXBlID0gQGRhdGF0eXBlRWRpdG9yLmdldFRleHQoKVxuICAgICAgICBudWxsYWJsZSA9IEBmaW5kKCcjcXVpY2stcXVlcnktbnVsbGFibGUnKS5oYXNDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBpZiBAZmluZCgnI3F1aWNrLXF1ZXJ5LW51bGwnKS5pcygnOmNoZWNrZWQnKVxuICAgICAgICAgIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkZWZhdWx0VmFsdWVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGluZm8gPVxuICAgICAgICAgIG5hbWU6IG5ld05hbWUgLFxuICAgICAgICAgIGRhdGF0eXBlOiBkYXRhdHlwZSAsXG4gICAgICAgICAgbnVsbGFibGU6IG51bGxhYmxlLFxuICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZVxuICAgICAgICBAbW9kZWwuY29ubmVjdGlvbi5jcmVhdGVDb2x1bW4oQG1vZGVsLGluZm8pXG5cbiAgZ2V0QWx0ZXJUZXh0OiAoKS0+XG4gICAgbmV3TmFtZT0gQG5hbWVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgc3dpdGNoIEBtb2RlbF90eXBlXG4gICAgICB3aGVuICd0YWJsZSdcbiAgICAgICAgZGVsdGEgPSB7IG9sZF9uYW1lOiBAbW9kZWwubmFtZSAsIG5ld19uYW1lOiBuZXdOYW1lIH1cbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uYWx0ZXJUYWJsZShAbW9kZWwsZGVsdGEpXG4gICAgICB3aGVuICdjb2x1bW4nXG4gICAgICAgIGRhdGF0eXBlID0gQGRhdGF0eXBlRWRpdG9yLmdldFRleHQoKVxuICAgICAgICBudWxsYWJsZSA9IEBmaW5kKCcjcXVpY2stcXVlcnktbnVsbGFibGUnKS5oYXNDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBpZiBAZmluZCgnI3F1aWNrLXF1ZXJ5LW51bGwnKS5pcygnOmNoZWNrZWQnKVxuICAgICAgICAgIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkZWZhdWx0VmFsdWVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGRlbHRhID1cbiAgICAgICAgICBvbGRfbmFtZTogQG1vZGVsLm5hbWUgLFxuICAgICAgICAgIG5ld19uYW1lOiBuZXdOYW1lICxcbiAgICAgICAgICBkYXRhdHlwZTogZGF0YXR5cGUgLFxuICAgICAgICAgIG51bGxhYmxlOiBudWxsYWJsZSxcbiAgICAgICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWVcbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uYWx0ZXJDb2x1bW4oQG1vZGVsLGRlbHRhKVxuXG4gIGdldERyb3BUZXh0OiAoKS0+XG4gICAgc3dpdGNoIEBtb2RlbF90eXBlXG4gICAgICB3aGVuICdkYXRhYmFzZSdcbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uZHJvcERhdGFiYXNlKEBtb2RlbClcbiAgICAgIHdoZW4gJ3NjaGVtYSdcbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uZHJvcFNjaGVtYShAbW9kZWwpXG4gICAgICB3aGVuICd0YWJsZSdcbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uZHJvcFRhYmxlKEBtb2RlbClcbiAgICAgIHdoZW4gJ2NvbHVtbidcbiAgICAgICAgQG1vZGVsLmNvbm5lY3Rpb24uZHJvcENvbHVtbihAbW9kZWwpXG5cbiAgZ2V0Q29sdW1uSW5mbzogLT5cblxuICBmb2N1c0ZpcnN0OiAtPlxuICAgIHNldFRpbWVvdXQoKD0+IEBmaW5kKCcjcXVpY2stcXVlcnktZWRpdG9yLW5hbWUnKS5mb2N1cygpKSAsMTApXG4iXX0=
