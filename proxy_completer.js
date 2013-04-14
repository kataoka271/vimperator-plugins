(function () {

    function HTMLParser(aHTMLString){
        var html = document.implementation.createDocument(
            "http://www.w3.org/1999/xhtml", "html", null),
        body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
        html.documentElement.appendChild(body);

        body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
            .getService(Components.interfaces.nsIScriptableUnescapeHTML)
            .parseFragment(aHTMLString, false, null, body));

        return body;
    }

    // Proxy class handles proxy setting in the browser.

    var Proxy = function () {
        this._load();
    };

    // loads proxy setting.
    Proxy.prototype._load = function (value) {
        this.type = options.getPref("network.proxy.type");
        this.host = options.getPref("network.proxy.http");
        this.port = options.getPref("network.proxy.http_port");
    };

    // sets proxy setting.
    Proxy.prototype.set = function (value) {
        var d = {
            'none': 0,
            'pac': 2,
            'auto-detect': 4,
            'system': 5
        };
        if (d[value] != undefined) {
            options.setPref("network.proxy.type", d[value]);
            options.setPref("network.proxy.http", '');
            options.setPref("network.proxy.http_port", 0);
        } else {
            var [host, port] = value.split(":");
            options.setPref("network.proxy.type", 1);
            options.setPref("network.proxy.http", host);
            options.setPref("network.proxy.http_port", parseInt(port));
        }
        this._load();
    };

    // display current setting.
    Proxy.prototype.echo = function () {
        if (this.type == 1) {
            liberator.echo("current setting = " + this.host + ":" + this.port);
        } else {
            var d = {
                0: 'none',
                2: 'pac',
                4: 'auto-detect',
                5: 'system'
            };
            liberator.echo("current setting = " + d[this.type]);
        }
    };

    // Completer class handles vimperator's command completion.

    var Completer = function () {
        this.proxylist = [];
        //this.lastupdate = 0;
    };

    // parse HTML document to an array of proxy completion list.
    Completer.prototype._parseDocument = function (htmldoc) {
        var items = htmldoc.getElementsByTagName("li");
        var proxylist = new Array();
        var proxytype = {
            'A': 'A (anon, hidden)',
            'B': 'B (anon, visible)',
            'C': 'C (anon, lying)',
            'D': 'D (non-anon, leaking)'
        };
        for (var i = 0; i < Math.min(100, items.length); i++) {
            var a = items[i].firstChild;
            if (a.tagName == "a" || a.tagName == "A") {
                var host = a.textContent;
                var country = a.title;
                var type = a.className;
                proxylist.push([host, country + ": " + proxytype[type]]);
            }
        }
        this.proxylist = proxylist;
    };

    // fetch proxy list from "www.cybersyndrome.net".
    Completer.prototype.communicate = function (callback) {
        // don't communicate in 5 minutes.
        //var now = new Date().getTime();
        //if (now - this.lastupdate < 5 * 60 * 1000) {
        //    if (callback != undefined) {
        //        callback();
        //    }
        //    return;
        //}
        //this.lastupdate = now;
        var url = "http://www.cybersyndrome.net/pla5.html";
        var xhr = XMLHttpRequest();
        if (callback != undefined) {
            let self = this;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        self._parseDocument(HTMLParser(xhr.responseText));
                        callback();
                    } else {
                        liberator.echoerr("communication failure: " +
                                          xhr.statusText);
                    }
                }
            };
            xhr.open("GET", url, true);
            //xhr.channel.loadFlags |=
            //    Components.interfaces.nsIRequest.LOAD_FROM_CACHE;
            xhr.send();
        } else {
            xhr.open("GET", url, false);
            //xhr.channel.loadFlags |=
            //    Components.interfaces.nsIRequest.LOAD_FROM_CACHE;
            xhr.send();
            if (xhr.status == 200) {
                this._parseDocument(HTMLParser(xhr.responseText));
            } else {
                liberator.echoerr("communication failure: " +
                                  xhr.statusText);
            }
        }
    };

    // yields command completion list.
    Completer.prototype.getSuggestions = function (args) {
        var suggestions = [
            ['none', 'no proxy'],
            ['pac', 'proxy auto-configuration (PAC)'],
            ['auto-detect', 'auto-detect proxy settings'],
            ['system', 'system proxy settings']
        ];
        Array.prototype.push.apply(suggestions, this.proxylist);
        function filterFunc(command) {
            return command[0].indexOf(args) == 0 ||
                   command[1].indexOf(args) >= 0;
        }
        return suggestions.filter(filterFunc);
    };

    commands.addUserCommand(["proxy"], "set or get proxy setting",
        function (args) {
            var _proxy = new Proxy();
            if (args.length > 0) {
                _proxy.set(args[0]);
            }
            _proxy.echo();
        },
        {
            completer: function (context, args) {
                var _completer = new Completer();
                context.incomplete = true;
                context.title = ['Proxy'];
                context.completions = _completer.getSuggestions(args);
                context.filters = [];
                context.compare = void 0;
                _completer.communicate(function () {
                        context.incomplete = false;
                        context.completions = _completer.getSuggestions(args);
                });
            },
            argCount: "*"
        },
        true);

})();
