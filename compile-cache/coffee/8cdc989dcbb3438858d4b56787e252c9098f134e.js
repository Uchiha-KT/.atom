
/*
  Atom-terminal-panel
  Copyright by isis97
  MIT licensed

  Class containing all builtin commands.
 */

(function() {
  var core;

  core = include('atp-core');

  module.exports = {
    "encode": {
      "params": "[encoding standard]",
      "deprecated": true,
      "description": "Change encoding.",
      "command": function(state, args) {
        var encoding;
        encoding = args[0];
        state.streamsEncoding = encoding;
        state.message('Changed encoding to ' + encoding);
        return null;
      }
    },
    "ls": {
      "description": "Lists files in the current directory.",
      "command": function(state, args) {
        state.commandLineNotCounted();
        if (!state.ls(args)) {
          return 'The directory is inaccessible.';
          return null;
        }
      }
    },
    "clear": {
      "description": "Clears the console output.",
      "command": function(state, args) {
        state.commandLineNotCounted();
        state.clear();
        return null;
      }
    },
    "echo": {
      "params": "[text]...",
      "description": "Prints the message to the output.",
      "command": function(state, args) {
        if (args != null) {
          state.message(args.join(' ') + '\n');
          return null;
        } else {
          state.message('\n');
          return null;
        }
      }
    },
    "print": {
      "params": "[text]...",
      "description": "Stringifies given parameters.",
      "command": function(state, args) {
        return JSON.stringify(args);
      }
    },
    "cd": {
      "params": "[directory]",
      "description": "Moves to the specified directory.",
      "command": function(state, args) {
        return state.cd(args);
      }
    },
    "new": {
      "description": "Creates a new file and opens it in the editor view.",
      "command": function(state, args) {
        var file_name, file_path;
        if (args === null || args === void 0) {
          atom.workspaceView.trigger('application:new-file');
          return null;
        }
        file_name = state.util.replaceAll('\"', '', args[0]);
        if (file_name === null || file_name === void 0) {
          atom.workspaceView.trigger('application:new-file');
          return null;
        } else {
          file_path = state.resolvePath(file_name);
          fs.closeSync(fs.openSync(file_path, 'w'));
          state.delay(function() {
            return atom.workspaceView.open(file_path);
          });
          return state.consoleLink(file_path);
        }
      }
    },
    "rm": {
      "params": "[file]",
      "description": "Removes the given file.",
      "command": function(state, args) {
        var filepath;
        filepath = state.resolvePath(args[0]);
        fs.unlink(filepath, function(e) {});
        return state.consoleLink(filepath);
      }
    },
    "memdump": {
      "description": "Displays a list of all available internally stored commands.",
      "command": function(state, args) {
        return state.getLocalCommandsMemdump();
      }
    },
    "?": {
      "description": "Displays a list of all available internally stored commands.",
      "command": function(state, args) {
        return state.exec('memdump', null, state);
      }
    },
    "exit": {
      "description": "Destroys the terminal session.",
      "command": function(state, args) {
        return state.destroy();
      }
    },
    "update": {
      "description": "Reloads the terminal configuration from terminal-commands.json",
      "command": function(state, args) {
        core.reload();
        return (state.consoleLabel('info', 'info')) + (state.consoleText('info', 'The console settings were reloaded'));
      }
    },
    "reload": {
      "description": "Reloads the atom window.",
      "command": function(state, args) {
        return atom.reload();
      }
    },
    "edit": {
      "params": "[file]",
      "description": "Opens the specified file in the editor view.",
      "command": function(state, args) {
        var file_name;
        file_name = state.resolvePath(args[0]);
        state.delay(function() {
          return atom.workspaceView.open(file_name);
        });
        return state.consoleLink(file_name);
      }
    },
    "link": {
      "params": "[file/directory]",
      "description": "Displays interactive link to the given file/directory.",
      "command": function(state, args) {
        var file_name;
        file_name = state.resolvePath(args[0]);
        return state.consoleLink(file_name);
      }
    },
    "l": {
      "params": "[file/directory]",
      "description": "Displays interactive link to the given file/directory.",
      "command": function(state, args) {
        return state.exec('link ' + args[0], null, state);
      }
    },
    "info": {
      "description": "Prints the welcome message to the screen.",
      "command": function(state, args) {
        state.clear();
        state.showInitMessage(true);
        return null;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJtaW5hbC1wYW5lbC9saWIvYXRwLWJ1aWx0aW5zLWNvbW1hbmRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7O0FBQUE7QUFBQSxNQUFBOztFQVFBLElBQUEsR0FBTyxPQUFBLENBQVEsVUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUNFO01BQUEsUUFBQSxFQUFVLHFCQUFWO01BQ0EsWUFBQSxFQUFjLElBRGQ7TUFFQSxhQUFBLEVBQWUsa0JBRmY7TUFHQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNULFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSyxDQUFBLENBQUE7UUFDaEIsS0FBSyxDQUFDLGVBQU4sR0FBd0I7UUFDeEIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxzQkFBQSxHQUF1QixRQUFyQztBQUNBLGVBQU87TUFKRSxDQUhYO0tBREY7SUFTQSxJQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsdUNBQWY7TUFDQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNULEtBQUssQ0FBQyxxQkFBTixDQUFBO1FBQ0EsSUFBRyxDQUFJLEtBQUssQ0FBQyxFQUFOLENBQVMsSUFBVCxDQUFQO0FBQ0UsaUJBQU87QUFDUCxpQkFBTyxLQUZUOztNQUZTLENBRFg7S0FWRjtJQWdCQSxPQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsNEJBQWY7TUFDQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNULEtBQUssQ0FBQyxxQkFBTixDQUFBO1FBQ0EsS0FBSyxDQUFDLEtBQU4sQ0FBQTtBQUNBLGVBQU87TUFIRSxDQURYO0tBakJGO0lBc0JBLE1BQUEsRUFDRTtNQUFBLFFBQUEsRUFBVSxXQUFWO01BQ0EsYUFBQSxFQUFlLG1DQURmO01BRUEsU0FB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RUEsU0FBQSxFQUFXLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFDVCxlQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBQSxHQUFRLElBQUssQ0FBQSxDQUFBLENBQXhCLEVBQTRCLElBQTVCLEVBQWtDLEtBQWxDO01BREUsQ0FGWDtLQWxHRjtJQXNHQSxNQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsMkNBQWY7TUFDQSxTQUFBLEVBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNULEtBQUssQ0FBQyxLQUFOLENBQUE7UUFDQSxLQUFLLENBQUMsZUFBTixDQUFzQixJQUF0QjtBQUNBLGVBQU87TUFIRSxDQURYO0tBdkdGOztBQVhGIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIEF0b20tdGVybWluYWwtcGFuZWxcbiAgQ29weXJpZ2h0IGJ5IGlzaXM5N1xuICBNSVQgbGljZW5zZWRcblxuICBDbGFzcyBjb250YWluaW5nIGFsbCBidWlsdGluIGNvbW1hbmRzLlxuIyMjXG5cbmNvcmUgPSBpbmNsdWRlICdhdHAtY29yZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBcImVuY29kZVwiOlxuICAgIFwicGFyYW1zXCI6IFwiW2VuY29kaW5nIHN0YW5kYXJkXVwiXG4gICAgXCJkZXByZWNhdGVkXCI6IHRydWVcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ2hhbmdlIGVuY29kaW5nLlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgZW5jb2RpbmcgPSBhcmdzWzBdXG4gICAgICBzdGF0ZS5zdHJlYW1zRW5jb2RpbmcgPSBlbmNvZGluZ1xuICAgICAgc3RhdGUubWVzc2FnZSAnQ2hhbmdlZCBlbmNvZGluZyB0byAnK2VuY29kaW5nXG4gICAgICByZXR1cm4gbnVsbFxuICBcImxzXCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkxpc3RzIGZpbGVzIGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeS5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIHN0YXRlLmNvbW1hbmRMaW5lTm90Q291bnRlZCgpXG4gICAgICBpZiBub3Qgc3RhdGUubHMgYXJnc1xuICAgICAgICByZXR1cm4gJ1RoZSBkaXJlY3RvcnkgaXMgaW5hY2Nlc3NpYmxlLidcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgXCJjbGVhclwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJDbGVhcnMgdGhlIGNvbnNvbGUgb3V0cHV0LlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgc3RhdGUuY29tbWFuZExpbmVOb3RDb3VudGVkKClcbiAgICAgIHN0YXRlLmNsZWFyKClcbiAgICAgIHJldHVybiBudWxsXG4gIFwiZWNob1wiOlxuICAgIFwicGFyYW1zXCI6IFwiW3RleHRdLi4uXCJcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUHJpbnRzIHRoZSBtZXNzYWdlIHRvIHRoZSBvdXRwdXQuXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICBpZiBhcmdzP1xuICAgICAgICBzdGF0ZS5tZXNzYWdlIGFyZ3Muam9pbignICcpICsgJ1xcbidcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIGVsc2VcbiAgICAgICAgc3RhdGUubWVzc2FnZSAnXFxuJ1xuICAgICAgICByZXR1cm4gbnVsbFxuICBcInByaW50XCI6XG4gICAgXCJwYXJhbXNcIjogXCJbdGV4dF0uLi5cIlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdHJpbmdpZmllcyBnaXZlbiBwYXJhbWV0ZXJzLlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPiByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJncylcbiAgXCJjZFwiOlxuICAgIFwicGFyYW1zXCI6IFwiW2RpcmVjdG9yeV1cIlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJNb3ZlcyB0byB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT4gc3RhdGUuY2QgYXJnc1xuICBcIm5ld1wiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJDcmVhdGVzIGEgbmV3IGZpbGUgYW5kIG9wZW5zIGl0IGluIHRoZSBlZGl0b3Igdmlldy5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIGlmIGFyZ3MgPT0gbnVsbCB8fCBhcmdzID09IHVuZGVmaW5lZFxuICAgICAgICBhdG9tLndvcmtzcGFjZVZpZXcudHJpZ2dlciAnYXBwbGljYXRpb246bmV3LWZpbGUnXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICBmaWxlX25hbWUgPSBzdGF0ZS51dGlsLnJlcGxhY2VBbGwgJ1xcXCInLCAnJywgYXJnc1swXVxuICAgICAgaWYgZmlsZV9uYW1lID09IG51bGwgfHwgZmlsZV9uYW1lID09IHVuZGVmaW5lZFxuICAgICAgICBhdG9tLndvcmtzcGFjZVZpZXcudHJpZ2dlciAnYXBwbGljYXRpb246bmV3LWZpbGUnXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICBlbHNlXG4gICAgICAgIGZpbGVfcGF0aCA9IHN0YXRlLnJlc29sdmVQYXRoIGZpbGVfbmFtZVxuICAgICAgICBmcy5jbG9zZVN5bmMoZnMub3BlblN5bmMoZmlsZV9wYXRoLCAndycpKVxuICAgICAgICBzdGF0ZS5kZWxheSAoKSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlVmlldy5vcGVuIGZpbGVfcGF0aFxuICAgICAgICByZXR1cm4gc3RhdGUuY29uc29sZUxpbmsgZmlsZV9wYXRoXG4gIFwicm1cIjpcbiAgICBcInBhcmFtc1wiOiBcIltmaWxlXVwiXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlJlbW92ZXMgdGhlIGdpdmVuIGZpbGUuXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICBmaWxlcGF0aCA9IHN0YXRlLnJlc29sdmVQYXRoIGFyZ3NbMF1cbiAgICAgIGZzLnVubGluayBmaWxlcGF0aCwgKGUpIC0+IHJldHVyblxuICAgICAgcmV0dXJuIHN0YXRlLmNvbnNvbGVMaW5rIGZpbGVwYXRoXG4gIFwibWVtZHVtcFwiOlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJEaXNwbGF5cyBhIGxpc3Qgb2YgYWxsIGF2YWlsYWJsZSBpbnRlcm5hbGx5IHN0b3JlZCBjb21tYW5kcy5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT4gcmV0dXJuIHN0YXRlLmdldExvY2FsQ29tbWFuZHNNZW1kdW1wKClcbiAgXCI/XCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkRpc3BsYXlzIGEgbGlzdCBvZiBhbGwgYXZhaWxhYmxlIGludGVybmFsbHkgc3RvcmVkIGNvbW1hbmRzLlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgcmV0dXJuIHN0YXRlLmV4ZWMgJ21lbWR1bXAnLCBudWxsLCBzdGF0ZVxuICBcImV4aXRcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGVzdHJveXMgdGhlIHRlcm1pbmFsIHNlc3Npb24uXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICBzdGF0ZS5kZXN0cm95KClcbiAgXCJ1cGRhdGVcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmVsb2FkcyB0aGUgdGVybWluYWwgY29uZmlndXJhdGlvbiBmcm9tIHRlcm1pbmFsLWNvbW1hbmRzLmpzb25cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIGNvcmUucmVsb2FkKClcbiAgICAgIHJldHVybiAoc3RhdGUuY29uc29sZUxhYmVsICdpbmZvJywgJ2luZm8nKSArIChzdGF0ZS5jb25zb2xlVGV4dCAnaW5mbycsICdUaGUgY29uc29sZSBzZXR0aW5ncyB3ZXJlIHJlbG9hZGVkJylcbiAgXCJyZWxvYWRcIjpcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmVsb2FkcyB0aGUgYXRvbSB3aW5kb3cuXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICBhdG9tLnJlbG9hZCgpXG4gIFwiZWRpdFwiOlxuICAgIFwicGFyYW1zXCI6IFwiW2ZpbGVdXCJcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiT3BlbnMgdGhlIHNwZWNpZmllZCBmaWxlIGluIHRoZSBlZGl0b3Igdmlldy5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIGZpbGVfbmFtZSA9IHN0YXRlLnJlc29sdmVQYXRoIGFyZ3NbMF1cbiAgICAgIHN0YXRlLmRlbGF5ICgpIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlVmlldy5vcGVuIChmaWxlX25hbWUpXG4gICAgICByZXR1cm4gc3RhdGUuY29uc29sZUxpbmsgZmlsZV9uYW1lXG4gIFwibGlua1wiOlxuICAgIFwicGFyYW1zXCI6IFwiW2ZpbGUvZGlyZWN0b3J5XVwiXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIkRpc3BsYXlzIGludGVyYWN0aXZlIGxpbmsgdG8gdGhlIGdpdmVuIGZpbGUvZGlyZWN0b3J5LlwiXG4gICAgXCJjb21tYW5kXCI6IChzdGF0ZSwgYXJncyktPlxuICAgICAgZmlsZV9uYW1lID0gc3RhdGUucmVzb2x2ZVBhdGggYXJnc1swXVxuICAgICAgcmV0dXJuIHN0YXRlLmNvbnNvbGVMaW5rIGZpbGVfbmFtZVxuICBcImxcIjpcbiAgICBcInBhcmFtc1wiOiBcIltmaWxlL2RpcmVjdG9yeV1cIlxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJEaXNwbGF5cyBpbnRlcmFjdGl2ZSBsaW5rIHRvIHRoZSBnaXZlbiBmaWxlL2RpcmVjdG9yeS5cIlxuICAgIFwiY29tbWFuZFwiOiAoc3RhdGUsIGFyZ3MpLT5cbiAgICAgIHJldHVybiBzdGF0ZS5leGVjICdsaW5rICcrYXJnc1swXSwgbnVsbCwgc3RhdGVcbiAgXCJpbmZvXCI6XG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlByaW50cyB0aGUgd2VsY29tZSBtZXNzYWdlIHRvIHRoZSBzY3JlZW4uXCJcbiAgICBcImNvbW1hbmRcIjogKHN0YXRlLCBhcmdzKS0+XG4gICAgICBzdGF0ZS5jbGVhcigpXG4gICAgICBzdGF0ZS5zaG93SW5pdE1lc3NhZ2UgdHJ1ZVxuICAgICAgcmV0dXJuIG51bGxcbiJdfQ==
