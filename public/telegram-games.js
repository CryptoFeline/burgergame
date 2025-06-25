(function () {
  var eventHandlers = {};

  // Parse init params from location hash: for Android < 5.0, TDesktop
  var locationHash = '';
  try {
    locationHash = location.hash.toString();
  } catch (e) {}

  var initParams = urlParseHashParams(locationHash);

  var isIframe = false;
  try {
    isIframe = (window.parent != null && window != window.parent);
  } catch (e) {}


  function urlSafeDecode(urlencoded) {
    try {
      return decodeURIComponent(urlencoded);
    } catch (e) {
      return urlencoded;
    }
  }

  function urlParseHashParams(locationHash) {
    locationHash = locationHash.replace(/^#/, '');
    var params = {};
    if (!locationHash.length) {
      return params;
    }
    if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
      params._path = urlSafeDecode(locationHash);
      return params;
    }
    var qIndex = locationHash.indexOf('?');
    if (qIndex >= 0) {
      var pathParam = locationHash.substr(0, qIndex);
      params._path = urlSafeDecode(pathParam);
      locationHash = locationHash.substr(qIndex + 1);
    }
    var locationHashParams = locationHash.split('&');
    var i, param, paramName, paramValue;
    for (i = 0; i < locationHashParams.length; i++) {
      param = locationHashParams[i].split('=');
      paramName = urlSafeDecode(param[0]);
      paramValue = param[1] == null ? null : urlSafeDecode(param[1]);
      params[paramName] = paramValue;
    }
    return params;
  }

  // Telegram apps will implement this logic to add service params (e.g. tgShareScoreUrl) to game URL
  function urlAppendHashParams(url, addHash) {
    // url looks like 'https://game.com/path?query=1#hash'
    // addHash looks like 'tgShareScoreUrl=' + encodeURIComponent('tgb://share_game_score?hash=very_long_hash123')

    var ind = url.indexOf('#');
    if (ind < 0) {
      // https://game.com/path -> https://game.com/path#tgShareScoreUrl=etc
      return url + '#' + addHash;
    }
    var curHash = url.substr(ind + 1);
    if (curHash.indexOf('=') >= 0 || curHash.indexOf('?') >= 0) {
      // https://game.com/#hash=1 -> https://game.com/#hash=1&tgShareScoreUrl=etc
      // https://game.com/#path?query -> https://game.com/#path?query&tgShareScoreUrl=etc
      return url + '&' + addHash;
    }
    // https://game.com/#hash -> https://game.com/#hash?tgShareScoreUrl=etc
    if (curHash.length > 0) {
      return url + '?' + addHash;
    }
    // https://game.com/# -> https://game.com/#tgShareScoreUrl=etc
    return url + addHash;
  }


  function postEvent (eventType, callback, eventData) {
    if (!callback) {
      callback = function () {};
    }
    if (eventData === undefined) {
      eventData = '';
    }

    console.log('TelegramGameProxy.postEvent:', eventType, eventData);

    if (window.TelegramWebviewProxy !== undefined) {
      TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
      callback();
    }
    else if (window.external && 'notify' in window.external) {
      window.external.notify(JSON.stringify({eventType: eventType, eventData: eventData}));
      callback();
    }
    else if (isIframe) {
      try {
        var trustedTarget = 'https://web.telegram.org';
        // For now we don't restrict target, for testing purposes
        trustedTarget = '*';
        window.parent.postMessage(JSON.stringify({eventType: eventType, eventData: eventData}), trustedTarget);
        callback();
      } catch (e) {
        callback(e);
      }
    }
    else {
      callback({notAvailable: true});
    }
  };

  function receiveEvent(eventType, eventData) {
    var curEventHandlers = eventHandlers[eventType];
    if (curEventHandlers === undefined ||
        !curEventHandlers.length) {
      return;
    }
    for (var i = 0; i < curEventHandlers.length; i++) {
      try {
        curEventHandlers[i](eventType, eventData);
      } catch (e) {}
    }
  }

  function onEvent (eventType, callback) {
    if (eventHandlers[eventType] === undefined) {
      eventHandlers[eventType] = [];
    }
    var index = eventHandlers[eventType].indexOf(callback);
    if (index === -1) {
      eventHandlers[eventType].push(callback);
    }
  };

  function offEvent (eventType, callback) {
    if (eventHandlers[eventType] === undefined) {
      return;
    }
    var index = eventHandlers[eventType].indexOf(callback);
    if (index === -1) {
      return;
    }
    eventHandlers[eventType].splice(index, 1);
  };

  function openProtoUrl(url) {
    if (!url.match(/^(web\+)?tgb?:\/\/./)) {
      return false;
    }
    var useIframe = navigator.userAgent.match(/iOS|iPhone OS|iPhone|iPod|iPad/i) ? true : false;
    if (useIframe) {
      var iframeContEl = document.getElementById('tgme_frame_cont') || document.body;
      var iframeEl = document.createElement('iframe');
      iframeContEl.appendChild(iframeEl);
      var pageHidden = false;
      var enableHidden = function () {
        pageHidden = true;
      };
      window.addEventListener('pagehide', enableHidden, false);
      window.addEventListener('blur', enableHidden, false);
      if (iframeEl !== null) {
        iframeEl.src = url;
      }
      setTimeout(function() {
        if (!pageHidden) {
          window.location = url;
        }
        window.removeEventListener('pagehide', enableHidden, false);
        window.removeEventListener('blur', enableHidden, false);
      }, 2000);
    }
    else {
      window.location = url;
    }
    return true;
  }

  // For Windows Phone app
  window.TelegramGameProxy_receiveEvent = receiveEvent;

  // Enhanced TelegramGameProxy with score posting
  window.TelegramGameProxy = {
    initParams: initParams,
    receiveEvent: receiveEvent,
    onEvent: onEvent,
    shareScore: function () {
      postEvent('share_score', function (error) {
        if (error) {
          var shareScoreUrl = initParams.tgShareScoreUrl;
          if (shareScoreUrl) {
            openProtoUrl(shareScoreUrl);
          }
        }
      });
    },
    // Add the postScore method that our game expects
    postScore: function(score) {
      console.log('TelegramGameProxy.postScore called with score:', score);
      
      // Ensure score is valid
      const finalScore = Math.max(0, Math.floor(score));
      
      // For Telegram Games leaderboards, we need to trigger a callback query
      // This simulates what happens when the user clicks a button in the game
      if (isIframe && window.parent !== window) {
        try {
          // The bot expects callback query data in this format
          const callbackData = JSON.stringify({
            type: 'game_score',
            score: finalScore,
            timestamp: Date.now()
          });
          
          // Method 1: Send as a simulated callback query (preferred for Games API)
          window.parent.postMessage({
            callback_query: {
              id: 'game_score_' + Date.now(),
              from: {id: 'current_user'}, // Will be filled by Telegram
              data: callbackData,
              game_short_name: 'buildergame'
            }
          }, '*');
          console.log('✅ Score posted as callback query for leaderboard');
          
          // Method 2: Send as event type (for compatibility)
          window.parent.postMessage({
            eventType: 'game_score',
            eventData: callbackData
          }, '*');
          console.log('✅ Score posted via eventType method');
          
          // Method 3: Direct message format
          window.parent.postMessage({
            type: 'game_score',
            score: finalScore,
            timestamp: Date.now()
          }, '*');
          console.log('✅ Score posted via direct message');
          
        } catch (e) {
          console.error('❌ Failed to post score:', e);
        }
      }
      
      // Also try the traditional event system
      postEvent('game_score', function(error) {
        if (error) {
          console.error('❌ Failed to post score via event:', error);
        } else {
          console.log('✅ Score posted via event system');
        }
      }, {score: finalScore, timestamp: Date.now()});
    },
    paymentFormSubmit: function (formData) {
      if (!formData ||
          !formData.credentials ||
          formData.credentials.type !== 'card' ||
          !formData.credentials.token ||
          !formData.credentials.token.match(/^[A-Za-z0-9\/=_\-]{4,512}$/) ||
          !formData.title) {
        console.error('[TgProxy] Invalid form data submitted', formData);
        throw Error('PaymentFormDataInvalid');
      }
      postEvent('payment_form_submit', false, formData);
    }
  };

  console.log('TelegramGameProxy initialized with params:', initParams);
  console.log('isIframe:', isIframe);

})();
