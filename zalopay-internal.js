/*! zalopay 09-06-2017 */
/* eslint-disable */
(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(factory);
  } else {
    root.ant = root.ZaloPayInternal = root.ZaloPayInternal || {};
    factory.call(root, root.ZaloPayInternal);
  }
})(this, function(ZaloPay) {
  'use strict';
  ZaloPay = ZaloPay || {};
  ZaloPay.ua = navigator.userAgent;
  ZaloPay.jsVersion = '1.0.0';
  ZaloPay.isDebug = true;
  ZaloPay.isZaloPay = (function() {
    return ZaloPay.ua.indexOf('ZaloPayClient') > -1;
  })();
  if (!ZaloPay.isZaloPay) {
    writeLog('warn', 'Run in ZaloPayClient please!');
  }
  ZaloPay.appVersion = (function() {
    if (ZaloPay.isZaloPay) {
      var version = ZaloPay.ua.match(/ZaloPayClient\/(.*)/);
      return version && version.length ? version[1] : '';
    }
  })();
  ZaloPay.appInfo = {
    name: 'ZaloPayInternal',
    isZaloPay: ZaloPay.isZaloPay,
    jsVersion: ZaloPay.jsVersion,
    appVersion: ZaloPay.appVersion
  };
  ZaloPay.on = function(event, fn) {
    event.split(/\s+/g).forEach(function(eventName) {
      document.addEventListener(eventName, fn, false);
    });
  };
  ZaloPay.call = function() {
    var args = [].slice.call(arguments);
    if (window.ZaloPayInternalJSBridge && window.ZaloPayInternalJSBridge.call) {
      var name = args[0],
        opt = args[1] || {},
        cb = args[2];
      if (!isStr(name)) {
        writeLog('error', 'ZaloPay.call', 'Request undefined function!');
        return;
      }
      if (cb === undefined && isFn(opt)) {
        cb = opt;
        opt = {};
      }
      if (!isObj(opt)) {
        writeLog('error', 'ZaloPay.call', 'Request undefined options!');
        return;
      }
      var _callback = cb;
      cb = function(result) {
        result = checkError(result, name);
        _callback && _callback(result);
      };
      'writeLog' !== name &&
        writeLog('info', 'ZaloPayInternalJSBridge.call', name, opt, _callback);
        writeLog('info', 'ZaloPayInternalJSBridge.call', 'thucm test 222');
      window.ZaloPayInternalJSBridge.call(name, opt, cb);
    } else {
      ZaloPay._apiQueue = ZaloPay._apiQueue || [];
      ZaloPay._apiQueue.push(args);
    }
  };
  ZaloPay._ready = function(fn) {
    if (window.ZaloPayInternalJSBridge && window.ZaloPayInternalJSBridge.call) {
      fn && fn();
    } else {
      ZaloPay.on('ZaloPayInternalJSBridgeReady', fn);
    }
  };
  ZaloPay.ready = ZaloPay.ready || ZaloPay._ready;

  /**
   * ZaloPay.getUserInfo(appid, cb);
   */
  ZaloPay.getUserInfo = function(appid, cb) {
    if (!isFn(cb) || !isNumber(appid)) {
      writeLog(
        'error',
        'ZaloPay.getUserInfo',
        'Received invalid function callback'
      );
      return;
    }
    writeLog(
      'info',
      'ZaloPay.getUserInfo',
      'Received UserInfo in function callback'
    );
    ZaloPay.call('getUserInfo', { appid: appid }, cb);
  };

  ZaloPay._ready(function() {
    writeLog('info', 'ZaloPayInternalJS Ready!');
    var apiQueue = ZaloPay._apiQueue || [];

    function next() {
      window.ZaloPay.requestAnimationFrame(function() {
        var args = apiQueue.shift();
        ZaloPay.call.apply(null, args);
        if (apiQueue.length) next();
      });
    }
    !!apiQueue.length && next();
  });

  function isAndroid() {
    return /android/i.test(ZaloPay.ua);
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(ZaloPay.ua);
  }

  function isArr(fn) {
    return 'array' === type(fn);
  }

  function isFn(fn) {
    return 'function' === type(fn);
  }

  function isStr(str) {
    return 'string' === type(str);
  }

  function isObj(o) {
    return 'object' === type(o);
  }

  function isNumber(num) {
    return 'number' === type(num);
  }

  function type(obj) {
    return Object.prototype.toString
      .call(obj)
      .replace(/\[object (\w+)\]/, '$1')
      .toLowerCase();
  }

  function writeLog() {
    var time = +new Date();
    var arg = [].slice.call(arguments);
    var type = arg[0].toLowerCase().trim();
    switch (type) {
      case 'error':
        arg.splice(0, 1);
        arg.length === 1
          ? console.error(time, arg[0])
          : console.error(time, arg);
        break;
      case 'warn':
        arg.splice(0, 1);
        arg.length === 1 ? console.warn(time, arg[0]) : console.warn(time, arg);
        break;
      case 'info':
        arg.splice(0, 1);
        arg.length === 1 ? console.log(time, arg[0]) : console.log(time, arg);
        break;
      default:
        type = 'info';
        arg.length === 1 ? console.log(time, arg[0]) : console.log(time, arg);
        break;
    }
    if (
      ZaloPay.isDebug &&
      ZaloPay.call &&
      window.ZaloPayInternalJSBridge &&
      window.ZaloPayInternalJSBridge.call
    ) {
      var opt = {
        type: type,
        time: time,
        data: JSON.stringify(arg)
      };
      window.ZaloPay.call('writeLog', opt);
    }
  }

  function checkError(result, name) {
    result = result || {};
    result.errorCode = result.error || 0;
    if (result.error !== 1) {
      writeLog(
        'error',
        name +
          ': errorCode[' +
          result.errorCode +
          '], message[' +
          result.errorMessage +
          ']'
      );
    } else {
      writeLog(
        'info',
        name +
          ': errorCode[' +
          result.errorCode +
          '], message[' +
          result.errorMessage +
          ']'
      );
    }
    return result;
  }

  function compareVersion(targetVersion) {
    var appVersion = ZaloPay.appVersion.split('.');
    targetVersion = targetVersion.split('.');
    for (var i = 0, n1, n2; i < appVersion.length; i++) {
      n1 = parseInt(targetVersion[i], 10) || 0;
      n2 = parseInt(appVersion[i], 10) || 0;
      if (n1 > n2) return -1;
      if (n1 < n2) return 1;
    }
    return 0;
  }
  return ZaloPay;
});
