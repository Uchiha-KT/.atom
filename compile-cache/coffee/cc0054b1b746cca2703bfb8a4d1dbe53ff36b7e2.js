
/*
WakaTime
Description: Analytics for programmers.
Maintainer:  WakaTime <support@wakatime.com>
License:     BSD, see LICENSE for more details.
Website:     https://wakatime.com/
 */

(function() {
  var AdmZip, Logger, StatusBarTileView, checkCLI, cliLocation, debug, downloadFile, endsWith, enoughTimePassed, execFile, extractCLI, fileIsIgnored, finishActivation, formatDate, fs, getLatestCliVersion, getUserHome, ini, installCLI, installPython, isCLIInstalled, isCLILatest, isPythonInstalled, isValidApiKey, lastFile, lastHeartbeat, log, os, packageVersion, path, pluginReady, pythonLocation, removeCLI, request, rimraf, saveApiKey, sendHeartbeat, settingChangedHandler, setupConfigs, setupEventHandlers, statusBarIcon, unzip;

  log = null;

  packageVersion = null;

  lastHeartbeat = 0;

  lastFile = '';

  statusBarIcon = null;

  pluginReady = false;

  AdmZip = require('adm-zip');

  fs = require('fs');

  os = require('os');

  path = require('path');

  execFile = require('child_process').execFile;

  request = require('request');

  rimraf = require('rimraf');

  ini = require('ini');

  StatusBarTileView = require('./status-bar-tile-view');

  Logger = require('./logger');

  module.exports = {
    activate: function(state) {
      log = new Logger('WakaTime');
      if (atom.config.get('wakatime.debug')) {
        log.setLevel('DEBUG');
      }
      packageVersion = atom.packages.getLoadedPackage('wakatime').metadata.version;
      log.debug('Initializing WakaTime v' + packageVersion + '...');
      setupConfigs();
      this.settingChangedObserver = atom.config.observe('wakatime', settingChangedHandler);
      return isPythonInstalled(function(installed) {
        if (!installed) {
          if (os.type() === 'Windows_NT') {
            return installPython(checkCLI);
          } else {
            return window.alert('Please install Python (https://www.python.org/downloads/) and restart Atom to enable the WakaTime plugin.');
          }
        } else {
          return checkCLI();
        }
      });
    },
    consumeStatusBar: function(statusBar) {
      statusBarIcon = new StatusBarTileView();
      statusBarIcon.init();
      this.statusBarTile = statusBar != null ? statusBar.addRightTile({
        item: statusBarIcon,
        priority: 300
      }) : void 0;
      if (atom.config.get('wakatime.showStatusBarIcon')) {
        statusBarIcon.show();
      } else {
        statusBarIcon.hide();
      }
      if (pluginReady) {
        statusBarIcon.setTitle('WakaTime ready');
        return statusBarIcon.setStatus();
      }
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      if (statusBarIcon != null) {
        statusBarIcon.destroy();
      }
      return (ref1 = this.settingChangedObserver) != null ? ref1.dispose() : void 0;
    }
  };

  checkCLI = function() {
    var beenawhile, currentTime, hours, lastInit;
    if (!isCLIInstalled()) {
      return installCLI(function() {
        log.debug('Finished installing wakatime-cli.');
        return finishActivation();
      });
    } else {
      hours = 24;
      lastInit = atom.config.get('wakatime-hidden.lastInit');
      currentTime = Math.round((new Date).getTime() / 1000);
      beenawhile = parseInt(lastInit, 10) + 3600 * hours < currentTime;
      if ((lastInit == null) || beenawhile || atom.config.get('wakatime.debug')) {
        atom.config.set('wakatime-hidden.lastInit', currentTime);
        return isCLILatest(function(latest) {
          if (!latest) {
            return installCLI(function() {
              log.debug('Finished installing wakatime-cli.');
              return finishActivation();
            });
          } else {
            return finishActivation();
          }
        });
      } else {
        return finishActivation();
      }
    }
  };

  finishActivation = function() {
    pluginReady = true;
    setupEventHandlers();
    if (atom.config.get('wakatime.showStatusBarIcon')) {
      if (statusBarIcon != null) {
        statusBarIcon.show();
      }
    } else {
      if (statusBarIcon != null) {
        statusBarIcon.hide();
      }
    }
    if (statusBarIcon != null) {
      statusBarIcon.setTitle('WakaTime ready');
    }
    if (statusBarIcon != null) {
      statusBarIcon.setStatus();
    }
    return log.debug('Finished initializing WakaTime.');
  };

  settingChangedHandler = function(settings) {
    var apiKey;
    if (settings.showStatusBarIcon) {
      if (statusBarIcon != null) {
        statusBarIcon.show();
      }
    } else {
      if (statusBarIcon != null) {
        statusBarIcon.hide();
      }
    }
    if (atom.config.get('wakatime.debug')) {
      log.setLevel('DEBUG');
    } else {
      log.setLevel('INFO');
    }
    apiKey = settings.apikey;
    if (isValidApiKey(apiKey)) {
      atom.config.set('wakatime.apikey', '');
      atom.config.set('wakatime.apikey', 'Saved in your ~/.wakatime.cfg file');
      return saveApiKey(apiKey);
    }
  };

  saveApiKey = function(apiKey) {
    var configFile;
    configFile = path.join(getUserHome(), '.wakatime.cfg');
    return fs.readFile(configFile, 'utf-8', function(err, inp) {
      var base, base1, contents, currentKey, currentSection, found, j, len, line, parts, ref;
      if (err != null) {
        log.debug('Error: could not read wakatime config file');
      }
      if ((base = String.prototype).startsWith == null) {
        base.startsWith = function(s) {
          return this.slice(0, s.length) === s;
        };
      }
      if ((base1 = String.prototype).endsWith == null) {
        base1.endsWith = function(s) {
          return s === '' || this.slice(-s.length) === s;
        };
      }
      contents = [];
      currentSection = '';
      found = false;
      if (inp != null) {
        ref = inp.split('\n');
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
            if (currentSection === 'settings' && !found) {
              contents.push('api_key = ' + apiKey);
              found = true;
            }
            currentSection = line.trim().substring(1, line.trim().length - 1).toLowerCase();
            contents.push(line);
          } else if (currentSection === 'settings') {
            parts = line.split('=');
            currentKey = parts[0].trim();
            if (currentKey === 'api_key') {
              if (!found) {
                contents.push('api_key = ' + apiKey);
                found = true;
              }
            } else {
              contents.push(line);
            }
          } else {
            contents.push(line);
          }
        }
      }
      if (!found) {
        if (currentSection !== 'settings') {
          contents.push('[settings]');
        }
        contents.push('api_key = ' + apiKey);
      }
      return fs.writeFile(configFile, contents.join('\n'), {
        encoding: 'utf-8'
      }, function(err2) {
        var msg;
        if (err2 != null) {
          msg = 'Error: could not write to wakatime config file';
          log.error(msg);
          if (statusBarIcon != null) {
            statusBarIcon.setStatus('Error');
          }
          return statusBarIcon != null ? statusBarIcon.setTitle(msg) : void 0;
        }
      });
    });
  };

  getUserHome = function() {
    return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || '';
  };

  setupConfigs = function() {
    var configFile;
    configFile = path.join(getUserHome(), '.wakatime.cfg');
    return fs.readFile(configFile, 'utf-8', function(err, configContent) {
      var commonConfigs;
      if (err != null) {
        log.debug('Error: could not read wakatime config file');
        settingChangedHandler(atom.config.get('wakatime'));
        return;
      }
      commonConfigs = ini.decode(configContent);
      if ((commonConfigs != null) && (commonConfigs.settings != null) && isValidApiKey(commonConfigs.settings.api_key)) {
        atom.config.set('wakatime.apikey', '');
        return atom.config.set('wakatime.apikey', 'Saved in your ~/.wakatime.cfg file');
      } else {
        return settingChangedHandler(atom.config.get('wakatime'));
      }
    });
  };

  isValidApiKey = function(key) {
    var re;
    if (key == null) {
      return false;
    }
    re = new RegExp('^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$', 'i');
    return re.test(key);
  };

  enoughTimePassed = function(time) {
    return lastHeartbeat + 120000 < time;
  };

  setupEventHandlers = function(callback) {
    return atom.workspace.observeTextEditors(function(editor) {
      var buffer;
      try {
        buffer = editor.getBuffer();
        buffer.onDidSave(function(e) {
          var file, lineno;
          file = buffer.file;
          if ((file != null) && file) {
            lineno = null;
            if (editor.cursors.length > 0) {
              lineno = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
            }
            return sendHeartbeat(file, lineno, true);
          }
        });
        buffer.onDidChange(function(e) {
          var file, lineno;
          file = buffer.file;
          if ((file != null) && file) {
            lineno = null;
            if (editor.cursors.length > 0) {
              lineno = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
            }
            return sendHeartbeat(file, lineno);
          }
        });
        editor.onDidChangeCursorPosition(function(e) {
          var file, lineno;
          file = buffer.file;
          if ((file != null) && file) {
            lineno = null;
            if (editor.cursors.length > 0) {
              lineno = editor.cursors[0].getCurrentLineBufferRange().end.row + 1;
            }
            return sendHeartbeat(file, lineno);
          }
        });
      } catch (error1) {}
      if (callback != null) {
        return callback();
      }
    });
  };

  isPythonInstalled = function(callback) {
    return pythonLocation(function(result) {
      return callback(result != null);
    });
  };

  pythonLocation = function(callback, locations) {
    var args, i, location, pattern;
    if (global.cachedPythonLocation != null) {
      return callback(global.cachedPythonLocation);
    } else {
      if (locations == null) {
        locations = [__dirname + path.sep + 'python' + path.sep + 'pythonw', 'pythonw', 'python', '/usr/local/bin/python', '/usr/bin/python'];
        i = 26;
        while (i < 50) {
          locations.push('\\python' + i + '\\pythonw');
          locations.push('\\Python' + i + '\\pythonw');
          i++;
        }
      }
      args = ['--version'];
      if (locations.length === 0) {
        callback(null);
        return;
      }
      pattern = /\d+\.\d+/;
      location = locations[0];
      return execFile(location, args, function(error, stdout, stderr) {
        if (error == null) {
          if ((stdout != null) && stdout.match(pattern) || (stderr != null) && stderr.match(pattern)) {
            global.cachedPythonLocation = location;
            return callback(location);
          }
        } else {
          locations.splice(0, 1);
          return pythonLocation(callback, locations);
        }
      });
    }
  };

  installPython = function(callback) {
    var arch, pyVer, url, zipFile;
    pyVer = '3.5.2';
    arch = 'win32';
    if (os.arch().indexOf('x64') > -1) {
      arch = 'amd64';
    }
    url = 'https://www.python.org/ftp/python/' + pyVer + '/python-' + pyVer + '-embed-' + arch + '.zip';
    log.debug('downloading python...');
    if (statusBarIcon != null) {
      statusBarIcon.setStatus('downloading python...');
    }
    zipFile = __dirname + path.sep + 'python.zip';
    return downloadFile(url, zipFile, function() {
      log.debug('extracting python...');
      if (statusBarIcon != null) {
        statusBarIcon.setStatus('extracting python...');
      }
      return unzip(zipFile, __dirname + path.sep + 'python', function() {
        fs.unlink(zipFile);
        log.debug('Finished installing python.');
        if (callback != null) {
          return callback();
        }
      });
    });
  };

  isCLIInstalled = function() {
    return fs.existsSync(cliLocation());
  };

  isCLILatest = function(callback) {
    return pythonLocation(function(python) {
      var args;
      if (python != null) {
        args = [cliLocation(), '--version'];
        return execFile(python, args, function(error, stdout, stderr) {
          var currentVersion;
          if (error == null) {
            currentVersion = stderr.trim();
            log.debug('Current wakatime-cli version is ' + currentVersion);
            log.debug('Checking for updates to wakatime-cli...');
            return getLatestCliVersion(function(latestVersion) {
              if (currentVersion === latestVersion) {
                log.debug('wakatime-cli is up to date.');
                if (callback != null) {
                  return callback(true);
                }
              } else {
                if (latestVersion != null) {
                  log.debug('Found an updated wakatime-cli v' + latestVersion);
                  if (callback != null) {
                    return callback(false);
                  }
                } else {
                  log.debug('Unable to find latest wakatime-cli version from GitHub.');
                  if (callback != null) {
                    return callback(true);
                  }
                }
              }
            });
          } else {
            if (callback != null) {
              return callback(false);
            }
          }
        });
      } else {
        if (callback != null) {
          return callback(false);
        }
      }
    });
  };

  getLatestCliVersion = function(callback) {
    var url;
    url = 'https://raw.githubusercontent.com/wakatime/wakatime/master/wakatime/__about__.py';
    return request.get(url, function(error, response, body) {
      var j, len, line, match, re, ref, version;
      version = null;
      if (!error && response.statusCode === 200) {
        re = new RegExp(/__version_info__ = \('([0-9]+)', '([0-9]+)', '([0-9]+)'\)/g);
        ref = body.split('\n');
        for (j = 0, len = ref.length; j < len; j++) {
          line = ref[j];
          match = re.exec(line);
          if (match != null) {
            version = match[1] + '.' + match[2] + '.' + match[3];
          }
        }
      }
      if (callback != null) {
        return callback(version);
      }
    });
  };

  cliLocation = function() {
    var dir;
    dir = __dirname + path.sep + 'wakatime-master' + path.sep + 'wakatime' + path.sep + 'cli.py';
    return dir;
  };

  installCLI = function(callback) {
    var url, zipFile;
    log.debug('Downloading wakatime-cli...');
    if (statusBarIcon != null) {
      statusBarIcon.setStatus('downloading wakatime-cli...');
    }
    url = 'https://github.com/wakatime/wakatime/archive/master.zip';
    zipFile = __dirname + path.sep + 'wakatime-master.zip';
    return downloadFile(url, zipFile, function() {
      return extractCLI(zipFile, callback);
    });
  };

  extractCLI = function(zipFile, callback) {
    log.debug('Extracting wakatime-master.zip file...');
    if (statusBarIcon != null) {
      statusBarIcon.setStatus('extracting wakatime-cli...');
    }
    return removeCLI(function() {
      return unzip(zipFile, __dirname, callback);
    });
  };

  removeCLI = function(callback) {
    var e;
    if (fs.existsSync(__dirname + path.sep + 'wakatime-master')) {
      try {
        return rimraf(__dirname + path.sep + 'wakatime-master', function() {
          if (callback != null) {
            return callback();
          }
        });
      } catch (error1) {
        e = error1;
        log.warn(e);
        if (callback != null) {
          return callback();
        }
      }
    } else {
      if (callback != null) {
        return callback();
      }
    }
  };

  downloadFile = function(url, outputFile, callback) {
    var out, r;
    r = request(url);
    out = fs.createWriteStream(outputFile);
    r.pipe(out);
    return r.on('end', function() {
      return out.on('finish', function() {
        if (callback != null) {
          return callback();
        }
      });
    });
  };

  unzip = function(file, outputDir, callback) {
    var e, zip;
    if (fs.existsSync(file)) {
      try {
        zip = new AdmZip(file);
        return zip.extractAllTo(outputDir, true);
      } catch (error1) {
        e = error1;
        return log.warn(e);
      } finally {
        fs.unlink(file);
        if (callback != null) {
          callback();
        }
      }
    }
  };

  sendHeartbeat = function(file, lineno, isWrite) {
    var currentFile, time;
    if ((file.path == null) || file.path === void 0) {
      log.debug('Skipping file because path does not exist: ' + file.path);
      return;
    }
    if (fileIsIgnored(file.path)) {
      log.debug('Skipping file because path matches ignore pattern: ' + file.path);
      return;
    }
    time = Date.now();
    currentFile = file.path;
    if (isWrite || enoughTimePassed(time) || lastFile !== currentFile) {
      return pythonLocation(function(python) {
        var args, j, len, proc, realPath, ref, rootDir;
        if (python == null) {
          return;
        }
        args = [cliLocation(), '--file', currentFile, '--plugin', 'atom-wakatime/' + packageVersion];
        if (isWrite) {
          args.push('--write');
        }
        if (lineno != null) {
          args.push('--lineno');
          args.push(lineno);
        }
        if (atom.config.get('wakatime.debug')) {
          args.push('--verbose');
        }
        args.push('--config');
        args.push(path.join(getUserHome(), '.wakatime.cfg'));
        if (atom.project.contains(file.path)) {
          currentFile = file.path;
          ref = atom.project.rootDirectories;
          for (j = 0, len = ref.length; j < len; j++) {
            rootDir = ref[j];
            realPath = rootDir.realPath;
            if (currentFile.indexOf(realPath) > -1) {
              args.push('--alternate-project');
              args.push(path.basename(realPath));
              break;
            }
          }
        }
        log.debug(python + ' ' + args.join(' '));
        proc = execFile(python, args, function(error, stdout, stderr) {
          var msg, status, title, today;
          if (error != null) {
            if ((stderr != null) && stderr !== '') {
              log.warn(stderr);
            }
            if ((stdout != null) && stdout !== '') {
              log.warn(stdout);
            }
            if (proc.exitCode === 102) {
              msg = null;
              status = null;
              title = 'WakaTime Offline, coding activity will sync when online.';
            } else if (proc.exitCode === 103) {
              msg = 'An error occured while parsing ~/.wakatime.cfg. Check ~/.wakatime.log for more info.';
              status = 'Error';
              title = msg;
            } else if (proc.exitCode === 104) {
              msg = 'Invalid API Key. Make sure your API Key is correct!';
              status = 'Error';
              title = msg;
            } else {
              msg = error;
              status = 'Error';
              title = 'Unknown Error (' + proc.exitCode + '); Check your Dev Console and ~/.wakatime.log for more info.';
            }
            if (msg != null) {
              log.warn(msg);
            }
            if (statusBarIcon != null) {
              statusBarIcon.setStatus(status);
            }
            return statusBarIcon != null ? statusBarIcon.setTitle(title) : void 0;
          } else {
            if (statusBarIcon != null) {
              statusBarIcon.setStatus();
            }
            today = new Date();
            return statusBarIcon != null ? statusBarIcon.setTitle('Last heartbeat sent ' + formatDate(today)) : void 0;
          }
        });
        lastHeartbeat = time;
        return lastFile = file.path;
      });
    }
  };

  fileIsIgnored = function(file) {
    var ignore, j, len, pattern, patterns, re;
    if (endsWith(file, 'COMMIT_EDITMSG') || endsWith(file, 'PULLREQ_EDITMSG') || endsWith(file, 'MERGE_MSG') || endsWith(file, 'TAG_EDITMSG')) {
      return true;
    }
    patterns = atom.config.get('wakatime.ignore');
    if (patterns == null) {
      return true;
    }
    ignore = false;
    for (j = 0, len = patterns.length; j < len; j++) {
      pattern = patterns[j];
      re = new RegExp(pattern, 'gi');
      if (re.test(file)) {
        ignore = true;
        break;
      }
    }
    return ignore;
  };

  endsWith = function(str, suffix) {
    if ((str != null) && (suffix != null)) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
    return false;
  };

  formatDate = function(date) {
    var ampm, hour, minute, months;
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    ampm = 'AM';
    hour = date.getHours();
    if (hour > 11) {
      ampm = 'PM';
      hour = hour - 12;
    }
    if (hour === 0) {
      hour = 12;
    }
    minute = date.getMinutes();
    if (minute < 10) {
      minute = '0' + minute;
    }
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + hour + ':' + minute + ' ' + ampm;
  };

  debug = function(callback) {
    var e;
    if (fs.existsSync(__dirname + path.sep + 'wakatime-master')) {
      try {
        return rimraf(__dirname + path.sep + 'wakatime-master', function() {
          if (callback != null) {
            return callback();
          }
        });
      } catch (error1) {
        e = error1;
        log.warn(e);
        if (callback != null) {
          return callback();
        }
      }
    } else {
      if (callback != null) {
        return callback();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdWNoaWhhLy5hdG9tL3BhY2thZ2VzL3dha2F0aW1lL2xpYi93YWthdGltZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7OztBQUFBO0FBQUEsTUFBQTs7RUFTQSxHQUFBLEdBQU07O0VBQ04sY0FBQSxHQUFpQjs7RUFDakIsYUFBQSxHQUFnQjs7RUFDaEIsUUFBQSxHQUFXOztFQUNYLGFBQUEsR0FBZ0I7O0VBQ2hCLFdBQUEsR0FBYzs7RUFHZCxNQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0VBQ1QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsUUFBQSxHQUFXLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ3BDLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUVOLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsR0FBQSxHQUFVLElBQUEsTUFBQSxDQUFPLFVBQVA7TUFDVixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQkFBaEIsQ0FBSDtRQUNFLEdBQUcsQ0FBQyxRQUFKLENBQWEsT0FBYixFQURGOztNQUVBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixVQUEvQixDQUEwQyxDQUFDLFFBQVEsQ0FBQztNQUNyRSxHQUFHLENBQUMsS0FBSixDQUFVLHlCQUFBLEdBQTRCLGNBQTVCLEdBQTZDLEtBQXZEO01BQ0Es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Q0FBQyxVQUFILENBQWMsU0FBQSxHQUFZLElBQUksQ0FBQyxHQUFqQixHQUF1QixpQkFBckMsQ0FBSDtBQUNFO2VBQ0UsTUFBQSxDQUFPLFNBQUEsR0FBWSxJQUFJLENBQUMsR0FBakIsR0FBdUIsaUJBQTlCLEVBQWlELFNBQUE7VUFDL0MsSUFBRyxnQkFBSDttQkFDRSxRQUFBLENBQUEsRUFERjs7UUFEK0MsQ0FBakQsRUFERjtPQUFBLGNBQUE7UUFLTTtRQUNKLEdBQUcsQ0FBQyxJQUFKLENBQVMsQ0FBVDtRQUNBLElBQUcsZ0JBQUg7aUJBQ0UsUUFBQSxDQUFBLEVBREY7U0FQRjtPQURGO0tBQUEsTUFBQTtNQVdFLElBQUcsZ0JBQUg7ZUFDRSxRQUFBLENBQUEsRUFERjtPQVhGOztFQURNO0FBamdCUiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuV2FrYVRpbWVcbkRlc2NyaXB0aW9uOiBBbmFseXRpY3MgZm9yIHByb2dyYW1tZXJzLlxuTWFpbnRhaW5lcjogIFdha2FUaW1lIDxzdXBwb3J0QHdha2F0aW1lLmNvbT5cbkxpY2Vuc2U6ICAgICBCU0QsIHNlZSBMSUNFTlNFIGZvciBtb3JlIGRldGFpbHMuXG5XZWJzaXRlOiAgICAgaHR0cHM6Ly93YWthdGltZS5jb20vXG4jIyNcblxuIyBwYWNrYWdlLWdsb2JhbCBhdHRyaWJ1dGVzXG5sb2cgPSBudWxsXG5wYWNrYWdlVmVyc2lvbiA9IG51bGxcbmxhc3RIZWFydGJlYXQgPSAwXG5sYXN0RmlsZSA9ICcnXG5zdGF0dXNCYXJJY29uID0gbnVsbFxucGx1Z2luUmVhZHkgPSBmYWxzZVxuXG4jIHBhY2thZ2UgZGVwZW5kZW5jaWVzXG5BZG1aaXAgPSByZXF1aXJlICdhZG0temlwJ1xuZnMgPSByZXF1aXJlICdmcydcbm9zID0gcmVxdWlyZSAnb3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmV4ZWNGaWxlID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLmV4ZWNGaWxlXG5yZXF1ZXN0ID0gcmVxdWlyZSAncmVxdWVzdCdcbnJpbXJhZiA9IHJlcXVpcmUgJ3JpbXJhZidcbmluaSA9IHJlcXVpcmUgJ2luaSdcblxuU3RhdHVzQmFyVGlsZVZpZXcgPSByZXF1aXJlICcuL3N0YXR1cy1iYXItdGlsZS12aWV3J1xuTG9nZ2VyID0gcmVxdWlyZSAnLi9sb2dnZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBsb2cgPSBuZXcgTG9nZ2VyKCdXYWthVGltZScpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICd3YWthdGltZS5kZWJ1ZydcbiAgICAgIGxvZy5zZXRMZXZlbCgnREVCVUcnKVxuICAgIHBhY2thZ2VWZXJzaW9uID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCd3YWthdGltZScpLm1ldGFkYXRhLnZlcnNpb25cbiAgICBsb2cuZGVidWcgJ0luaXRpYWxpemluZyBXYWthVGltZSB2JyArIHBhY2thZ2VWZXJzaW9uICsgJy4uLidcbiAgICBzZXR1cENvbmZpZ3MoKVxuICAgIEBzZXR0aW5nQ2hhbmdlZE9ic2VydmVyID0gYXRvbS5jb25maWcub2JzZXJ2ZSAnd2FrYXRpbWUnLCBzZXR0aW5nQ2hhbmdlZEhhbmRsZXJcblxuICAgIGlzUHl0aG9uSW5zdGFsbGVkKChpbnN0YWxsZWQpIC0+XG4gICAgICBpZiBub3QgaW5zdGFsbGVkXG4gICAgICAgIGlmIG9zLnR5cGUoKSBpcyAnV2luZG93c19OVCdcbiAgICAgICAgICBpbnN0YWxsUHl0aG9uKGNoZWNrQ0xJKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2UgaW5zdGFsbCBQeXRob24gKGh0dHBzOi8vd3d3LnB5dGhvbi5vcmcvZG93bmxvYWRzLykgYW5kIHJlc3RhcnQgQXRvbSB0byBlbmFibGUgdGhlIFdha2FUaW1lIHBsdWdpbi4nKVxuICAgICAgZWxzZVxuICAgICAgICBjaGVja0NMSSgpXG4gICAgKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgc3RhdHVzQmFySWNvbiA9IG5ldyBTdGF0dXNCYXJUaWxlVmlldygpXG4gICAgc3RhdHVzQmFySWNvbi5pbml0KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IHN0YXR1c0Jhcj8uYWRkUmlnaHRUaWxlKGl0ZW06IHN0YXR1c0Jhckljb24sIHByaW9yaXR5OiAzMDApXG5cbiAgICAjIHNldCBzdGF0dXMgYmFyIGljb24gdmlzaWJpbGl0eVxuICAgIGlmIGF0b20uY29uZmlnLmdldCAnd2FrYXRpbWUuc2hvd1N0YXR1c0Jhckljb24nXG4gICAgICBzdGF0dXNCYXJJY29uLnNob3coKVxuICAgIGVsc2VcbiAgICAgIHN0YXR1c0Jhckljb24uaGlkZSgpXG5cbiAgICBpZiBwbHVnaW5SZWFkeVxuICAgICAgc3RhdHVzQmFySWNvbi5zZXRUaXRsZSgnV2FrYVRpbWUgcmVhZHknKVxuICAgICAgc3RhdHVzQmFySWNvbi5zZXRTdGF0dXMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIHN0YXR1c0Jhckljb24/LmRlc3Ryb3koKVxuICAgIEBzZXR0aW5nQ2hhbmdlZE9ic2VydmVyPy5kaXNwb3NlKClcblxuY2hlY2tDTEkgPSAoKSAtPlxuICBpZiBub3QgaXNDTElJbnN0YWxsZWQoKVxuICAgIGluc3RhbGxDTEkoLT5cbiAgICAgIGxvZy5kZWJ1ZyAnRmluaXNoZWQgaW5zdGFsbGluZyB3YWthdGltZS1jbGkuJ1xuICAgICAgZmluaXNoQWN0aXZhdGlvbigpXG4gICAgKVxuICBlbHNlXG5cbiAgICAjIG9ubHkgY2hlY2sgZm9yIHVwZGF0ZXMgdG8gd2FrYXRpbWUtY2xpIGV2ZXJ5IDI0IGhvdXJzXG4gICAgaG91cnMgPSAyNFxuXG4gICAgbGFzdEluaXQgPSBhdG9tLmNvbmZpZy5nZXQgJ3dha2F0aW1lLWhpZGRlbi5sYXN0SW5pdCdcbiAgICBjdXJyZW50VGltZSA9IE1hdGgucm91bmQgKG5ldyBEYXRlKS5nZXRUaW1lKCkgLyAxMDAwXG4gICAgYmVlbmF3aGlsZSA9IHBhcnNlSW50KGxhc3RJbml0LCAxMCkgKyAzNjAwICogaG91cnMgPCBjdXJyZW50VGltZVxuXG4gICAgaWYgbm90IGxhc3RJbml0PyBvciBiZWVuYXdoaWxlIG9yIGF0b20uY29uZmlnLmdldCgnd2FrYXRpbWUuZGVidWcnKVxuICAgICAgYXRvbS5jb25maWcuc2V0ICd3YWthdGltZS1oaWRkZW4ubGFzdEluaXQnLCBjdXJyZW50VGltZVxuICAgICAgaXNDTElMYXRlc3QoKGxhdGVzdCkgLT5cbiAgICAgICAgaWYgbm90IGxhdGVzdFxuICAgICAgICAgIGluc3RhbGxDTEkoLT5cbiAgICAgICAgICAgIGxvZy5kZWJ1ZyAnRmluaXNoZWQgaW5zdGFsbGluZyB3YWthdGltZS1jbGkuJ1xuICAgICAgICAgICAgZmluaXNoQWN0aXZhdGlvbigpXG4gICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmluaXNoQWN0aXZhdGlvbigpXG4gICAgICApXG4gICAgZWxzZVxuICAgICAgZmluaXNoQWN0aXZhdGlvbigpXG5cbmZpbmlzaEFjdGl2YXRpb24gPSAoKSAtPlxuICBwbHVnaW5SZWFkeSA9IHRydWVcbiAgc2V0dXBFdmVudEhhbmRsZXJzKClcblxuICAjIHNldCBzdGF0dXMgYmFyIGljb24gdmlzaWJpbGl0eVxuICBpZiBhdG9tLmNvbmZpZy5nZXQgJ3dha2F0aW1lLnNob3dTdGF0dXNCYXJJY29uJ1xuICAgIHN0YXR1c0Jhckljb24/LnNob3coKVxuICBlbHNlXG4gICAgc3RhdHVzQmFySWNvbj8uaGlkZSgpXG5cbiAgc3RhdHVzQmFySWNvbj8uc2V0VGl0bGUoJ1dha2FUaW1lIHJlYWR5JylcbiAgc3RhdHVzQmFySWNvbj8uc2V0U3RhdHVzKClcbiAgbG9nLmRlYnVnICdGaW5pc2hlZCBpbml0aWFsaXppbmcgV2FrYVRpbWUuJ1xuXG5zZXR0aW5nQ2hhbmdlZEhhbmRsZXIgPSAoc2V0dGluZ3MpIC0+XG4gIGlmIHNldHRpbmdzLnNob3dTdGF0dXNCYXJJY29uXG4gICAgc3RhdHVzQmFySWNvbj8uc2hvdygpXG4gIGVsc2VcbiAgICBzdGF0dXNCYXJJY29uPy5oaWRlKClcbiAgaWYgYXRvbS5jb25maWcuZ2V0ICd3YWthdGltZS5kZWJ1ZydcbiAgICBsb2cuc2V0TGV2ZWwoJ0RFQlVHJylcbiAgZWxzZVxuICAgIGxvZy5zZXRMZXZlbCgnSU5GTycpXG4gIGFwaUtleSA9IHNldHRpbmdzLmFwaWtleVxuICBpZiBpc1ZhbGlkQXBpS2V5KGFwaUtleSlcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3dha2F0aW1lLmFwaWtleScsICcnICMgY2xlYXIgc2V0dGluZyBzbyBpdCB1cGRhdGVzIGluIFVJXG4gICAgYXRvbS5jb25maWcuc2V0ICd3YWthdGltZS5hcGlrZXknLCAnU2F2ZWQgaW4geW91ciB+Ly53YWthdGltZS5jZmcgZmlsZSdcbiAgICBzYXZlQXBpS2V5IGFwaUtleVxuXG5zYXZlQXBpS2V5ID0gKGFwaUtleSkgLT5cbiAgY29uZmlnRmlsZSA9IHBhdGguam9pbiBnZXRVc2VySG9tZSgpLCAnLndha2F0aW1lLmNmZydcbiAgZnMucmVhZEZpbGUgY29uZmlnRmlsZSwgJ3V0Zi04JywgKGVyciwgaW5wKSAtPlxuICAgIGlmIGVycj9cbiAgICAgIGxvZy5kZWJ1ZyAnRXJyb3I6IGNvdWxkIG5vdCByZWFkIHdha2F0aW1lIGNvbmZpZyBmaWxlJ1xuICAgIFN0cmluZzo6c3RhcnRzV2l0aCA/PSAocykgLT4gQHNsaWNlKDAsIHMubGVuZ3RoKSA9PSBzXG4gICAgU3RyaW5nOjplbmRzV2l0aCAgID89IChzKSAtPiBzID09ICcnIG9yIEBzbGljZSgtcy5sZW5ndGgpID09IHNcbiAgICBjb250ZW50cyA9IFtdXG4gICAgY3VycmVudFNlY3Rpb24gPSAnJ1xuICAgIGZvdW5kID0gZmFsc2VcbiAgICBpZiBpbnA/XG4gICAgICBmb3IgbGluZSBpbiBpbnAuc3BsaXQoJ1xcbicpXG4gICAgICAgIGlmIGxpbmUudHJpbSgpLnN0YXJ0c1dpdGgoJ1snKSBhbmQgbGluZS50cmltKCkuZW5kc1dpdGgoJ10nKVxuICAgICAgICAgIGlmIGN1cnJlbnRTZWN0aW9uID09ICdzZXR0aW5ncycgYW5kIG5vdCBmb3VuZFxuICAgICAgICAgICAgY29udGVudHMucHVzaCgnYXBpX2tleSA9ICcgKyBhcGlLZXkpXG4gICAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICBjdXJyZW50U2VjdGlvbiA9IGxpbmUudHJpbSgpLnN1YnN0cmluZygxLCBsaW5lLnRyaW0oKS5sZW5ndGggLSAxKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgY29udGVudHMucHVzaChsaW5lKVxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRTZWN0aW9uID09ICdzZXR0aW5ncydcbiAgICAgICAgICBwYXJ0cyA9IGxpbmUuc3BsaXQoJz0nKVxuICAgICAgICAgIGN1cnJlbnRLZXkgPSBwYXJ0c1swXS50cmltKClcbiAgICAgICAgICBpZiBjdXJyZW50S2V5ID09ICdhcGlfa2V5J1xuICAgICAgICAgICAgaWYgbm90IGZvdW5kXG4gICAgICAgICAgICAgIGNvbnRlbnRzLnB1c2goJ2FwaV9rZXkgPSAnICsgYXBpS2V5KVxuICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb250ZW50cy5wdXNoKGxpbmUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb250ZW50cy5wdXNoKGxpbmUpXG5cbiAgICBpZiBub3QgZm91bmRcbiAgICAgIGlmIGN1cnJlbnRTZWN0aW9uICE9ICdzZXR0aW5ncydcbiAgICAgICAgY29udGVudHMucHVzaCgnW3NldHRpbmdzXScpXG4gICAgICBjb250ZW50cy5wdXNoKCdhcGlfa2V5ID0gJyArIGFwaUtleSlcblxuICAgIGZzLndyaXRlRmlsZSBjb25maWdGaWxlLCBjb250ZW50cy5qb2luKCdcXG4nKSwge2VuY29kaW5nOiAndXRmLTgnfSwgKGVycjIpIC0+XG4gICAgICBpZiBlcnIyP1xuICAgICAgICBtc2cgPSAnRXJyb3I6IGNvdWxkIG5vdCB3cml0ZSB0byB3YWthdGltZSBjb25maWcgZmlsZSdcbiAgICAgICAgbG9nLmVycm9yIG1zZ1xuICAgICAgICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoJ0Vycm9yJylcbiAgICAgICAgc3RhdHVzQmFySWNvbj8uc2V0VGl0bGUobXNnKVxuXG5nZXRVc2VySG9tZSA9IC0+XG4gIHByb2Nlc3MuZW52W2lmIHByb2Nlc3MucGxhdGZvcm0gPT0gJ3dpbjMyJyB0aGVuICdVU0VSUFJPRklMRScgZWxzZSAnSE9NRSddIHx8ICcnXG5cbnNldHVwQ29uZmlncyA9IC0+XG4gIGNvbmZpZ0ZpbGUgPSBwYXRoLmpvaW4gZ2V0VXNlckhvbWUoKSwgJy53YWthdGltZS5jZmcnXG4gIGZzLnJlYWRGaWxlIGNvbmZpZ0ZpbGUsICd1dGYtOCcsIChlcnIsIGNvbmZpZ0NvbnRlbnQpIC0+XG4gICAgaWYgZXJyP1xuICAgICAgbG9nLmRlYnVnICdFcnJvcjogY291bGQgbm90IHJlYWQgd2FrYXRpbWUgY29uZmlnIGZpbGUnXG4gICAgICBzZXR0aW5nQ2hhbmdlZEhhbmRsZXIgYXRvbS5jb25maWcuZ2V0KCd3YWthdGltZScpXG4gICAgICByZXR1cm5cbiAgICBjb21tb25Db25maWdzID0gaW5pLmRlY29kZSBjb25maWdDb250ZW50XG4gICAgaWYgY29tbW9uQ29uZmlncz8gYW5kIGNvbW1vbkNvbmZpZ3Muc2V0dGluZ3M/IGFuZCBpc1ZhbGlkQXBpS2V5KGNvbW1vbkNvbmZpZ3Muc2V0dGluZ3MuYXBpX2tleSlcbiAgICAgIGF0b20uY29uZmlnLnNldCAnd2FrYXRpbWUuYXBpa2V5JywgJycgIyBjbGVhciBzZXR0aW5nIHNvIGl0IHVwZGF0ZXMgaW4gVUlcbiAgICAgIGF0b20uY29uZmlnLnNldCAnd2FrYXRpbWUuYXBpa2V5JywgJ1NhdmVkIGluIHlvdXIgfi8ud2FrYXRpbWUuY2ZnIGZpbGUnXG4gICAgZWxzZVxuICAgICAgc2V0dGluZ0NoYW5nZWRIYW5kbGVyIGF0b20uY29uZmlnLmdldCgnd2FrYXRpbWUnKVxuXG5pc1ZhbGlkQXBpS2V5ID0gKGtleSkgLT5cbiAgaWYgbm90IGtleT9cbiAgICByZXR1cm4gZmFsc2VcbiAgcmUgPSBuZXcgUmVnRXhwKCdeWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tNFswLTlBLUZdezN9LVs4OUFCXVswLTlBLUZdezN9LVswLTlBLUZdezEyfSQnLCAnaScpXG4gIHJldHVybiByZS50ZXN0IGtleVxuXG5lbm91Z2hUaW1lUGFzc2VkID0gKHRpbWUpIC0+XG4gIHJldHVybiBsYXN0SGVhcnRiZWF0ICsgMTIwMDAwIDwgdGltZVxuXG5zZXR1cEV2ZW50SGFuZGxlcnMgPSAoY2FsbGJhY2spIC0+XG4gIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSAtPlxuICAgIHRyeVxuICAgICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICBidWZmZXIub25EaWRTYXZlIChlKSAtPlxuICAgICAgICBmaWxlID0gYnVmZmVyLmZpbGVcbiAgICAgICAgaWYgZmlsZT8gYW5kIGZpbGVcbiAgICAgICAgICBsaW5lbm8gPSBudWxsXG4gICAgICAgICAgaWYgZWRpdG9yLmN1cnNvcnMubGVuZ3RoID4gMFxuICAgICAgICAgICAgbGluZW5vID0gZWRpdG9yLmN1cnNvcnNbMF0uZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpLmVuZC5yb3cgKyAxXG4gICAgICAgICAgc2VuZEhlYXJ0YmVhdChmaWxlLCBsaW5lbm8sIHRydWUpXG4gICAgICBidWZmZXIub25EaWRDaGFuZ2UgKGUpIC0+XG4gICAgICAgIGZpbGUgPSBidWZmZXIuZmlsZVxuICAgICAgICBpZiBmaWxlPyBhbmQgZmlsZVxuICAgICAgICAgIGxpbmVubyA9IG51bGxcbiAgICAgICAgICBpZiBlZGl0b3IuY3Vyc29ycy5sZW5ndGggPiAwXG4gICAgICAgICAgICBsaW5lbm8gPSBlZGl0b3IuY3Vyc29yc1swXS5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuZW5kLnJvdyArIDFcbiAgICAgICAgICBzZW5kSGVhcnRiZWF0KGZpbGUsIGxpbmVubylcbiAgICAgIGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChlKSAtPlxuICAgICAgICBmaWxlID0gYnVmZmVyLmZpbGVcbiAgICAgICAgaWYgZmlsZT8gYW5kIGZpbGVcbiAgICAgICAgICBsaW5lbm8gPSBudWxsXG4gICAgICAgICAgaWYgZWRpdG9yLmN1cnNvcnMubGVuZ3RoID4gMFxuICAgICAgICAgICAgbGluZW5vID0gZWRpdG9yLmN1cnNvcnNbMF0uZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpLmVuZC5yb3cgKyAxXG4gICAgICAgICAgc2VuZEhlYXJ0YmVhdChmaWxlLCBsaW5lbm8pXG4gICAgaWYgY2FsbGJhY2s/XG4gICAgICBjYWxsYmFjaygpXG5cbmlzUHl0aG9uSW5zdGFsbGVkID0gKGNhbGxiYWNrKSAtPlxuICBweXRob25Mb2NhdGlvbigocmVzdWx0KSAtPlxuICAgIGNhbGxiYWNrKHJlc3VsdD8pXG4gIClcblxucHl0aG9uTG9jYXRpb24gPSAoY2FsbGJhY2ssIGxvY2F0aW9ucykgLT5cbiAgaWYgZ2xvYmFsLmNhY2hlZFB5dGhvbkxvY2F0aW9uP1xuICAgIGNhbGxiYWNrKGdsb2JhbC5jYWNoZWRQeXRob25Mb2NhdGlvbilcbiAgZWxzZVxuICAgIGlmIG5vdCBsb2NhdGlvbnM/XG4gICAgICBsb2NhdGlvbnMgPSBbXG4gICAgICAgIF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3B5dGhvbicgKyBwYXRoLnNlcCArICdweXRob253JyxcbiAgICAgICAgJ3B5dGhvbncnLFxuICAgICAgICAncHl0aG9uJyxcbiAgICAgICAgJy91c3IvbG9jYWwvYmluL3B5dGhvbicsXG4gICAgICAgICcvdXNyL2Jpbi9weXRob24nLFxuICAgICAgXVxuICAgICAgaSA9IDI2XG4gICAgICB3aGlsZSBpIDwgNTBcbiAgICAgICAgbG9jYXRpb25zLnB1c2ggJ1xcXFxweXRob24nICsgaSArICdcXFxccHl0aG9udydcbiAgICAgICAgbG9jYXRpb25zLnB1c2ggJ1xcXFxQeXRob24nICsgaSArICdcXFxccHl0aG9udydcbiAgICAgICAgaSsrXG4gICAgYXJncyA9IFsnLS12ZXJzaW9uJ11cbiAgICBpZiBsb2NhdGlvbnMubGVuZ3RoIGlzIDBcbiAgICAgIGNhbGxiYWNrKG51bGwpXG4gICAgICByZXR1cm5cbiAgICBwYXR0ZXJuID0gL1xcZCtcXC5cXGQrL1xuICAgIGxvY2F0aW9uID0gbG9jYXRpb25zWzBdXG4gICAgZXhlY0ZpbGUobG9jYXRpb24sIGFyZ3MsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICBpZiBub3QgZXJyb3I/XG4gICAgICAgIGlmIHN0ZG91dD8gYW5kIHN0ZG91dC5tYXRjaChwYXR0ZXJuKSBvciBzdGRlcnI/IGFuZCBzdGRlcnIubWF0Y2gocGF0dGVybilcbiAgICAgICAgICBnbG9iYWwuY2FjaGVkUHl0aG9uTG9jYXRpb24gPSBsb2NhdGlvblxuICAgICAgICAgIGNhbGxiYWNrKGxvY2F0aW9uKVxuICAgICAgZWxzZVxuICAgICAgICBsb2NhdGlvbnMuc3BsaWNlKDAsIDEpXG4gICAgICAgIHB5dGhvbkxvY2F0aW9uKGNhbGxiYWNrLCBsb2NhdGlvbnMpXG4gICAgKVxuXG5pbnN0YWxsUHl0aG9uID0gKGNhbGxiYWNrKSAtPlxuICBweVZlciA9ICczLjUuMidcbiAgYXJjaCA9ICd3aW4zMidcbiAgaWYgb3MuYXJjaCgpLmluZGV4T2YoJ3g2NCcpID4gLTFcbiAgICBhcmNoID0gJ2FtZDY0J1xuICB1cmwgPSAnaHR0cHM6Ly93d3cucHl0aG9uLm9yZy9mdHAvcHl0aG9uLycgKyBweVZlciArICcvcHl0aG9uLScgKyBweVZlciArICctZW1iZWQtJyArIGFyY2ggKyAnLnppcCdcblxuICBsb2cuZGVidWcgJ2Rvd25sb2FkaW5nIHB5dGhvbi4uLidcbiAgc3RhdHVzQmFySWNvbj8uc2V0U3RhdHVzKCdkb3dubG9hZGluZyBweXRob24uLi4nKVxuXG4gIHppcEZpbGUgPSBfX2Rpcm5hbWUgKyBwYXRoLnNlcCArICdweXRob24uemlwJ1xuICBkb3dubG9hZEZpbGUodXJsLCB6aXBGaWxlLCAtPlxuXG4gICAgbG9nLmRlYnVnICdleHRyYWN0aW5nIHB5dGhvbi4uLidcbiAgICBzdGF0dXNCYXJJY29uPy5zZXRTdGF0dXMoJ2V4dHJhY3RpbmcgcHl0aG9uLi4uJylcblxuICAgIHVuemlwKHppcEZpbGUsIF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3B5dGhvbicsIC0+XG4gICAgICBmcy51bmxpbmsoemlwRmlsZSlcbiAgICAgIGxvZy5kZWJ1ZyAnRmluaXNoZWQgaW5zdGFsbGluZyBweXRob24uJ1xuICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICApXG4gIClcblxuaXNDTElJbnN0YWxsZWQgPSAoKSAtPlxuICByZXR1cm4gZnMuZXhpc3RzU3luYyhjbGlMb2NhdGlvbigpKVxuXG5pc0NMSUxhdGVzdCA9IChjYWxsYmFjaykgLT5cbiAgcHl0aG9uTG9jYXRpb24oKHB5dGhvbikgLT5cbiAgICBpZiBweXRob24/XG4gICAgICBhcmdzID0gW2NsaUxvY2F0aW9uKCksICctLXZlcnNpb24nXVxuICAgICAgZXhlY0ZpbGUocHl0aG9uLCBhcmdzLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgICBpZiBub3QgZXJyb3I/XG4gICAgICAgICAgY3VycmVudFZlcnNpb24gPSBzdGRlcnIudHJpbSgpXG4gICAgICAgICAgbG9nLmRlYnVnICdDdXJyZW50IHdha2F0aW1lLWNsaSB2ZXJzaW9uIGlzICcgKyBjdXJyZW50VmVyc2lvblxuICAgICAgICAgIGxvZy5kZWJ1ZyAnQ2hlY2tpbmcgZm9yIHVwZGF0ZXMgdG8gd2FrYXRpbWUtY2xpLi4uJ1xuICAgICAgICAgIGdldExhdGVzdENsaVZlcnNpb24oKGxhdGVzdFZlcnNpb24pIC0+XG4gICAgICAgICAgICBpZiBjdXJyZW50VmVyc2lvbiA9PSBsYXRlc3RWZXJzaW9uXG4gICAgICAgICAgICAgIGxvZy5kZWJ1ZyAnd2FrYXRpbWUtY2xpIGlzIHVwIHRvIGRhdGUuJ1xuICAgICAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0cnVlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBpZiBsYXRlc3RWZXJzaW9uP1xuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyAnRm91bmQgYW4gdXBkYXRlZCB3YWthdGltZS1jbGkgdicgKyBsYXRlc3RWZXJzaW9uXG4gICAgICAgICAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSlcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyAnVW5hYmxlIHRvIGZpbmQgbGF0ZXN0IHdha2F0aW1lLWNsaSB2ZXJzaW9uIGZyb20gR2l0SHViLidcbiAgICAgICAgICAgICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUpXG4gICAgICAgICAgKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSlcbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgY2FsbGJhY2soZmFsc2UpXG4gIClcblxuZ2V0TGF0ZXN0Q2xpVmVyc2lvbiA9IChjYWxsYmFjaykgLT5cbiAgdXJsID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS93YWthdGltZS93YWthdGltZS9tYXN0ZXIvd2FrYXRpbWUvX19hYm91dF9fLnB5J1xuICByZXF1ZXN0LmdldCh1cmwsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIC0+XG4gICAgdmVyc2lvbiA9IG51bGxcbiAgICBpZiAhZXJyb3IgYW5kIHJlc3BvbnNlLnN0YXR1c0NvZGUgPT0gMjAwXG4gICAgICByZSA9IG5ldyBSZWdFeHAoL19fdmVyc2lvbl9pbmZvX18gPSBcXCgnKFswLTldKyknLCAnKFswLTldKyknLCAnKFswLTldKyknXFwpL2cpXG4gICAgICBmb3IgbGluZSBpbiBib2R5LnNwbGl0KCdcXG4nKVxuICAgICAgICBtYXRjaCA9IHJlLmV4ZWMobGluZSlcbiAgICAgICAgaWYgbWF0Y2g/XG4gICAgICAgICAgdmVyc2lvbiA9IG1hdGNoWzFdICsgJy4nICsgbWF0Y2hbMl0gKyAnLicgKyBtYXRjaFszXVxuICAgIGlmIGNhbGxiYWNrP1xuICAgICAgY2FsbGJhY2sodmVyc2lvbilcbiAgKVxuXG5jbGlMb2NhdGlvbiA9ICgpIC0+XG4gIGRpciA9IF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3dha2F0aW1lLW1hc3RlcicgKyBwYXRoLnNlcCArICd3YWthdGltZScgKyBwYXRoLnNlcCArICdjbGkucHknXG4gIHJldHVybiBkaXJcblxuaW5zdGFsbENMSSA9IChjYWxsYmFjaykgLT5cbiAgbG9nLmRlYnVnICdEb3dubG9hZGluZyB3YWthdGltZS1jbGkuLi4nXG4gIHN0YXR1c0Jhckljb24/LnNldFN0YXR1cygnZG93bmxvYWRpbmcgd2FrYXRpbWUtY2xpLi4uJylcbiAgdXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS93YWthdGltZS93YWthdGltZS9hcmNoaXZlL21hc3Rlci56aXAnXG4gIHppcEZpbGUgPSBfX2Rpcm5hbWUgKyBwYXRoLnNlcCArICd3YWthdGltZS1tYXN0ZXIuemlwJ1xuICBkb3dubG9hZEZpbGUodXJsLCB6aXBGaWxlLCAtPlxuICAgIGV4dHJhY3RDTEkoemlwRmlsZSwgY2FsbGJhY2spXG4gIClcblxuZXh0cmFjdENMSSA9ICh6aXBGaWxlLCBjYWxsYmFjaykgLT5cbiAgbG9nLmRlYnVnICdFeHRyYWN0aW5nIHdha2F0aW1lLW1hc3Rlci56aXAgZmlsZS4uLidcbiAgc3RhdHVzQmFySWNvbj8uc2V0U3RhdHVzKCdleHRyYWN0aW5nIHdha2F0aW1lLWNsaS4uLicpXG4gIHJlbW92ZUNMSSgtPlxuICAgIHVuemlwKHppcEZpbGUsIF9fZGlybmFtZSwgY2FsbGJhY2spXG4gIClcblxucmVtb3ZlQ0xJID0gKGNhbGxiYWNrKSAtPlxuICBpZiBmcy5leGlzdHNTeW5jKF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3dha2F0aW1lLW1hc3RlcicpXG4gICAgdHJ5XG4gICAgICByaW1yYWYoX19kaXJuYW1lICsgcGF0aC5zZXAgKyAnd2FrYXRpbWUtbWFzdGVyJywgLT5cbiAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgKVxuICAgIGNhdGNoIGVcbiAgICAgIGxvZy53YXJuIGVcbiAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICBjYWxsYmFjaygpXG4gIGVsc2VcbiAgICBpZiBjYWxsYmFjaz9cbiAgICAgIGNhbGxiYWNrKClcblxuZG93bmxvYWRGaWxlID0gKHVybCwgb3V0cHV0RmlsZSwgY2FsbGJhY2spIC0+XG4gIHIgPSByZXF1ZXN0KHVybClcbiAgb3V0ID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0ob3V0cHV0RmlsZSlcbiAgci5waXBlKG91dClcbiAgci5vbignZW5kJywgLT5cbiAgICBvdXQub24oJ2ZpbmlzaCcsIC0+XG4gICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgY2FsbGJhY2soKVxuICAgIClcbiAgKVxuXG51bnppcCA9IChmaWxlLCBvdXRwdXREaXIsIGNhbGxiYWNrKSAtPlxuICBpZiBmcy5leGlzdHNTeW5jKGZpbGUpXG4gICAgdHJ5XG4gICAgICB6aXAgPSBuZXcgQWRtWmlwKGZpbGUpXG4gICAgICB6aXAuZXh0cmFjdEFsbFRvKG91dHB1dERpciwgdHJ1ZSlcbiAgICBjYXRjaCBlXG4gICAgICBsb2cud2FybiBlXG4gICAgZmluYWxseVxuICAgICAgZnMudW5saW5rKGZpbGUpXG4gICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgY2FsbGJhY2soKVxuXG5zZW5kSGVhcnRiZWF0ID0gKGZpbGUsIGxpbmVubywgaXNXcml0ZSkgLT5cbiAgaWYgbm90IGZpbGUucGF0aD8gb3IgZmlsZS5wYXRoIGlzIHVuZGVmaW5lZFxuICAgIGxvZy5kZWJ1ZyAnU2tpcHBpbmcgZmlsZSBiZWNhdXNlIHBhdGggZG9lcyBub3QgZXhpc3Q6ICcgKyBmaWxlLnBhdGhcbiAgICByZXR1cm5cbiAgaWYgZmlsZUlzSWdub3JlZChmaWxlLnBhdGgpXG4gICAgbG9nLmRlYnVnICdTa2lwcGluZyBmaWxlIGJlY2F1c2UgcGF0aCBtYXRjaGVzIGlnbm9yZSBwYXR0ZXJuOiAnICsgZmlsZS5wYXRoXG4gICAgcmV0dXJuXG5cbiAgdGltZSA9IERhdGUubm93KClcbiAgY3VycmVudEZpbGUgPSBmaWxlLnBhdGhcbiAgaWYgaXNXcml0ZSBvciBlbm91Z2hUaW1lUGFzc2VkKHRpbWUpIG9yIGxhc3RGaWxlIGlzbnQgY3VycmVudEZpbGVcbiAgICBweXRob25Mb2NhdGlvbiAocHl0aG9uKSAtPlxuICAgICAgcmV0dXJuIHVubGVzcyBweXRob24/XG4gICAgICBhcmdzID0gW2NsaUxvY2F0aW9uKCksICctLWZpbGUnLCBjdXJyZW50RmlsZSwgJy0tcGx1Z2luJywgJ2F0b20td2FrYXRpbWUvJyArIHBhY2thZ2VWZXJzaW9uXVxuICAgICAgaWYgaXNXcml0ZVxuICAgICAgICBhcmdzLnB1c2goJy0td3JpdGUnKVxuICAgICAgaWYgbGluZW5vP1xuICAgICAgICBhcmdzLnB1c2goJy0tbGluZW5vJylcbiAgICAgICAgYXJncy5wdXNoKGxpbmVubylcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCAnd2FrYXRpbWUuZGVidWcnXG4gICAgICAgIGFyZ3MucHVzaCgnLS12ZXJib3NlJylcblxuICAgICAgIyBmaXggZm9yIHdha2F0aW1lL2F0b20td2FrYXRpbWUjNjVcbiAgICAgIGFyZ3MucHVzaCgnLS1jb25maWcnKVxuICAgICAgYXJncy5wdXNoKHBhdGguam9pbiBnZXRVc2VySG9tZSgpLCAnLndha2F0aW1lLmNmZycpXG5cbiAgICAgIGlmIGF0b20ucHJvamVjdC5jb250YWlucyhmaWxlLnBhdGgpXG4gICAgICAgIGN1cnJlbnRGaWxlID0gZmlsZS5wYXRoXG4gICAgICAgIGZvciByb290RGlyIGluIGF0b20ucHJvamVjdC5yb290RGlyZWN0b3JpZXNcbiAgICAgICAgICByZWFsUGF0aCA9IHJvb3REaXIucmVhbFBhdGhcbiAgICAgICAgICBpZiBjdXJyZW50RmlsZS5pbmRleE9mKHJlYWxQYXRoKSA+IC0xXG4gICAgICAgICAgICBhcmdzLnB1c2goJy0tYWx0ZXJuYXRlLXByb2plY3QnKVxuICAgICAgICAgICAgYXJncy5wdXNoKHBhdGguYmFzZW5hbWUocmVhbFBhdGgpKVxuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgbG9nLmRlYnVnIHB5dGhvbiArICcgJyArIGFyZ3Muam9pbignICcpXG5cbiAgICAgIHByb2MgPSBleGVjRmlsZShweXRob24sIGFyZ3MsIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICAgIGlmIGVycm9yP1xuICAgICAgICAgIGlmIHN0ZGVycj8gYW5kIHN0ZGVyciAhPSAnJ1xuICAgICAgICAgICAgbG9nLndhcm4gc3RkZXJyXG4gICAgICAgICAgaWYgc3Rkb3V0PyBhbmQgc3Rkb3V0ICE9ICcnXG4gICAgICAgICAgICBsb2cud2FybiBzdGRvdXRcbiAgICAgICAgICBpZiBwcm9jLmV4aXRDb2RlID09IDEwMlxuICAgICAgICAgICAgbXNnID0gbnVsbFxuICAgICAgICAgICAgc3RhdHVzID0gbnVsbFxuICAgICAgICAgICAgdGl0bGUgPSAnV2FrYVRpbWUgT2ZmbGluZSwgY29kaW5nIGFjdGl2aXR5IHdpbGwgc3luYyB3aGVuIG9ubGluZS4nXG4gICAgICAgICAgZWxzZSBpZiBwcm9jLmV4aXRDb2RlID09IDEwM1xuICAgICAgICAgICAgbXNnID0gJ0FuIGVycm9yIG9jY3VyZWQgd2hpbGUgcGFyc2luZyB+Ly53YWthdGltZS5jZmcuIENoZWNrIH4vLndha2F0aW1lLmxvZyBmb3IgbW9yZSBpbmZvLidcbiAgICAgICAgICAgIHN0YXR1cyA9ICdFcnJvcidcbiAgICAgICAgICAgIHRpdGxlID0gbXNnXG4gICAgICAgICAgZWxzZSBpZiBwcm9jLmV4aXRDb2RlID09IDEwNFxuICAgICAgICAgICAgbXNnID0gJ0ludmFsaWQgQVBJIEtleS4gTWFrZSBzdXJlIHlvdXIgQVBJIEtleSBpcyBjb3JyZWN0ISdcbiAgICAgICAgICAgIHN0YXR1cyA9ICdFcnJvcidcbiAgICAgICAgICAgIHRpdGxlID0gbXNnXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbXNnID0gZXJyb3JcbiAgICAgICAgICAgIHN0YXR1cyA9ICdFcnJvcidcbiAgICAgICAgICAgIHRpdGxlID0gJ1Vua25vd24gRXJyb3IgKCcgKyBwcm9jLmV4aXRDb2RlICsgJyk7IENoZWNrIHlvdXIgRGV2IENvbnNvbGUgYW5kIH4vLndha2F0aW1lLmxvZyBmb3IgbW9yZSBpbmZvLidcblxuICAgICAgICAgIGlmIG1zZz9cbiAgICAgICAgICAgIGxvZy53YXJuIG1zZ1xuICAgICAgICAgIHN0YXR1c0Jhckljb24/LnNldFN0YXR1cyhzdGF0dXMpXG4gICAgICAgICAgc3RhdHVzQmFySWNvbj8uc2V0VGl0bGUodGl0bGUpXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0YXR1c0Jhckljb24/LnNldFN0YXR1cygpXG4gICAgICAgICAgdG9kYXkgPSBuZXcgRGF0ZSgpXG4gICAgICAgICAgc3RhdHVzQmFySWNvbj8uc2V0VGl0bGUoJ0xhc3QgaGVhcnRiZWF0IHNlbnQgJyArIGZvcm1hdERhdGUodG9kYXkpKVxuICAgICAgKVxuICAgICAgbGFzdEhlYXJ0YmVhdCA9IHRpbWVcbiAgICAgIGxhc3RGaWxlID0gZmlsZS5wYXRoXG5cbmZpbGVJc0lnbm9yZWQgPSAoZmlsZSkgLT5cbiAgaWYgZW5kc1dpdGgoZmlsZSwgJ0NPTU1JVF9FRElUTVNHJykgb3IgZW5kc1dpdGgoZmlsZSwgJ1BVTExSRVFfRURJVE1TRycpIG9yIGVuZHNXaXRoKGZpbGUsICdNRVJHRV9NU0cnKSBvciBlbmRzV2l0aChmaWxlLCAnVEFHX0VESVRNU0cnKVxuICAgIHJldHVybiB0cnVlXG4gIHBhdHRlcm5zID0gYXRvbS5jb25maWcuZ2V0KCd3YWthdGltZS5pZ25vcmUnKVxuICBpZiBub3QgcGF0dGVybnM/XG4gICAgcmV0dXJuIHRydWVcblxuICBpZ25vcmUgPSBmYWxzZVxuICBmb3IgcGF0dGVybiBpbiBwYXR0ZXJuc1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2knKVxuICAgIGlmIHJlLnRlc3QoZmlsZSlcbiAgICAgIGlnbm9yZSA9IHRydWVcbiAgICAgIGJyZWFrXG4gIHJldHVybiBpZ25vcmVcblxuZW5kc1dpdGggPSAoc3RyLCBzdWZmaXgpIC0+XG4gIGlmIHN0cj8gYW5kIHN1ZmZpeD9cbiAgICByZXR1cm4gc3RyLmluZGV4T2Yoc3VmZml4LCBzdHIubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aCkgIT0gLTFcbiAgcmV0dXJuIGZhbHNlXG5cbmZvcm1hdERhdGUgPSAoZGF0ZSkgLT5cbiAgbW9udGhzID0gW1xuICAgICAgJ0phbicsXG4gICAgICAnRmViJyxcbiAgICAgICdNYXInLFxuICAgICAgJ0FwcicsXG4gICAgICAnTWF5JyxcbiAgICAgICdKdW4nLFxuICAgICAgJ0p1bCcsXG4gICAgICAnQXVnJyxcbiAgICAgICdTZXAnLFxuICAgICAgJ09jdCcsXG4gICAgICAnTm92JyxcbiAgICAgICdEZWMnLFxuICBdXG4gIGFtcG0gPSAnQU0nXG4gIGhvdXIgPSBkYXRlLmdldEhvdXJzKClcbiAgaWYgKGhvdXIgPiAxMSlcbiAgICBhbXBtID0gJ1BNJ1xuICAgIGhvdXIgPSBob3VyIC0gMTJcbiAgaWYgKGhvdXIgPT0gMClcbiAgICBob3VyID0gMTJcbiAgbWludXRlID0gZGF0ZS5nZXRNaW51dGVzKClcbiAgaWYgKG1pbnV0ZSA8IDEwKVxuICAgIG1pbnV0ZSA9ICcwJyArIG1pbnV0ZVxuICByZXR1cm4gbW9udGhzW2RhdGUuZ2V0TW9udGgoKV0gKyAnICcgKyBkYXRlLmdldERhdGUoKSArICcsICcgKyBkYXRlLmdldEZ1bGxZZWFyKCkgKyAnICcgKyBob3VyICsgJzonICsgbWludXRlICsgJyAnICsgYW1wbVxuXG5kZWJ1ZyA9IChjYWxsYmFjaykgLT5cbiAgaWYgZnMuZXhpc3RzU3luYyhfX2Rpcm5hbWUgKyBwYXRoLnNlcCArICd3YWthdGltZS1tYXN0ZXInKVxuICAgIHRyeVxuICAgICAgcmltcmFmKF9fZGlybmFtZSArIHBhdGguc2VwICsgJ3dha2F0aW1lLW1hc3RlcicsIC0+XG4gICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgIClcbiAgICBjYXRjaCBlXG4gICAgICBsb2cud2FybiBlXG4gICAgICBpZiBjYWxsYmFjaz9cbiAgICAgICAgY2FsbGJhY2soKVxuICBlbHNlXG4gICAgaWYgY2FsbGJhY2s/XG4gICAgICBjYWxsYmFjaygpXG4iXX0=
