(function() {
  var math_parser_sandbox, vm;

  vm = require('vm');

  require('./jquery.jqplot.min.js');


  /*
    == ATOM-TERMINAL-PANEL  UTILS PLUGIN ==
  
    Atom-terminal-panel builtin plugin v1.0.0
    -isis97
  
    Contains commands for math graphs plotting etc.
    Supports math function plotting (using JQPlot).
  
    MIT License
    Feel free to do anything with this file.
   */

  math_parser_sandbox = {
    sin: Math.sin,
    cos: Math.cos,
    ceil: Math.ceil,
    floor: Math.floor,
    PI: Math.PI,
    E: Math.E,
    tan: Math.tan,
    sqrt: Math.sqrt,
    pow: Math.pow,
    log: Math.log,
    round: Math.round
  };

  vm.createContext(math_parser_sandbox);

  module.exports = {
    "plot": {
      "description": "Plots math function using JQPlot.",
      "params": "<[FROM] [TO]> [CODE]",
      "example": "plot 0 10 sin(x)",
      "command": function(state, args) {
        var from, i, id, j, points, ref, ref1, ref2, step, to;
        points = [];
        if (args.length < 3) {
          args[2] = args[0];
          args[0] = -25;
          args[1] = 25;
        }
        from = vm.runInThisContext(args[0]);
        to = vm.runInThisContext(args[1]);
        step = (to - from) / 500.0;
        for (i = j = ref = from, ref1 = to, ref2 = step; ref2 > 0 ? j <= ref1 : j >= ref1; i = j += ref2) {
          math_parser_sandbox.x = i;
          points.push([i, vm.runInContext(args[2], math_parser_sandbox)]);
        }
        math_parser_sandbox.x = void 0;
        id = generateRandomID();
        state.message('<div style="height:300px; width:500px;padding-left:25px;" ><div id="chart-' + id + '"></div></div>');
        $.jqplot('chart-' + id, [points], {
          series: [
            {
              showMarker: false
            }
          ],
          title: 'Plotting f(x):=' + args[2],
          axes: {
            xaxis: {
              label: 'Angle (radians)',
              labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
              labelOptions: {
                fontFamily: 'Georgia, Serif',
                fontSize: '0pt'
              }
            },
            yaxis: {
              label: '',
              labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
              labelOptions: {
                fontFamily: 'Georgia, Serif',
                fontSize: '0pt'
              }
            }
          }
        });
        return null;
      }
    },
    "parse": {
      "description": "Parses mathematical expression.",
      "params": "[EXPRESSION]",
      "command": function(state, args) {
        state.message("Result: " + (vm.runInContext(args[0], math_parser_sandbox)));
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9jb21tYW5kcy9tYXRoL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLE9BQUEsQ0FBUSx3QkFBUjs7O0FBR0E7Ozs7Ozs7Ozs7Ozs7RUFZQSxtQkFBQSxHQUFzQjtJQUNwQixHQUFBLEVBQUssSUFBSSxDQUFDLEdBRFU7SUFFcEIsR0FBQSxFQUFLLElBQUksQ0FBQyxHQUZVO0lBR3BCLElBQUEsRUFBTSxJQUFJLENBQUMsSUFIUztJQUlwQixLQUFBLEVBQU8sSUFBSSxDQUFDLEtBSlE7SUFLcEIsRUFBQSxFQUFJLElBQUksQ0FBQyxFQUxXO0lBTXBCLENBQUEsRUFBRyxJQUFJLENBQUMsQ0FOWTtJQU9wQixHQUFBLEVBQUssSUFBSSxDQUFDLEdBUFU7SUFRcEIsSUFBQSxFQUFNLElBQUksQ0FBQyxJQVJTO0lBU3BCLEdBQUEsRUFBSyxJQUFJLENBQUMsR0FUVTtJQVVwQixHQUFBLEVBQUssSUFBSSxDQUFDLEdBVlU7SUFXcEIsS0FBQSxFQUFPLElBQUksQ0FBQyxLQVhROzs7RUFhdEIsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsbUJBQWpCOztFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsbUNBQWY7TUFDQSxRQUFBLEVBQVUsc0JBRFY7TUFFQSxTQUFBLEVBQVcsa0JBRlg7TUFHQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNULFlBQUE7UUFBQSxNQUFBLEdBQVM7UUFFVCxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7VUFDRSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsSUFBSyxDQUFBLENBQUE7VUFDZixJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsQ0FBQztVQUNYLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxHQUhaOztRQUtBLElBQUEsR0FBTyxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsSUFBSyxDQUFBLENBQUEsQ0FBekI7UUFDUCxFQUFBLEdBQUssRUFBRSxDQUFDLGdCQUFILENBQW9CLElBQUssQ0FBQSxDQUFBLENBQXpCO1FBQ0wsSUFBQSxHQUFPLENBQUMsRUFBQSxHQUFHLElBQUosQ0FBQSxHQUFVO0FBQ2pCLGFBQVMsMkZBQVQ7VUFDRSxtQkFBbUIsQ0FBQyxDQUFwQixHQUF3QjtVQUN4QixNQUFNLENBQUMsSUFBUCxDQUFZLENBQUMsQ0FBRCxFQUFJLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQUssQ0FBQSxDQUFBLENBQXJCLEVBQXlCLG1CQUF6QixDQUFKLENBQVo7QUFGRjtRQUdBLG1CQUFtQixDQUFDLENBQXBCLEdBQXdCO1FBQ3hCLEVBQUEsR0FBSyxnQkFBQSxDQUFBO1FBQ0wsS0FBSyxDQUFDLE9BQU4sQ0FBYyw0RUFBQSxHQUE2RSxFQUE3RSxHQUFnRixnQkFBOUY7UUFDQSxDQUFDLENBQUMsTUFBRixDQUFTLFFBQUEsR0FBUyxFQUFsQixFQUFzQixDQUFDLE1BQUQsQ0FBdEIsRUFBZ0M7VUFDOUIsTUFBQSxFQUFPO1lBQUM7Y0FBQyxVQUFBLEVBQVcsS0FBWjthQUFEO1dBRHVCO1VBRTlCLEtBQUEsRUFBTSxpQkFBQSxHQUFrQixJQUFLLENBQUEsQ0FBQSxDQUZDO1VBRzlCLElBQUEsRUFBSztZQUNILEtBQUEsRUFBTTtjQUNKLEtBQUEsRUFBTSxpQkFERjtjQUVKLGFBQUEsRUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLHVCQUZwQjtjQUdKLFlBQUEsRUFBYztnQkFDWixVQUFBLEVBQVksZ0JBREE7Z0JBRVosUUFBQSxFQUFVLEtBRkU7ZUFIVjthQURIO1lBU0gsS0FBQSxFQUFNO2NBQ0osS0FBQSxFQUFNLEVBREY7Y0FFSixhQUFBLEVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx1QkFGcEI7Y0FHSixZQUFBLEVBQWM7Z0JBQ1osVUFBQSxFQUFZLGdCQURBO2dCQUVaLFFBQUEsRUFBVSxLQUZFO2VBSFY7YUFUSDtXQUh5QjtTQUFoQztBQXNCQSxlQUFPO01BdkNFLENBSFg7S0FERjtJQTRDQSxPQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsaUNBQWY7TUFDQSxRQUFBLEVBQVUsY0FEVjtNQUVBLFNBQUEsRUFBVyxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1QsS0FBSyxDQUFDLE9BQU4sQ0FBYyxVQUFBLEdBQVcsQ0FBQyxFQUFFLENBQUMsWUFBSCxDQUFnQixJQUFLLENBQUEsQ0FBQSxDQUFyQixFQUF5QixtQkFBekIsQ0FBRCxDQUF6QjtBQUNBLGVBQU87TUFGRSxDQUZYO0tBN0NGOztBQWhDRiIsInNvdXJjZXNDb250ZW50IjpbInZtID0gcmVxdWlyZSAndm0nXG5yZXF1aXJlICcuL2pxdWVyeS5qcXBsb3QubWluLmpzJ1xuXG5cbiMjI1xuICA9PSBBVE9NLVRFUk1JTkFMLVBBTkVMICBVVElMUyBQTFVHSU4gPT1cblxuICBBdG9tLXRlcm1pbmFsLXBhbmVsIGJ1aWx0aW4gcGx1Z2luIHYxLjAuMFxuICAtaXNpczk3XG5cbiAgQ29udGFpbnMgY29tbWFuZHMgZm9yIG1hdGggZ3JhcGhzIHBsb3R0aW5nIGV0Yy5cbiAgU3VwcG9ydHMgbWF0aCBmdW5jdGlvbiBwbG90dGluZyAodXNpbmcgSlFQbG90KS5cblxuICBNSVQgTGljZW5zZVxuICBGZWVsIGZyZWUgdG8gZG8gYW55dGhpbmcgd2l0aCB0aGlzIGZpbGUuXG4jIyNcbm1hdGhfcGFyc2VyX3NhbmRib3ggPSB7XG4gIHNpbjogTWF0aC5zaW5cbiAgY29zOiBNYXRoLmNvc1xuICBjZWlsOiBNYXRoLmNlaWxcbiAgZmxvb3I6IE1hdGguZmxvb3JcbiAgUEk6IE1hdGguUElcbiAgRTogTWF0aC5FXG4gIHRhbjogTWF0aC50YW5cbiAgc3FydDogTWF0aC5zcXJ0XG4gIHBvdzogTWF0aC5wb3dcbiAgbG9nOiBNYXRoLmxvZ1xuICByb3VuZDogTWF0aC5yb3VuZFxufVxudm0uY3JlYXRlQ29udGV4dCBtYXRoX3BhcnNlcl9zYW5kYm94XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgXCJwbG90XCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlBsb3RzIG1hdGggZnVuY3Rpb24gdXNpbmcgSlFQbG90LlwiXG4gICAgXCJwYXJhbXNcIjogXCI8W0ZST01dIFtUT10+IFtDT0RFXVwiXG4gICAgXCJleGFtcGxlXCI6IFwicGxvdCAwIDEwIHNpbih4KVwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgcG9pbnRzID0gW11cblxuICAgICAgaWYgYXJncy5sZW5ndGggPCAzXG4gICAgICAgIGFyZ3NbMl0gPSBhcmdzWzBdXG4gICAgICAgIGFyZ3NbMF0gPSAtMjVcbiAgICAgICAgYXJnc1sxXSA9IDI1XG5cbiAgICAgIGZyb20gPSB2bS5ydW5JblRoaXNDb250ZXh0IGFyZ3NbMF1cbiAgICAgIHRvID0gdm0ucnVuSW5UaGlzQ29udGV4dCBhcmdzWzFdXG4gICAgICBzdGVwID0gKHRvLWZyb20pLzUwMC4wXG4gICAgICBmb3IgaSBpbiBbZnJvbS4udG9dIGJ5IHN0ZXBcbiAgICAgICAgbWF0aF9wYXJzZXJfc2FuZGJveC54ID0gaVxuICAgICAgICBwb2ludHMucHVzaChbaSwgdm0ucnVuSW5Db250ZXh0KGFyZ3NbMl0sIG1hdGhfcGFyc2VyX3NhbmRib3gpXSlcbiAgICAgIG1hdGhfcGFyc2VyX3NhbmRib3gueCA9IHVuZGVmaW5lZFxuICAgICAgaWQgPSBnZW5lcmF0ZVJhbmRvbUlEKClcbiAgICAgIHN0YXRlLm1lc3NhZ2UgJzxkaXYgc3R5bGU9XCJoZWlnaHQ6MzAwcHg7IHdpZHRoOjUwMHB4O3BhZGRpbmctbGVmdDoyNXB4O1wiID48ZGl2IGlkPVwiY2hhcnQtJytpZCsnXCI+PC9kaXY+PC9kaXY+J1xuICAgICAgJC5qcXBsb3QoJ2NoYXJ0LScraWQsIFtwb2ludHNdLCB7XG4gICAgICAgIHNlcmllczpbe3Nob3dNYXJrZXI6ZmFsc2V9XVxuICAgICAgICB0aXRsZTonUGxvdHRpbmcgZih4KTo9JythcmdzWzJdXG4gICAgICAgIGF4ZXM6e1xuICAgICAgICAgIHhheGlzOntcbiAgICAgICAgICAgIGxhYmVsOidBbmdsZSAocmFkaWFucyknXG4gICAgICAgICAgICBsYWJlbFJlbmRlcmVyOiAkLmpxcGxvdC5DYW52YXNBeGlzTGFiZWxSZW5kZXJlclxuICAgICAgICAgICAgbGFiZWxPcHRpb25zOiB7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6ICdHZW9yZ2lhLCBTZXJpZidcbiAgICAgICAgICAgICAgZm9udFNpemU6ICcwcHQnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHlheGlzOntcbiAgICAgICAgICAgIGxhYmVsOicnXG4gICAgICAgICAgICBsYWJlbFJlbmRlcmVyOiAkLmpxcGxvdC5DYW52YXNBeGlzTGFiZWxSZW5kZXJlclxuICAgICAgICAgICAgbGFiZWxPcHRpb25zOiB7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6ICdHZW9yZ2lhLCBTZXJpZidcbiAgICAgICAgICAgICAgZm9udFNpemU6ICcwcHQnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIG51bGxcbiAgXCJwYXJzZVwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJQYXJzZXMgbWF0aGVtYXRpY2FsIGV4cHJlc3Npb24uXCJcbiAgICBcInBhcmFtc1wiOiBcIltFWFBSRVNTSU9OXVwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgc3RhdGUubWVzc2FnZSBcIlJlc3VsdDogXCIrKHZtLnJ1bkluQ29udGV4dCBhcmdzWzBdLCBtYXRoX3BhcnNlcl9zYW5kYm94KVxuICAgICAgcmV0dXJuIG51bGxcbiJdfQ==
