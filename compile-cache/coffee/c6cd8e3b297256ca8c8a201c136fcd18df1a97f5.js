(function() {
  var Aligner, alignLines, alignLinesMultiple;

  Aligner = require('./aligner');

  module.exports = {
    config: {
      alignmentSpaceChars: {
        type: 'array',
        "default": ['=>', ':=', '='],
        items: {
          type: "string"
        },
        description: "insert space in front of the character (a=1 > a =1)",
        order: 2
      },
      alignBy: {
        type: 'array',
        "default": ['=>', ':=', ':', '='],
        items: {
          type: "string"
        },
        description: "consider the order, the left most matching value is taken to compute the alignment",
        order: 1
      },
      addSpacePostfix: {
        type: 'boolean',
        "default": false,
        description: "insert space after the matching character (a=1 > a= 1) if character is part of the 'alignment space chars'",
        order: 3
      }
    },
    activate: function(state) {
      return atom.commands.add('atom-workspace', {
        'atom-alignment:align': function() {
          var editor;
          editor = atom.workspace.getActivePaneItem();
          return alignLines(editor);
        },
        'atom-alignment:alignMultiple': function() {
          var editor;
          editor = atom.workspace.getActivePaneItem();
          return alignLinesMultiple(editor);
        }
      });
    }
  };

  alignLines = function(editor) {
    var a, addSpacePostfix, matcher, spaceChars;
    spaceChars = atom.config.get('atom-alignment.alignmentSpaceChars');
    matcher = atom.config.get('atom-alignment.alignBy');
    addSpacePostfix = atom.config.get('atom-alignment.addSpacePostfix');
    a = new Aligner(editor, spaceChars, matcher, addSpacePostfix);
    a.align(false);
  };

  alignLinesMultiple = function(editor) {
    var a, addSpacePostfix, matcher, spaceChars;
    spaceChars = atom.config.get('atom-alignment.alignmentSpaceChars');
    matcher = atom.config.get('atom-alignment.alignBy');
    addSpacePostfix = atom.config.get('atom-alignment.addSpacePostfix');
    a = new Aligner(editor, spaceChars, matcher, addSpacePostfix);
    a.align(true);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL2F0b20tYWxpZ25tZW50L2xpYi9hdG9tLWFsaWdubWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsTUFBQSxFQUNJO01BQUEsbUJBQUEsRUFDSTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsR0FBYixDQURUO1FBRUEsS0FBQSxFQUNJO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FISjtRQUlBLFdBQUEsRUFBYSxxREFKYjtRQUtBLEtBQUEsRUFBTyxDQUxQO09BREo7TUFPQSxPQUFBLEVBQ0k7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEdBQWIsRUFBa0IsR0FBbEIsQ0FEVDtRQUVBLEtBQUEsRUFDSTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEo7UUFJQSxXQUFBLEVBQWEsb0ZBSmI7UUFLQSxLQUFBLEVBQU8sQ0FMUDtPQVJKO01BY0EsZUFBQSxFQUNJO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNEdBRmI7UUFHQSxLQUFBLEVBQU8sQ0FIUDtPQWZKO0tBREo7SUFxQkEsUUFBQSxFQUFVLFNBQUMsS0FBRDthQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDSTtRQUFBLHNCQUFBLEVBQXdCLFNBQUE7QUFDcEIsY0FBQTtVQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUE7aUJBQ1QsVUFBQSxDQUFXLE1BQVg7UUFGb0IsQ0FBeEI7UUFJQSw4QkFBQSxFQUFnQyxTQUFBO0FBQzVCLGNBQUE7VUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBO2lCQUNULGtCQUFBLENBQW1CLE1BQW5CO1FBRjRCLENBSmhDO09BREo7SUFETSxDQXJCVjs7O0VBK0JKLFVBQUEsR0FBYSxTQUFDLE1BQUQ7QUFDVCxRQUFBO0lBQUEsVUFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCO0lBQ25CLE9BQUEsR0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQjtJQUNuQixlQUFBLEdBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEI7SUFDbkIsQ0FBQSxHQUFRLElBQUEsT0FBQSxDQUFRLE1BQVIsRUFBZ0IsVUFBaEIsRUFBNEIsT0FBNUIsRUFBcUMsZUFBckM7SUFDUixDQUFDLENBQUMsS0FBRixDQUFRLEtBQVI7RUFMUzs7RUFRYixrQkFBQSxHQUFxQixTQUFDLE1BQUQ7QUFDakIsUUFBQTtJQUFBLFVBQUEsR0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQjtJQUNuQixPQUFBLEdBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEI7SUFDbkIsZUFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCO0lBQ25CLENBQUEsR0FBUSxJQUFBLE9BQUEsQ0FBUSxNQUFSLEVBQWdCLFVBQWhCLEVBQTRCLE9BQTVCLEVBQXFDLGVBQXJDO0lBQ1IsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFSO0VBTGlCO0FBMUNyQiIsInNvdXJjZXNDb250ZW50IjpbIkFsaWduZXIgPSByZXF1aXJlICcuL2FsaWduZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBjb25maWc6XG4gICAgICAgIGFsaWdubWVudFNwYWNlQ2hhcnM6XG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknXG4gICAgICAgICAgICBkZWZhdWx0OiBbJz0+JywgJzo9JywgJz0nXVxuICAgICAgICAgICAgaXRlbXM6XG4gICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiaW5zZXJ0IHNwYWNlIGluIGZyb250IG9mIHRoZSBjaGFyYWN0ZXIgKGE9MSA+IGEgPTEpXCJcbiAgICAgICAgICAgIG9yZGVyOiAyXG4gICAgICAgIGFsaWduQnk6XG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknXG4gICAgICAgICAgICBkZWZhdWx0OiBbJz0+JywgJzo9JywgJzonLCAnPSddXG4gICAgICAgICAgICBpdGVtczpcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJjb25zaWRlciB0aGUgb3JkZXIsIHRoZSBsZWZ0IG1vc3QgbWF0Y2hpbmcgdmFsdWUgaXMgdGFrZW4gdG8gY29tcHV0ZSB0aGUgYWxpZ25tZW50XCJcbiAgICAgICAgICAgIG9yZGVyOiAxXG4gICAgICAgIGFkZFNwYWNlUG9zdGZpeDpcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImluc2VydCBzcGFjZSBhZnRlciB0aGUgbWF0Y2hpbmcgY2hhcmFjdGVyIChhPTEgPiBhPSAxKSBpZiBjaGFyYWN0ZXIgaXMgcGFydCBvZiB0aGUgJ2FsaWdubWVudCBzcGFjZSBjaGFycydcIlxuICAgICAgICAgICAgb3JkZXI6IDNcblxuICAgIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICAgICAnYXRvbS1hbGlnbm1lbnQ6YWxpZ24nOiAtPlxuICAgICAgICAgICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICAgICAgICAgICAgICBhbGlnbkxpbmVzIGVkaXRvclxuXG4gICAgICAgICAgICAnYXRvbS1hbGlnbm1lbnQ6YWxpZ25NdWx0aXBsZSc6IC0+XG4gICAgICAgICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgICAgICAgICAgICAgIGFsaWduTGluZXNNdWx0aXBsZSBlZGl0b3JcblxuYWxpZ25MaW5lcyA9IChlZGl0b3IpIC0+XG4gICAgc3BhY2VDaGFycyAgICAgICA9IGF0b20uY29uZmlnLmdldCAnYXRvbS1hbGlnbm1lbnQuYWxpZ25tZW50U3BhY2VDaGFycydcbiAgICBtYXRjaGVyICAgICAgICAgID0gYXRvbS5jb25maWcuZ2V0ICdhdG9tLWFsaWdubWVudC5hbGlnbkJ5J1xuICAgIGFkZFNwYWNlUG9zdGZpeCAgPSBhdG9tLmNvbmZpZy5nZXQgJ2F0b20tYWxpZ25tZW50LmFkZFNwYWNlUG9zdGZpeCdcbiAgICBhID0gbmV3IEFsaWduZXIoZWRpdG9yLCBzcGFjZUNoYXJzLCBtYXRjaGVyLCBhZGRTcGFjZVBvc3RmaXgpXG4gICAgYS5hbGlnbihmYWxzZSlcbiAgICByZXR1cm5cblxuYWxpZ25MaW5lc011bHRpcGxlID0gKGVkaXRvcikgLT5cbiAgICBzcGFjZUNoYXJzICAgICAgID0gYXRvbS5jb25maWcuZ2V0ICdhdG9tLWFsaWdubWVudC5hbGlnbm1lbnRTcGFjZUNoYXJzJ1xuICAgIG1hdGNoZXIgICAgICAgICAgPSBhdG9tLmNvbmZpZy5nZXQgJ2F0b20tYWxpZ25tZW50LmFsaWduQnknXG4gICAgYWRkU3BhY2VQb3N0Zml4ICA9IGF0b20uY29uZmlnLmdldCAnYXRvbS1hbGlnbm1lbnQuYWRkU3BhY2VQb3N0Zml4J1xuICAgIGEgPSBuZXcgQWxpZ25lcihlZGl0b3IsIHNwYWNlQ2hhcnMsIG1hdGNoZXIsIGFkZFNwYWNlUG9zdGZpeClcbiAgICBhLmFsaWduKHRydWUpXG4gICAgcmV0dXJuXG4iXX0=
