'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _quillDelta = require('quill-delta');

var _quillDelta2 = _interopRequireDefault(_quillDelta);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var REGEXP_GLOBAL = /https?:\/\/[\S]+/g;
var REGEXP_URL = /(https?:\/\/[\S]+)/;

var AutoLinks = function () {
  function AutoLinks(quill) {
    _classCallCheck(this, AutoLinks);

    this.quill = quill;
    this.registerTypeListener();
    this.registerPasteListener();
  }

  _createClass(AutoLinks, [{
    key: 'registerPasteListener',
    value: function registerPasteListener() {
      this.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
        if (typeof node.data !== 'string') {
          return;
        }
        var matches = node.data.match(REGEXP_GLOBAL);
        if (matches && matches.length > 0) {
          var ops = [];
          var str = node.data;
          matches.forEach(function (match) {
            var split = str.split(match);
            var beforeLink = split.shift();
            ops.push({ insert: beforeLink });
            ops.push({ insert: match, attributes: { link: match } });
            str = split.join(match);
          });
          ops.push({ insert: str });
          delta.ops = ops;
        }
        return delta;
      });
    }
  }, {
    key: 'registerTypeListener',
    value: function registerTypeListener() {
      var _this = this;

      this.quill.on('text-change', function (delta) {
        var ops = delta.ops;
        // Only return true, if last operation includes whitespace inserts
        // Equivalent to listening for enter, tab or space
        if (!ops || ops.length < 1 || ops.length > 2) {
          return;
        }
        var lastOp = ops[ops.length - 1];
        if (!lastOp.insert || !lastOp.insert.match(/\s/)) {
          return;
        }
        _this.checkTextForUrl();
      });
    }
  }, {
    key: 'checkTextForUrl',
    value: function checkTextForUrl() {
      var sel = this.quill.getSelection();
      if (!sel) {
        return;
      }

      var _quill$getLeaf = this.quill.getLeaf(sel.index),
          _quill$getLeaf2 = _slicedToArray(_quill$getLeaf, 1),
          leaf = _quill$getLeaf2[0];

      if (!leaf.text) {
        return;
      }
      var urlMatch = leaf.text.match(REGEXP_URL);
      if (!urlMatch) {
        return;
      }
      var stepsBack = leaf.text.length - urlMatch.index;
      var index = sel.index - stepsBack;
      this.textToUrl(index, urlMatch[0]);
    }
  }, {
    key: 'textToUrl',
    value: function textToUrl(index, url) {
      var ops = new _quillDelta2.default().retain(index).delete(url.length).insert(url, { link: url });
      this.quill.updateContents(ops);
    }
  }]);

  return AutoLinks;
}();

exports.default = AutoLinks;