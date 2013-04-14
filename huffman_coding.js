// n-ary Huffman coding library

var Huffman = function (alphabets, weights) {
    var ary = new Array(weights.length);
    for (var i = 0; i < weights.length; i++) {
        ary[i] = { weight: weights[i], children: [], chr: '', num: i };
    }
    var m = alphabets.length;
    while (ary.length != 1) {
        ary.sort(function (a, b) {
            return a.weight > b.weight ? -1 : 1;
        });
        var children = [];
        var weight = 0;
        var n = ary.length;
        for (var i = 0; i < (n + m - 3) % (m - 1) + 2; i++) {
            if (ary.length == 0) {
                break;
            }
            var e = ary.pop();
            e.chr = alphabets[i];
            weight += e.weight;
            children.push(e);
        }
        ary.push( { weight: weight, children: children, chr: '', num: -1 } );
    }
    function walk(root) {
        var a1 = {};
        for (var i = 0; i < root.children.length; i++) {
            var e = root.children[i];
            if (e.children.length > 0) {
                var a2 = walk(e);
                for (var num in a2) {
                    a1[num] = e.chr + a2[num];
                }
            } else {
                a1[e.num] = e.chr;
            }
        }
        return a1;
    }
    this.tree = ary.pop();
    this.n2cTable = walk(this.tree);
}

Huffman.prototype = {

    num2chars: function (num) {
        return this.n2cTable[num];
    },

    chars2num: function (chr) {
        return this.commonPrefix(chr)[0];
    },

    commonPrefix: function (chr) {
        var root = this.tree;
        var p = 0;
        var i = 0;
        while (i < root.children.length) {
            if (root.children[i].chr == chr.charAt(p)) {
                p += 1;
                root = root.children[i];
                i = 0;
            } else {
                i += 1;
            }
        }
        function walk(node) {
            if (node.children.length > 0) {
                var a = [];
                for (var i = 0; i < node.children.length; i++) {
                    Array.prototype.push.apply(a, walk(node.children[i]));
                }
                return a;
            } else {
                return [node.num];
            }
        }
        return walk(root);
    },

    showTree: function () {
        function walk(root) {
            var s = "( ";
            for (var i = 0; i < root.children.length; i++) {
                var e = root.children[i];
                if (e.children.length > 0) {
                    s += walk(e) + ":" + e.chr;
                } else {
                    s += e.num + ":" + e.chr;
                }
                s += ' ';
            }
            s += ")";
            return s
        }
        return walk(this.tree);
    }

};
