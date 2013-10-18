// Add hints which make use of prefix property with n-ary Huffman coding.

var oldHints = {};

(function () {

    oldHints = {};

    function newFunction(orgFunc, repFunc) {
        let newFunc = liberator.eval(repFunc(orgFunc.toSource()));
        return (function () { return newFunc.apply(this, arguments); });
    }

    var newHints = {
        _chars2num: function (chars) {
            return this._hintTree.chars2num(chars) + 1;
        },

        _num2chars: function (num) {
            return this._hintTree.num2chars(num - 1);
        },

        _generate: function (win, screen) {
            oldHints._generate.call(this, win, screen);
            // 重み weight を調整してリンクに割り当てる文字列の長さを調整できるかもしれない。
            //if (!win) {
            //    win = config.browser.contentWindow;
            //}
            //let cx = win.innerWidth / 2;
            //let cy = win.innerHeight / 2;
            let weights = new Array(this._pageHints.length);
            for (let i = 0; i < weights.length; i++) {
                //let x = parseInt(this._pageHints[i].span.style.left);
                //let y = parseInt(this._pageHints[i].span.style.top);
                //let d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
                //weights[i] = Math.floor((cx * cx + cy * cy - d) / 2500);
                weights[i] = 1;
            }
            // uses n-ary Huffman coding library defined in `huffman_coding.js`.
            this._hintTree = new plugins.huffman_coding.Huffman(
                options["hintchars"], weights);
            this._hintInput = "";
        },

        _updateStatusline: newFunction(Hints.prototype._updateStatusline,
            function (source) {
                return source.replace(
                    "this._num2chars(this._hintNumber)",
                    "this._hintInput"
                );
            }),

        _showHints: newFunction(Hints.prototype._showHints,
            function (source) {
                return source.replace( // line 423
                    "let activeHintChars = this._num2chars(activeHint);",
                    "let activeHintChars = this._hintInput;"
                );
            }),

        _checkUnique: newFunction(Hints.prototype._checkUnique,
            function (source) {
                return source.replace( // line 628
                    'this._hintNumber * options["hintchars"].length <= this._validHints.length',
                    'this._hintTree.commonPrefix(this._hintInput).length != 1'
                );
            }),

        onEvent: newFunction(Hints.prototype.onEvent,
            function (source) {
                return source.replace( // line 961
                    "this._hintNumber = Math.floor(this._hintNumber / 10);",
                    "this._hintInput = this._hintInput.slice(0, -1); this._hintNumber = this._char2num(this._hintInput);"
                ).replace( // line 985
                    "let oldHintNumber = this._hintNumber;",
                    "this._hintInput += key; let oldHintNumber = this._hintNumber;"
                ).replace( // line 988
                    "this._hintNumber = this._chars2num(key);",
                    "this._hintNumber = this._chars2num(this._hintInput);"
                ).replace( // line 991
                    "this._hintNumber = this._chars2num(this._num2chars(this._hintNumber) + key);",
                    "this._hintNumber = this._chars2num(this._hintInput);"
                );
            })

    };

    // save
    for (let key in newHints) {
        oldHints[key] = Hints.prototype[key];
    }

    // override
    for (let key in newHints) {
        Hints.prototype[key] = newHints[key];
    }

})();

function onUnload() {
    // restore
    for (let key in oldHints) {
        Hints.prototype[key] = oldHints[key];
    }
}
