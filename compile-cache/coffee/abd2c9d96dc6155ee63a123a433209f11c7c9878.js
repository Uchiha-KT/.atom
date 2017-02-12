(function() {
  var os, vm;

  vm = require('vm');

  os = require('os');


  /*
    == ATOM-TERMINAL-PANEL  UI PLUGIN ==
  
    Atom-terminal-panel builtin plugin v1.0.0
    -isis97
  
    Contains commands for creating user interface components
    (e.g. bars etc.)
  
    MIT License
    Feel free to do anything with this file.
   */

  module.exports = {
    "ui-clock": {
      "description": "Displays the dynamic clock.",
      "command": function(state) {
        return state.exec("echo %(raw) %(dynamic) %(^#FF851B) %(hours12):%(minutes):%(seconds) %(ampm) %(^)", [], state);
      }
    },
    "ui-mem": {
      "description": "Displays the dynamic memory usage information",
      "command": function(state) {
        return state.exec("echo %(raw) %(dynamic) %(^#FF851B) Free memory/available memory: %(os.freemem)B / %(os.totalmem)B %(^)", [], state);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9jb21tYW5kcy91aS9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7OztBQUVMOzs7Ozs7Ozs7Ozs7O0VBWUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFVBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSw2QkFBZjtNQUNBLFNBQUEsRUFBVyxTQUFDLEtBQUQ7ZUFDVCxLQUFLLENBQUMsSUFBTixDQUFXLGtGQUFYLEVBQStGLEVBQS9GLEVBQW1HLEtBQW5HO01BRFMsQ0FEWDtLQURGO0lBSUEsUUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLCtDQUFmO01BQ0EsU0FBQSxFQUFXLFNBQUMsS0FBRDtlQUNULEtBQUssQ0FBQyxJQUFOLENBQVcsd0dBQVgsRUFBcUgsRUFBckgsRUFBeUgsS0FBekg7TUFEUyxDQURYO0tBTEY7O0FBaEJGIiwic291cmNlc0NvbnRlbnQiOlsidm0gPSByZXF1aXJlICd2bSdcbm9zID0gcmVxdWlyZSAnb3MnXG5cbiMjI1xuICA9PSBBVE9NLVRFUk1JTkFMLVBBTkVMICBVSSBQTFVHSU4gPT1cblxuICBBdG9tLXRlcm1pbmFsLXBhbmVsIGJ1aWx0aW4gcGx1Z2luIHYxLjAuMFxuICAtaXNpczk3XG5cbiAgQ29udGFpbnMgY29tbWFuZHMgZm9yIGNyZWF0aW5nIHVzZXIgaW50ZXJmYWNlIGNvbXBvbmVudHNcbiAgKGUuZy4gYmFycyBldGMuKVxuXG4gIE1JVCBMaWNlbnNlXG4gIEZlZWwgZnJlZSB0byBkbyBhbnl0aGluZyB3aXRoIHRoaXMgZmlsZS5cbiMjI1xubW9kdWxlLmV4cG9ydHMgPVxuICBcInVpLWNsb2NrXCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkRpc3BsYXlzIHRoZSBkeW5hbWljIGNsb2NrLlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSkgLT5cbiAgICAgIHN0YXRlLmV4ZWMgXCJlY2hvICUocmF3KSAlKGR5bmFtaWMpICUoXiNGRjg1MUIpICUoaG91cnMxMik6JShtaW51dGVzKTolKHNlY29uZHMpICUoYW1wbSkgJSheKVwiLCBbXSwgc3RhdGVcbiAgXCJ1aS1tZW1cIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGlzcGxheXMgdGhlIGR5bmFtaWMgbWVtb3J5IHVzYWdlIGluZm9ybWF0aW9uXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlKSAtPlxuICAgICAgc3RhdGUuZXhlYyBcImVjaG8gJShyYXcpICUoZHluYW1pYykgJSheI0ZGODUxQikgRnJlZSBtZW1vcnkvYXZhaWxhYmxlIG1lbW9yeTogJShvcy5mcmVlbWVtKUIgLyAlKG9zLnRvdGFsbWVtKUIgJSheKVwiLCBbXSwgc3RhdGVcbiJdfQ==
