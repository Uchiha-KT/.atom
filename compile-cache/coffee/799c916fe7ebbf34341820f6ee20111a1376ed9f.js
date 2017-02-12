(function() {
  var Aligner, Range, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Range = require('atom').Range;

  _ = require('lodash');

  module.exports = Aligner = (function() {
    function Aligner(editor, spaceChars, matcher, addSpacePostfix) {
      this.editor = editor;
      this.spaceChars = spaceChars;
      this.matcher = matcher;
      this.addSpacePostfix = addSpacePostfix;
      this.align = bind(this.align, this);
      this.__computeRows = bind(this.__computeRows, this);
      this.__computeLength = bind(this.__computeLength, this);
      this.__generateAlignmentList = bind(this.__generateAlignmentList, this);
      this.__getRows = bind(this.__getRows, this);
      this.rows = [];
      this.alignments = [];
    }

    Aligner.prototype.__getRows = function() {
      var allCursors, cursor, cursors, j, k, l, len1, len2, len3, m, o, range, ranges, row, rowNums, t;
      rowNums = [];
      allCursors = [];
      cursors = _.filter(this.editor.getCursors(), function(cursor) {
        var row;
        allCursors.push(cursor);
        row = cursor.getBufferRow();
        if (cursor.visible && !_.contains(rowNums, row)) {
          rowNums.push(row);
          return true;
        }
      });
      if (cursors.length > 1) {
        this.mode = "cursor";
        for (j = 0, len1 = cursors.length; j < len1; j++) {
          cursor = cursors[j];
          row = cursor.getBufferRow();
          t = this.editor.lineTextForBufferRow(row);
          l = this.__computeLength(t.substring(0, cursor.getBufferColumn()));
          o = {
            text: t,
            length: t.length,
            row: row,
            column: l,
            virtualColumn: cursor.getBufferColumn()
          };
          this.rows.push(o);
        }
      } else {
        ranges = this.editor.getSelectedBufferRanges();
        for (k = 0, len2 = ranges.length; k < len2; k++) {
          range = ranges[k];
          rowNums = rowNums.concat(range.getRows());
          if (range.end.column === 0) {
            rowNums.pop();
          }
        }
        for (m = 0, len3 = rowNums.length; m < len3; m++) {
          row = rowNums[m];
          o = {
            text: this.editor.lineTextForBufferRow(row),
            length: this.editor.lineTextForBufferRow(row).length,
            row: row
          };
          this.rows.push(o);
        }
        this.mode = "align";
      }
      if (this.mode !== "cursor") {
        return this.rows.forEach(function(o) {
          var firstCharIdx;
          t = o.text.replace(/\s/g, '');
          if (t.length > 0) {
            firstCharIdx = o.text.indexOf(t.charAt(0));
            return o.text = o.text.substr(0, firstCharIdx) + o.text.substring(firstCharIdx).replace(/\ {2,}/g, ' ');
          }
        });
      }
    };

    Aligner.prototype.__getAllIndexes = function(string, val, indexes) {
      var found, i;
      found = [];
      i = 0;
      while (true) {
        i = string.indexOf(val, i);
        if (i !== -1 && !_.some(indexes, {
          index: i
        })) {
          found.push({
            found: val,
            index: i
          });
        }
        if (i === -1) {
          break;
        }
        i++;
      }
      return found;
    };

    Aligner.prototype.__generateAlignmentList = function() {
      if (this.mode === "cursor") {
        return _.forEach(this.rows, (function(_this) {
          return function(o) {
            var part;
            part = o.text.substring(o.virtualColumn);
            _.forEach(_this.spaceChars, function(char) {
              var idx;
              idx = part.indexOf(char);
              if (idx === 0 && o.text.charAt(o.virtualColumn) !== " ") {
                o.addSpacePrefix = true;
                o.spaceCharLength = char.length;
                return false;
              }
            });
          };
        })(this));
      } else {
        _.forEach(this.rows, (function(_this) {
          return function(o) {
            _.forEach(_this.matcher, function(possibleMatcher) {
              return _this.alignments = _this.alignments.concat(_this.__getAllIndexes(o.text, possibleMatcher, _this.alignments));
            });
            if (_this.alignments.length > 0) {
              return false;
            } else {
              return true;
            }
          };
        })(this));
        this.alignments = this.alignments.sort(function(a, b) {
          return a.index - b.index;
        });
        this.alignments = _.pluck(this.alignments, "found");
      }
    };

    Aligner.prototype.__computeLength = function(s) {
      var char, diff, idx, j, len1, tabLength, tabs;
      diff = tabs = idx = 0;
      tabLength = this.editor.getTabLength();
      for (j = 0, len1 = s.length; j < len1; j++) {
        char = s[j];
        if (char === "\t") {
          diff += tabLength - (idx % tabLength);
          idx += tabLength - (idx % tabLength);
          tabs++;
        } else {
          idx++;
        }
      }
      return s.length + diff - tabs;
    };

    Aligner.prototype.__computeRows = function() {
      var addSpacePrefix, idx, matched, max, possibleMatcher;
      max = 0;
      if (this.mode === "align" || this.mode === "break") {
        matched = null;
        idx = -1;
        possibleMatcher = this.alignments.shift();
        addSpacePrefix = this.spaceChars.indexOf(possibleMatcher) > -1;
        this.rows.forEach((function(_this) {
          return function(o) {
            var backslash, blankPos, c, charFound, doubleQuotationMark, found, l, len, line, next, quotationMark, splitString;
            o.splited = null;
            if (!o.done) {
              line = o.text;
              if (line.indexOf(possibleMatcher, o.nextPos) !== -1) {
                matched = possibleMatcher;
                idx = line.indexOf(matched, o.nextPos);
                len = matched.length;
                if (_this.mode === "break") {
                  idx += len - 1;
                  c = "";
                  blankPos = -1;
                  quotationMark = doubleQuotationMark = 0;
                  backslash = charFound = false;
                  while (true) {
                    if (c === void 0) {
                      break;
                    }
                    c = line[++idx];
                    if (c === "'" && !backslash) {
                      quotationMark++;
                    }
                    if (c === '"' && !backslash) {
                      doubleQuotationMark++;
                    }
                    backslash = c === "\\" && !backslash ? true : false;
                    charFound = c !== " " && !charFound ? true : charFound;
                    if (c === " " && quotationMark % 2 === 0 && doubleQuotationMark % 2 === 0 && charFound) {
                      blankPos = idx;
                      break;
                    }
                  }
                  idx = blankPos;
                }
                next = _this.mode === "break" ? 1 : len;
                if (idx !== -1) {
                  splitString = [line.substring(0, idx), line.substring(idx + next)];
                  o.splited = splitString;
                  l = _this.__computeLength(splitString[0]);
                  if (max <= l) {
                    max = l;
                    if (l > 0 && addSpacePrefix && splitString[0].charAt(splitString[0].length - 1) !== " ") {
                      max++;
                    }
                  }
                }
              }
              found = false;
              _.forEach(_this.alignments, function(nextPossibleMatcher) {
                if (line.indexOf(nextPossibleMatcher, idx + len) !== -1) {
                  found = true;
                  return false;
                }
              });
              o.stop = !found;
            }
          };
        })(this));
        if (max >= 0) {
          if (max > 0) {
            max++;
          }
          this.rows.forEach((function(_this) {
            return function(o) {
              var diff, splitString;
              if (!o.done && o.splited && matched) {
                splitString = o.splited;
                diff = max - _this.__computeLength(splitString[0]);
                if (diff > 0) {
                  splitString[0] = splitString[0] + Array(diff).join(' ');
                }
                if (_this.addSpacePostfix && addSpacePrefix) {
                  splitString[1] = " " + splitString[1].trim();
                }
                if (_this.mode === "break") {
                  _.forEach(splitString, function(s, i) {
                    return splitString[i] = s.trim();
                  });
                  o.text = splitString.join("\n");
                } else {
                  o.text = splitString.join(matched);
                }
                o.done = o.stop;
                o.nextPos = splitString[0].length + matched.length;
              }
            };
          })(this));
        }
        return this.alignments.length > 0;
      } else {
        this.rows.forEach(function(o) {
          var part;
          if (max <= o.column) {
            max = o.column;
            part = o.text.substring(0, o.virtualColumn);
            if (part.length > 0 && o.addSpacePrefix && part.charAt(part.length - 1) !== " ") {
              max++;
            }
          }
        });
        max++;
        this.rows.forEach((function(_this) {
          return function(o) {
            var diff, line, splitString;
            line = o.text;
            splitString = [line.substring(0, o.virtualColumn), line.substring(o.virtualColumn)];
            diff = max - _this.__computeLength(splitString[0]);
            if (diff > 0) {
              splitString[0] = splitString[0] + Array(diff).join(' ');
            }
            if (o.spaceCharLength == null) {
              o.spaceCharLength = 0;
            }
            splitString[1] = splitString[1].substring(0, o.spaceCharLength) + splitString[1].substr(o.spaceCharLength).trim();
            if (_this.addSpacePostfix && o.addSpacePrefix) {
              splitString[1] = splitString[1].substring(0, o.spaceCharLength) + " " + splitString[1].substr(o.spaceCharLength);
            }
            o.text = splitString.join("");
          };
        })(this));
        return false;
      }
    };

    Aligner.prototype.align = function(multiple) {
      var cont;
      this.__getRows();
      this.__generateAlignmentList();
      if (this.rows.length === 1 && multiple) {
        this.mode = "break";
      }
      if (multiple || this.mode === "break") {
        while (true) {
          cont = this.__computeRows();
          if (!cont) {
            break;
          }
        }
      } else {
        this.__computeRows();
      }
      return this.rows.forEach((function(_this) {
        return function(o) {
          return _this.editor.setTextInBufferRange([[o.row, 0], [o.row, o.length]], o.text);
        };
      })(this));
    };

    return Aligner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL2F0b20tYWxpZ25tZW50L2xpYi9hbGlnbmVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUJBQUE7SUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUNVO0lBRVcsaUJBQUMsTUFBRCxFQUFVLFVBQVYsRUFBdUIsT0FBdkIsRUFBaUMsZUFBakM7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxhQUFEO01BQWEsSUFBQyxDQUFBLFVBQUQ7TUFBVSxJQUFDLENBQUEsa0JBQUQ7Ozs7OztNQUMxQyxJQUFDLENBQUEsSUFBRCxHQUFRO01BQ1IsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUZMOztzQkFLYixTQUFBLEdBQVcsU0FBQTtBQUNQLFVBQUE7TUFBQSxPQUFBLEdBQVU7TUFDVixVQUFBLEdBQWE7TUFDYixPQUFBLEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFULEVBQStCLFNBQUMsTUFBRDtBQUNyQyxZQUFBO1FBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEI7UUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFlBQVAsQ0FBQTtRQUNOLElBQUcsTUFBTSxDQUFDLE9BQVAsSUFBa0IsQ0FBQyxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsRUFBb0IsR0FBcEIsQ0FBdEI7VUFDSSxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7QUFDQSxpQkFBTyxLQUZYOztNQUhxQyxDQUEvQjtNQU9WLElBQUksT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBckI7UUFDSSxJQUFDLENBQUEsSUFBRCxHQUFRO0FBQ1IsYUFBQSwyQ0FBQTs7VUFDSSxHQUFBLEdBQU0sTUFB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QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUgsRUFBUSxDQUFSLENBQUQsRUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFILEVBQVEsQ0FBQyxDQUFDLE1BQVYsQ0FBWixDQUE3QixFQUE2RCxDQUFDLENBQUMsSUFBL0Q7UUFEVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtJQWJHOzs7OztBQXBOZiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5fID0gcmVxdWlyZSAnbG9kYXNoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgY2xhc3MgQWxpZ25lclxuICAgICAgICAjIFB1YmxpY1xuICAgICAgICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBzcGFjZUNoYXJzLCBAbWF0Y2hlciwgQGFkZFNwYWNlUG9zdGZpeCkgLT5cbiAgICAgICAgICAgIEByb3dzID0gW11cbiAgICAgICAgICAgIEBhbGlnbm1lbnRzID0gW11cblxuICAgICAgICAjIFByaXZhdGVcbiAgICAgICAgX19nZXRSb3dzOiA9PlxuICAgICAgICAgICAgcm93TnVtcyA9IFtdXG4gICAgICAgICAgICBhbGxDdXJzb3JzID0gW11cbiAgICAgICAgICAgIGN1cnNvcnMgPSBfLmZpbHRlciBAZWRpdG9yLmdldEN1cnNvcnMoKSwgKGN1cnNvcikgLT5cbiAgICAgICAgICAgICAgICBhbGxDdXJzb3JzLnB1c2goY3Vyc29yKVxuICAgICAgICAgICAgICAgIHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgICAgICAgICAgIGlmIGN1cnNvci52aXNpYmxlICYmICFfLmNvbnRhaW5zKHJvd051bXMsIHJvdylcbiAgICAgICAgICAgICAgICAgICAgcm93TnVtcy5wdXNoKHJvdylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICAgICAgaWYgKGN1cnNvcnMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgICAgICBAbW9kZSA9IFwiY3Vyc29yXCJcbiAgICAgICAgICAgICAgICBmb3IgY3Vyc29yIGluIGN1cnNvcnNcbiAgICAgICAgICAgICAgICAgICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICAgICAgICAgICAgICAgIHQgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgICAgICAgICAgICAgICAgICAgbCA9IEBfX2NvbXB1dGVMZW5ndGgodC5zdWJzdHJpbmcoMCxjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkpKVxuICAgICAgICAgICAgICAgICAgICBvID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgICA6IHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aCA6IHQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICByb3cgICAgOiByb3dcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbiA6IGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpcnR1YWxDb2x1bW46IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuICAgICAgICAgICAgICAgICAgICBAcm93cy5wdXNoIChvKVxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmFuZ2VzID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICAgICAgICAgICAgZm9yIHJhbmdlIGluIHJhbmdlc1xuICAgICAgICAgICAgICAgICAgICByb3dOdW1zID0gcm93TnVtcy5jb25jYXQocmFuZ2UuZ2V0Um93cygpKVxuICAgICAgICAgICAgICAgICAgICByb3dOdW1zLnBvcCgpIGlmIHJhbmdlLmVuZC5jb2x1bW4gPT0gMFxuXG4gICAgICAgICAgICAgICAgZm9yIHJvdyBpbiByb3dOdW1zXG4gICAgICAgICAgICAgICAgICAgIG8gPVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCAgIDogQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGggOiBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICByb3cgICAgOiByb3dcbiAgICAgICAgICAgICAgICAgICAgQHJvd3MucHVzaCAobylcblxuICAgICAgICAgICAgICAgIEBtb2RlID0gXCJhbGlnblwiXG5cbiAgICAgICAgICAgIGlmIEBtb2RlICE9IFwiY3Vyc29yXCJcbiAgICAgICAgICAgICAgICBAcm93cy5mb3JFYWNoIChvKSAtPlxuICAgICAgICAgICAgICAgICAgICB0ID0gby50ZXh0LnJlcGxhY2UoL1xccy9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgaWYgdC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdENoYXJJZHggPSBvLnRleHQuaW5kZXhPZih0LmNoYXJBdCgwKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG8udGV4dCA9IG8udGV4dC5zdWJzdHIoMCxmaXJzdENoYXJJZHgpICsgby50ZXh0LnN1YnN0cmluZyhmaXJzdENoYXJJZHgpLnJlcGxhY2UoL1xcIHsyLH0vZywgJyAnKVxuXG4gICAgICAgIF9fZ2V0QWxsSW5kZXhlczogKHN0cmluZywgdmFsLCBpbmRleGVzKSAtPlxuICAgICAgICAgICAgZm91bmQgPSBbXVxuICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgIGxvb3BcbiAgICAgICAgICAgICAgICBpID0gc3RyaW5nLmluZGV4T2YodmFsLCBpKVxuICAgICAgICAgICAgICAgIGlmIGkgIT0gLTEgJiYgIV8uc29tZShpbmRleGVzLCB7aW5kZXg6aX0pXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kLnB1c2goe2ZvdW5kOnZhbCxpbmRleDppfSlcblxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGkgPT0gLTFcbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgIHJldHVybiBmb3VuZFxuXG4gICAgICAgICNnZW5lcmF0ZSB0aGUgc2VxdWVuY2Ugb2YgYWxpZ25tZW50IGNoYXJhY3RlcnMgY29tcHV0ZWQgZnJvbSB0aGUgZmlyc3QgbWF0Y2hpbmcgbGluZVxuICAgICAgICBfX2dlbmVyYXRlQWxpZ25tZW50TGlzdDogKCkgPT5cbiAgICAgICAgICAgIGlmIEBtb2RlID09IFwiY3Vyc29yXCJcbiAgICAgICAgICAgICAgICBfLmZvckVhY2ggQHJvd3MsIChvKSA9PlxuICAgICAgICAgICAgICAgICAgICBwYXJ0ID0gby50ZXh0LnN1YnN0cmluZyhvLnZpcnR1YWxDb2x1bW4pXG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaCBAc3BhY2VDaGFycywgKGNoYXIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHggPSBwYXJ0LmluZGV4T2YoY2hhcilcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGlkeCA9PSAwICYmIG8udGV4dC5jaGFyQXQoby52aXJ0dWFsQ29sdW1uKSAhPSBcIiBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uYWRkU3BhY2VQcmVmaXggPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5zcGFjZUNoYXJMZW5ndGggPSBjaGFyLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBfLmZvckVhY2ggQHJvd3MsIChvKSA9PlxuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2ggQG1hdGNoZXIsIChwb3NzaWJsZU1hdGNoZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBAYWxpZ25tZW50cyA9IEBhbGlnbm1lbnRzLmNvbmNhdCAoQF9fZ2V0QWxsSW5kZXhlcyBvLnRleHQsIHBvc3NpYmxlTWF0Y2hlciwgQGFsaWdubWVudHMpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgQGFsaWdubWVudHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlICMgZXhpdCBpZiB3ZSBnb3QgYWxsIGFsaWdubWVudHMgY2hhcmFjdGVycyBpbiB0aGUgcm93XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlICMgY29udGludWVcbiAgICAgICAgICAgICAgICBAYWxpZ25tZW50cyA9IEBhbGlnbm1lbnRzLnNvcnQgKGEsIGIpIC0+IGEuaW5kZXggLSBiLmluZGV4XG4gICAgICAgICAgICAgICAgQGFsaWdubWVudHMgPSBfLnBsdWNrIEBhbGlnbm1lbnRzLCBcImZvdW5kXCJcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBfX2NvbXB1dGVMZW5ndGg6IChzKSA9PlxuICAgICAgICAgICAgZGlmZiA9IHRhYnMgPSBpZHggPSAwXG4gICAgICAgICAgICB0YWJMZW5ndGggPSBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgICAgICAgICBmb3IgY2hhciBpbiBzXG4gICAgICAgICAgICAgICAgaWYgY2hhciA9PSBcIlxcdFwiXG4gICAgICAgICAgICAgICAgICAgIGRpZmYgKz0gdGFiTGVuZ3RoIC0gKGlkeCAlIHRhYkxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgaWR4ICs9IHRhYkxlbmd0aCAtIChpZHggJSB0YWJMZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIHRhYnMrK1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWR4KytcblxuICAgICAgICAgICAgcmV0dXJuIHMubGVuZ3RoK2RpZmYtdGFic1xuXG4gICAgICAgIF9fY29tcHV0ZVJvd3M6ICgpID0+XG4gICAgICAgICAgICBtYXggPSAwXG4gICAgICAgICAgICBpZiBAbW9kZSA9PSBcImFsaWduXCIgfHwgQG1vZGUgPT0gXCJicmVha1wiXG4gICAgICAgICAgICAgICAgbWF0Y2hlZCA9IG51bGxcbiAgICAgICAgICAgICAgICBpZHggPSAtMVxuICAgICAgICAgICAgICAgIHBvc3NpYmxlTWF0Y2hlciA9IEBhbGlnbm1lbnRzLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBhZGRTcGFjZVByZWZpeCA9IEBzcGFjZUNoYXJzLmluZGV4T2YocG9zc2libGVNYXRjaGVyKSA+IC0xXG4gICAgICAgICAgICAgICAgQHJvd3MuZm9yRWFjaCAobykgPT5cbiAgICAgICAgICAgICAgICAgICAgby5zcGxpdGVkID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBpZiAhby5kb25lXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lID0gby50ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5pbmRleE9mKHBvc3NpYmxlTWF0Y2hlciwgby5uZXh0UG9zKSAhPSAtMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkID0gcG9zc2libGVNYXRjaGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWR4ID0gbGluZS5pbmRleE9mKG1hdGNoZWQsIG8ubmV4dFBvcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW4gPSBtYXRjaGVkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIEBtb2RlID09IFwiYnJlYWtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZHggKz0gbGVuLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYyA9IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtQb3MgPSAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdW90YXRpb25NYXJrID0gZG91YmxlUXVvdGF0aW9uTWFyayA9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja3NsYXNoID0gY2hhckZvdW5kID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9vcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgaWYgYyA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBsaW5lWysraWR4XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYyA9PSBcIidcIiBhbmQgIWJhY2tzbGFzaCB0aGVuIHF1b3RhdGlvbk1hcmsrK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYyA9PSAnXCInIGFuZCAhYmFja3NsYXNoIHRoZW4gZG91YmxlUXVvdGF0aW9uTWFyaysrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrc2xhc2ggPSBpZiBjID09IFwiXFxcXFwiIGFuZCAhYmFja3NsYXNoIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFyRm91bmQgPSBpZiBjICE9IFwiIFwiIGFuZCAhY2hhckZvdW5kIHRoZW4gdHJ1ZSBlbHNlIGNoYXJGb3VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgYyA9PSBcIiBcIiBhbmQgcXVvdGF0aW9uTWFyayAlIDIgPT0gMCBhbmQgZG91YmxlUXVvdGF0aW9uTWFyayAlIDIgPT0gMCBhbmQgY2hhckZvdW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtQb3MgPSBpZHhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkeCA9IGJsYW5rUG9zXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gaWYgQG1vZGUgPT0gXCJicmVha1wiIHRoZW4gMSBlbHNlIGxlblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgaWR4IGlzbnQgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXRTdHJpbmcgID0gW2xpbmUuc3Vic3RyaW5nKDAsaWR4KSwgbGluZS5zdWJzdHJpbmcoaWR4K25leHQpXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnNwbGl0ZWQgPSBzcGxpdFN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gQF9fY29tcHV0ZUxlbmd0aChzcGxpdFN0cmluZ1swXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbWF4IDw9IGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heCA9IGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heCsrIGlmIGwgPiAwICYmIGFkZFNwYWNlUHJlZml4ICYmIHNwbGl0U3RyaW5nWzBdLmNoYXJBdChzcGxpdFN0cmluZ1swXS5sZW5ndGgtMSkgIT0gXCIgXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoIEBhbGlnbm1lbnRzLCAobmV4dFBvc3NpYmxlTWF0Y2hlcikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZS5pbmRleE9mKG5leHRQb3NzaWJsZU1hdGNoZXIsIGlkeCtsZW4pICE9IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG8uc3RvcCA9ICFmb3VuZFxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAgICAgaWYgKG1heCA+PSAwKVxuICAgICAgICAgICAgICAgICAgICBtYXgrKyBpZiBtYXggPiAwXG5cbiAgICAgICAgICAgICAgICAgICAgQHJvd3MuZm9yRWFjaCAobykgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICFvLmRvbmUgYW5kIG8uc3BsaXRlZCBhbmQgbWF0Y2hlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwbGl0U3RyaW5nID0gby5zcGxpdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG1heCAtIEBfX2NvbXB1dGVMZW5ndGgoc3BsaXRTdHJpbmdbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZGlmZiA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXRTdHJpbmdbMF0gPSBzcGxpdFN0cmluZ1swXSArIEFycmF5KGRpZmYpLmpvaW4oJyAnKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXRTdHJpbmdbMV0gPSBcIiBcIitzcGxpdFN0cmluZ1sxXS50cmltKCkgaWYgQGFkZFNwYWNlUG9zdGZpeCAmJiBhZGRTcGFjZVByZWZpeFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgQG1vZGUgPT0gXCJicmVha1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaCBzcGxpdFN0cmluZywgKHMsIGkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGxpdFN0cmluZ1tpXSA9IHMudHJpbSgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby50ZXh0ID0gc3BsaXRTdHJpbmcuam9pbihcIlxcblwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby50ZXh0ID0gc3BsaXRTdHJpbmcuam9pbihtYXRjaGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uZG9uZSA9IG8uc3RvcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubmV4dFBvcyA9IHNwbGl0U3RyaW5nWzBdLmxlbmd0aCttYXRjaGVkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBhbGlnbm1lbnRzLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGVsc2UgI2N1cnNvclxuICAgICAgICAgICAgICAgIEByb3dzLmZvckVhY2ggKG8pIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIG1heCA8PSBvLmNvbHVtblxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ID0gby5jb2x1bW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnQgPSBvLnRleHQuc3Vic3RyaW5nKDAsby52aXJ0dWFsQ29sdW1uKVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4KysgaWYgcGFydC5sZW5ndGggPiAwICYmIG8uYWRkU3BhY2VQcmVmaXggJiYgcGFydC5jaGFyQXQocGFydC5sZW5ndGgtMSkgIT0gXCIgXCJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgICAgICBtYXgrK1xuXG4gICAgICAgICAgICAgICAgQHJvd3MuZm9yRWFjaCAobykgPT5cbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IG8udGV4dFxuICAgICAgICAgICAgICAgICAgICBzcGxpdFN0cmluZyA9IFtsaW5lLnN1YnN0cmluZygwLG8udmlydHVhbENvbHVtbiksIGxpbmUuc3Vic3RyaW5nKG8udmlydHVhbENvbHVtbildXG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPSBtYXggLSBAX19jb21wdXRlTGVuZ3RoKHNwbGl0U3RyaW5nWzBdKVxuICAgICAgICAgICAgICAgICAgICBpZiBkaWZmID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXRTdHJpbmdbMF0gPSBzcGxpdFN0cmluZ1swXSArIEFycmF5KGRpZmYpLmpvaW4oJyAnKVxuXG4gICAgICAgICAgICAgICAgICAgIG8uc3BhY2VDaGFyTGVuZ3RoID89IDBcbiAgICAgICAgICAgICAgICAgICAgc3BsaXRTdHJpbmdbMV0gPSBzcGxpdFN0cmluZ1sxXS5zdWJzdHJpbmcoMCwgby5zcGFjZUNoYXJMZW5ndGgpICsgc3BsaXRTdHJpbmdbMV0uc3Vic3RyKG8uc3BhY2VDaGFyTGVuZ3RoKS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgaWYgQGFkZFNwYWNlUG9zdGZpeCAmJiBvLmFkZFNwYWNlUHJlZml4XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGxpdFN0cmluZ1sxXSA9IHNwbGl0U3RyaW5nWzFdLnN1YnN0cmluZygwLCBvLnNwYWNlQ2hhckxlbmd0aCkgKyBcIiBcIiArc3BsaXRTdHJpbmdbMV0uc3Vic3RyKG8uc3BhY2VDaGFyTGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgICAgIG8udGV4dCA9IHNwbGl0U3RyaW5nLmpvaW4oXCJcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgIyBQdWJsaWNcbiAgICAgICAgYWxpZ246IChtdWx0aXBsZSkgPT5cbiAgICAgICAgICAgIEBfX2dldFJvd3MoKVxuICAgICAgICAgICAgQF9fZ2VuZXJhdGVBbGlnbm1lbnRMaXN0KClcbiAgICAgICAgICAgIGlmIEByb3dzLmxlbmd0aCA9PSAxICYmIG11bHRpcGxlXG4gICAgICAgICAgICAgICAgQG1vZGUgPSBcImJyZWFrXCJcblxuICAgICAgICAgICAgaWYgbXVsdGlwbGUgfHwgQG1vZGUgPT0gXCJicmVha1wiXG4gICAgICAgICAgICAgICAgbG9vcFxuICAgICAgICAgICAgICAgICAgICBjb250ID0gQF9fY29tcHV0ZVJvd3MoKVxuICAgICAgICAgICAgICAgICAgICBicmVhayBpZiBub3QgY29udFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBfX2NvbXB1dGVSb3dzKClcblxuICAgICAgICAgICAgQHJvd3MuZm9yRWFjaCAobykgPT5cbiAgICAgICAgICAgICAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtbby5yb3csIDBdLFtvLnJvdywgby5sZW5ndGhdXSwgby50ZXh0KVxuIl19
