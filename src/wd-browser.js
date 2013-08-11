(function (doc, webdriver, bot, goog) {
    var requestDefinitions = [
        {
            path: /^POST:\/session$/,
            handler: createSession
        },
        {
            path: /^POST:\/session\/([^\/]+)\/url$/,
            handler: openUrl
        },
        {
            path: /^GET:\/session\/([^\/]+)\/title$/,
            handler: getTitle
        },
        {
            path: /^POST:\/session\/([^\/]+)\/element$/,
            handler: findElement
        },
        {
            path: /^POST:\/session\/([^\/]+)\/element\/([^\/]+)\/value$/,
            handler: sendKeys
        },
        {
            path: /^POST:\/session\/([^\/]+)\/element\/([^\/]+)\/click/,
            handler: click
        }
    ],
        sessions = {},
        nextSessionId = 1,
        foundElements = {},
        nextElementId = 1;

    interceptWebdriverHttpRequests(httpRequestHandler);

    function interceptWebdriverHttpRequests(requestHandler) {
        // See original webdriver.http.CorsClient.prototype.send.
        webdriver.http.CorsClient.prototype.send = function (request, callback) {
            try {
                requestHandler({
                    'method': request.method,
                    'path': request.path,
                    'data': request.data
                }, function (ex, response) {
                    if (ex) {
                        callback(ex);
                        return;
                    }
                    callback(null,
                        new webdriver.http.Response(
                            200,
                            {},
                            response
                        ));
                });
            } catch (ex) {
                callback(ex);
            }
        };

        // This function usually converts the response.data from a string to an object.
        // However, we want to avoid this unneeded serialization / deserialization,
        // so we overwrite this method to do nothing.
        webdriver.http.Executor.parseHttpResponse_ = function (httpResponse) {
            return httpResponse.body;
        };
    }


    /**
     * Central request handler that implements the JsonWireProtocol (https://code.google.com/p/selenium/wiki/JsonWireProtocol)
     * based on the webdriver atoms (window.bot.*).
     * @param request An object like {method: 'GET'/'POST', path: '/session/...', data: {...}}
     * @param done {function(err, data)} result / error callback.
     */
    function httpRequestHandler(request, done) {
        var path = request.method + ':' + request.path,
            requestDef, i, match;
        for (i = 0; i < requestDefinitions.length; i++) {
            requestDef = requestDefinitions[i];
            match = requestDef.path.exec(path);
            if (match) {
                requestDef.handler(request, match, done);
                return;
            }
        }
        done(null, {
            status: 9, // UnknownCommand
            value: {
                message: goog.json.serialize(request)
            }
        });

    }

    function createSession(request, pathMatch, done) {
        var sessionId = nextSessionId++,
            wrapper, iframe;
        wrapper = doc.createElement("div");
        wrapper.innerHTML = '<iframe '+
            'width="100%" height="100%" '+
            'style="position: absolute; top: 0; left: 0; background-color:white; border: 0px;"></iframe>';
        iframe = wrapper.firstChild;
        doc.body.appendChild(iframe);
        sessions[sessionId] = {
            win: iframe.contentWindow
        };

        done(null, {
            status: 0,
            sessionId: sessionId
        });
    }

    function openUrl(request, pathMatch, done) {
        var win, iframe;
        // TODO refactor setting bot.window from sessionId into
        // a central place as all methods need this!
        bot.setWindow(sessions[pathMatch[1]].win);
        win = bot.getWindow();
        iframe = win.frameElement;
        // Cross browser way for onload iframe handler
        if (iframe.attachEvent) {
            iframe.attachEvent('onload', onload);
        } else {
            iframe.onload = onload;
        }
        win.location.href = request.data.url;

        // TODO we need to set this window into the bot...

        function onload() {
            iframe.onload = null;
            if (iframe.attachEvent) {
                iframe.detachEvent('onload', onload);
            }
            done(null, {
                status: 0
            });
        }
    }

    function getTitle(request, pathMatch, done) {
        var doc;
        // TODO refactor setting bot.window from sessionId into
        // a central place as all methods need this!
        bot.setWindow(sessions[pathMatch[1]].win);
        doc = bot.getDocument();
        done(null, {
            status: 0,
            value: doc.title
        });
    }

    function findElement(request, pathMatch, done) {
        // TODO refactor setting bot.window from sessionId into
        // a central place as all methods need this!
        bot.setWindow(sessions[pathMatch[1]].win);
        // TODO: implements a LRU eviction strategy for the selected elements!
        var findSpec = {},
            el,
            elId = nextElementId++;
        findSpec[request.data.using] = request.data.value;
        el = bot.locators.findElement(findSpec);
        foundElements[elId] = el;

        done(null, {
            status: 0,
            value: {
                ELEMENT: elId
            }
        });
    }

    function sendKeys(request, pathMatch, done) {
        // TODO refactor setting bot.window from sessionId into
        // a central place as all methods need this!
        bot.setWindow(sessions[pathMatch[1]].win);
        var elId = pathMatch[2],
            el = foundElements[elId];
        if (!el) {
            done(null, {
                status: 7, // NoSuchElement
                value: {
                    message: elId
                }
            });
            return;
        }
        bot.action.type(el, request.data.value);
        done(null, {
            status: 0
        });
    }

    function click(request, pathMatch, done) {
        // TODO refactor setting bot.window from sessionId into
        // a central place as all methods need this!
        bot.setWindow(sessions[pathMatch[1]].win);
        var elId = pathMatch[2],
            el = foundElements[elId];
        // TODO refactor this code duplication with sendKeys!
        if (!el) {
            done(null, {
                status: 7, // NoSuchElement
                value: {
                    message: elId
                }
            });
            return;
        }
        bot.action.click(el, request.data.value);
        done(null, {
            status: 0
        });
    }


})(window.document, window.webdriver, window.bot, window.goog);
