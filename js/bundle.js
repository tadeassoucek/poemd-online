(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* Load with `defer`! */

const poemd = require("poemd-parser")

function $(q) {
  return document.querySelector(q)
}

let lastCompilation

function compile() {
  lastCompilation = Date.now()
  const code = $('#input').value
  const res = poemd.parse(code)
  $('#html-output-raw').value = $('#html-output').innerHTML = res.document.toHTML()
  $('#latex-output-raw').value = res.document.toLatex()
  for (const msg of res.messages)
    console.log(msg.toString())
}

$('#input').onkeyup = function() {
  if (Date.now() - (lastCompilation || 0) > 150)
    compile()
}

$('#input').onchange = $('#compile-button').onclick = window.onload = compile

const panel = $('.resizable-w')

panel.addEventListener('mousedown', function(e) {
  if (Math.abs(e.offsetX - parseInt(getComputedStyle(panel).width)) < 5) {
    function resize(e) {
      panel.style.width = e.x + 'px'
    }

    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', function(_) {
      document.removeEventListener('mousemove', resize)
    })
  }
})

$('#show-html-button').onclick = function() {
  $('#html-output-section').classList.toggle('hidden', false)
  $('#latex-output-section').classList.toggle('hidden', true)

  $('#show-html-button').classList.toggle('toggled', true)
  $('#show-latex-button').classList.toggle('toggled', false)
}

$('#show-latex-button').onclick = function() {
  $('#latex-output-section').classList.toggle('hidden', false)
  $('#html-output-section').classList.toggle('hidden', true)

  $('#show-latex-button').classList.toggle('toggled', true)
  $('#show-html-button').classList.toggle('toggled', false)
}

$('#show-normal-button').onclick = function() {
  $('#html-output').classList.toggle('hidden', false)
  $('#html-output-raw-section').classList.toggle('hidden', true)

  $('#show-normal-button').classList.toggle('toggled', true)
  $('#show-raw-button').classList.toggle('toggled', false)
}

$('#show-raw-button').onclick = function() {
  $('#html-output-raw-section').classList.toggle('hidden', false)
  $('#html-output').classList.toggle('hidden', true)

  $('#show-raw-button').classList.toggle('toggled', true)
  $('#show-normal-button').classList.toggle('toggled', false)
}

},{"poemd-parser":6}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.CONFIGURATION = void 0;
exports.CONFIGURATION = {
    indentation: '  ',
    defaults: {
        language: 'english',
        fontSize: 11,
        paper: 'a4'
    }
};

},{}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.ONE_OF_EXPECTED = exports.NUMERIC_VALUE_EXPECTED = exports.NO_HEADER_FOUND = exports.UNUSED_KEY = exports.Message = void 0;
var utils_1 = require("./utils");
var MessageLevel;
(function (MessageLevel) {
    MessageLevel["Info"] = "info";
    MessageLevel["Warning"] = "warning";
    MessageLevel["Error"] = "error";
})(MessageLevel || (MessageLevel = {}));
var MessageTemplate = /** @class */ (function () {
    function MessageTemplate(level, format) {
        this.id = MessageTemplate.ID++;
        this.level = level;
        this.format = format;
    }
    MessageTemplate.prototype.specify = function (args) {
        if (args === void 0) { args = {}; }
        return new Message(this, args);
    };
    MessageTemplate.ID = 0;
    return MessageTemplate;
}());
var Message = /** @class */ (function () {
    function Message(template, args) {
        this.template = template;
        this.args = args;
    }
    Message.prototype.toString = function () {
        return this.template.level + " (" + this.template.id + "): " + utils_1.formatString(this.template.format, this.args);
    };
    return Message;
}());
exports.Message = Message;
exports.UNUSED_KEY = new MessageTemplate(MessageLevel.Warning, 'unused key: "{key}"');
exports.NO_HEADER_FOUND = new MessageTemplate(MessageLevel.Info, 'no header found');
exports.NUMERIC_VALUE_EXPECTED = new MessageTemplate(MessageLevel.Error, 'property "{key}" has to be a number (got "{val}"); falling back to default');
exports.ONE_OF_EXPECTED = new MessageTemplate(MessageLevel.Error, 'property "{key}" has to be one of [{vals}] (got "{val}"); falling back to default');

},{"./utils":8}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.parse = void 0;
var message_1 = require("./message");
var poem_1 = require("./poem");
var token_1 = require("./token");
var utils_1 = require("./utils");
function lex(code) {
    var tokens = [];
    var lastTokenIsVerse = function () { return tokens.length && typeof tokens[tokens.length - 1] == 'string'; };
    /** If true, a character other than whitespace occurred on this line. */
    var lineDirty = false;
    var lineExtended = false;
    var currentToken = '';
    /** Whitespace following a possible line extension character. */
    var lostCache = '';
    var verseIndentLevel = 0;
    var breakVerse = false;
    function pushToken() {
        lineDirty = false;
        // line isn't empty
        if (currentToken) {
            if (breakVerse) {
                tokens.push(token_1.TokenType.VerseBreak);
                breakVerse = false;
            }
            else if (verseIndentLevel)
                tokens.push(verseIndentLevel);
            tokens.push(currentToken);
            if (lineExtended)
                tokens.push(token_1.TokenType.VerseContinuation);
        }
        // line is empty and the last token is a verse
        else if (lastTokenIsVerse())
            tokens.push(token_1.TokenType.EndOfStanza);
    }
    function onChar(char) {
        switch (char) {
            case '\n':
                pushToken();
                lineExtended = false;
                lostCache = '';
                lineDirty = false;
                verseIndentLevel = 0;
                currentToken = '';
                break;
            case ' ':
            case '\t':
                if (lineDirty)
                    if (lineExtended)
                        lostCache += char;
                    else
                        currentToken += char;
                else
                    verseIndentLevel++;
                break;
            case '>':
                if (lineDirty || utils_1.getLast(tokens) == token_1.TokenType.VerseContinuation)
                    currentToken += char;
                else
                    breakVerse = true;
                lineDirty = true;
                break;
            case '\\':
                if (lineExtended) {
                    if (lostCache) {
                        currentToken += '\\' + lostCache;
                        lostCache = '';
                    }
                    else
                        currentToken += '\\';
                    lineExtended = false;
                }
                else {
                    lineDirty = true;
                    lineExtended = true;
                }
                break;
            default:
                lineDirty = true;
                currentToken += char;
        }
        if (lineExtended && !utils_1.oneOf(char, '\\', ' ', '\t', '\n')) {
            lineExtended = false;
            currentToken += '\\' + lostCache;
            lostCache = '';
        }
    }
    code.split('').forEach(onChar);
    pushToken();
    tokens.push(token_1.TokenType.EndOfFile);
    return tokens;
}
function parse(code) {
    var messages = [];
    var tokens = lex(code);
    var doc = new poem_1.Document();
    var poem = new poem_1.Poem();
    doc.addPoem(poem);
    var collectingHeader = false;
    var possibleHeaderVerses = [];
    var continueVerse = false;
    var breakVerse = false;
    var verseIndentLevel = 0;
    function checkForHeader() {
        // check if all marked verses except for the first one
        // start with a key name followed by `:'
        if (possibleHeaderVerses.every(function (v, i) { return i == 0 || v.content.search(/^\s*[\w\.]+\s*:/) != -1; })) {
            if (poem.title) {
                poem = new poem_1.Poem();
                doc.addPoem(poem);
            }
            poem.title = possibleHeaderVerses[0].content.substring(1);
            var attributes_1 = {};
            possibleHeaderVerses.forEach(function (v, i) {
                if (i == 0)
                    return;
                var matches = v.content.match(/^\s*([\w\.]+)\s*:(.*)/);
                attributes_1[matches[1]] = matches[2].trim();
            });
            for (var key in attributes_1) {
                var val = attributes_1[key];
                switch (key) {
                    case 'subtitle':
                        poem.subtitle = val;
                        break;
                    case 'author':
                        poem.author = val;
                        break;
                    case 'date':
                        poem.date = val;
                        break;
                    case 'lang':
                    case 'language':
                        poem.language = val;
                        break;
                    case 'paper':
                        doc.paper = val;
                        break;
                    case 'fontSize':
                        if (isNaN(+val))
                            messages.push(message_1.NUMERIC_VALUE_EXPECTED.specify({
                                key: 'fontSize',
                                val: val
                            }));
                        else
                            doc.fontSize = val;
                        break;
                    default:
                        messages.push(message_1.UNUSED_KEY.specify({ key: key }));
                }
            }
            poem.content.push(new poem_1.Stanza());
        }
        else {
            poem.content.push(new poem_1.Stanza());
            poem.content[0].content = possibleHeaderVerses;
        }
        collectingHeader = false;
        possibleHeaderVerses = [];
    }
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token == 'string') {
            if (token.search(/^# /) != -1)
                collectingHeader = true;
            if (collectingHeader)
                if (continueVerse) {
                    utils_1.getLast(possibleHeaderVerses).content += ' ' + token;
                    continueVerse = false;
                }
                else {
                    var verse = new poem_1.Verse(token, verseIndentLevel);
                    verseIndentLevel = 0;
                    if (breakVerse) {
                        verse.breakWith = utils_1.getLast(possibleHeaderVerses);
                        breakVerse = false;
                    }
                    possibleHeaderVerses.push(verse);
                }
            else {
                var lastStanza = utils_1.getLast(poem.content);
                if (!(lastStanza instanceof poem_1.Stanza)) {
                    lastStanza = new poem_1.Stanza();
                    poem.content.push(lastStanza);
                }
                if (continueVerse && lastStanza.content.length)
                    utils_1.getLast(lastStanza.content).content += token;
                else {
                    var verse = new poem_1.Verse(token, verseIndentLevel);
                    verseIndentLevel = 0;
                    if (breakVerse) {
                        if (!lastStanza.content.length && utils_1.getLast(poem.content, 1)) {
                            var lastStanza_1 = utils_1.getLast(poem.content, 1);
                            if (lastStanza_1 instanceof poem_1.SectionTitle)
                                verse["break"](lastStanza_1);
                            else
                                verse["break"](utils_1.getLast(lastStanza_1.content));
                        }
                        else {
                            var breakWith = utils_1.getLast(lastStanza.content);
                            if (breakWith instanceof poem_1.Verse)
                                verse["break"](breakWith);
                        }
                        breakVerse = false;
                    }
                    lastStanza.content.push(verse);
                }
                continueVerse = false;
                breakVerse = false;
            }
        }
        else
            switch (token) {
                case token_1.TokenType.VerseContinuation:
                    continueVerse = true;
                    break;
                case token_1.TokenType.VerseBreak:
                    breakVerse = true;
                    break;
                case token_1.TokenType.EndOfFile:
                case token_1.TokenType.EndOfStanza:
                    continueVerse = false;
                    if (collectingHeader)
                        checkForHeader();
                    else {
                        var t = void 0;
                        var ls = utils_1.getLast(poem.content);
                        if (ls instanceof poem_1.Stanza && ls.content.length == 1) {
                            var lv = utils_1.getLast(ls.content);
                            var c = lv.content.replace(/^## /, '');
                            if (lv.content != c) {
                                t = new poem_1.SectionTitle(c);
                                poem.content.pop();
                            }
                        }
                        poem.content.push(t !== null && t !== void 0 ? t : new poem_1.Stanza());
                    }
                    collectingHeader = false;
                    break;
                default:
                    verseIndentLevel = token;
            }
    }
    doc.clean();
    return { tokens: tokens, document: doc, messages: messages };
}
exports.parse = parse;

},{"./message":3,"./poem":5,"./token":7,"./utils":8}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.Document = exports.Poem = exports.SectionTitle = exports.Stanza = exports.Verse = void 0;
var utils_1 = require("./utils");
var config_1 = require("./config");
var htmlStyle = '<style>\n' + utils_1.indent('.poemsubtitle, .poemauthor {\n' +
    utils_1.indent('margin-left: 3em;') + '\n}\n' +
    '.poemsubtitle { margin-bottom: 1em }\n' +
    '.poemauthor { font-style: italic }\n' +
    '.poemdate { margin-top: 4em }\n' +
    '.verseindent { margin-right: 2em }\n' +
    '.versephantom {\n' +
    utils_1.indent('color: transparent;\n' +
        'user-select: none;\n' +
        '-moz-user-select: none;\n' +
        '-webkit-user-select: none;') + '\n}') + '\n</style>\n\n';
var Verse = /** @class */ (function () {
    function Verse(content, indentLevel, breakWith) {
        this.isBroken = false;
        this.indentLevel = 0;
        this.content = content;
        this.indentLevel = indentLevel;
        this.breakWith = breakWith;
        this.isBroken = !!breakWith;
    }
    Verse.prototype["break"] = function (v) {
        this.breakWith = v;
        if (v instanceof Verse)
            v.isBroken = true;
    };
    Verse.prototype.clean = function () {
        this.content = utils_1.cleanString(this.content);
    };
    Verse.prototype.toLatex = function (last) {
        if (last === void 0) { last = false; }
        var modifiedContent = utils_1.escapeLatex(this.content);
        var s = '';
        if (this.breakWith)
            s = "\\versephantom{" + utils_1.escapeLatex(this.breakWith.content) + "}";
        else if (this.indentLevel)
            if (this.indentLevel == 1)
                s = '\\verseindent';
            else
                s = "\\verseindent[" + this.indentLevel + "]";
        return (s ? s + ' ' : '') + modifiedContent + ' ' +
            (last ? '' : (this.isBroken ? '\\brokenline' : '\\verseline') + '\n');
    };
    Verse.prototype.toHTML = function (last) {
        if (last === void 0) { last = false; }
        var modifiedContent = utils_1.escapeHTML(this.content);
        var s = '';
        if (this.breakWith)
            s = "<span class=\"versephantom\">" + utils_1.escapeHTML(this.breakWith.content) + "</span>";
        else if (this.indentLevel)
            s = utils_1.repeat('<span class="verseindent"></span>', this.indentLevel);
        return (s ? s + ' ' : '') + modifiedContent + ' ' +
            (last ? '' : '<br>' + '\n');
    };
    Verse.prototype.toString = function () {
        return utils_1.repeat(config_1.CONFIGURATION.indentation, this.indentLevel) +
            (this.breakWith ? utils_1.repeat(' ', this.breakWith.content.length + 1) : '') + this.content;
    };
    return Verse;
}());
exports.Verse = Verse;
var Stanza = /** @class */ (function () {
    function Stanza() {
        this.content = [];
    }
    Stanza.prototype.clean = function () {
        this.content.forEach(function (v) { return v.clean(); });
    };
    Stanza.prototype.toString = function () {
        return this.content.join('\n');
    };
    Stanza.prototype.toHTML = function () {
        var _this = this;
        return utils_1.indent("<p class=\"stanza\">\n" + this.content.map(function (v, i) { return config_1.CONFIGURATION.indentation + v.toHTML(i == _this.content.length - 1); }).join('') + "\n</p>");
    };
    Stanza.prototype.toLatex = function () {
        var _this = this;
        return utils_1.indent("\\begin{stanza}\n" + this.content.map(function (v, i) { return config_1.CONFIGURATION.indentation + v.toLatex(i == _this.content.length - 1); }).join('') + "\n\\end{stanza}");
    };
    return Stanza;
}());
exports.Stanza = Stanza;
var SectionTitle = /** @class */ (function () {
    function SectionTitle(content) {
        this.content = content;
    }
    SectionTitle.prototype.clean = function () {
        this.content = utils_1.cleanString(this.content);
    };
    SectionTitle.prototype.toLatex = function () {
        return config_1.CONFIGURATION.indentation + ("\\poemsectiontitle{" + utils_1.renderMD(utils_1.escapeLatex(this.content), 'latex') + "}");
    };
    SectionTitle.prototype.toHTML = function () {
        return config_1.CONFIGURATION.indentation + ("<h2>" + utils_1.renderMD(utils_1.escapeHTML(this.content), 'html') + "</h2>");
    };
    SectionTitle.prototype.toString = function () {
        return config_1.CONFIGURATION.indentation + this.content + '\n' + utils_1.repeat('-', this.content.length) + '\n';
    };
    return SectionTitle;
}());
exports.SectionTitle = SectionTitle;
var Poem = /** @class */ (function () {
    function Poem() {
        this.content = [];
        this.language = config_1.CONFIGURATION.defaults.language;
    }
    /**
     * Remove empty stanzas and trim all verses.
     */
    Poem.prototype.clean = function () {
        this.title = utils_1.cleanString(this.title);
        this.subtitle = utils_1.cleanString(this.subtitle);
        this.author = utils_1.cleanString(this.author);
        this.content = this.content.filter(function (s) { return s.content.length; });
        this.content.forEach(function (s) { return s.clean(); });
    };
    Poem.prototype.toString = function () {
        var header = '';
        if (this.title)
            header = this.title + '\n' + utils_1.repeat('=', this.title.length) + '\n';
        if (this.subtitle)
            header += this.subtitle + '\n';
        if (this.author)
            header += config_1.CONFIGURATION.indentation + 'by ' + this.author + '\n';
        if (this.date)
            header += config_1.CONFIGURATION.indentation +
                (this.date == 'auto' ? utils_1.getLatexDate() : this.date) + '\n';
        return (header ? header + '\n\n' : '') +
            this.content.join('\n\n');
    };
    Poem.prototype.toHTML = function (selfContained) {
        if (selfContained === void 0) { selfContained = false; }
        var s = '<div class="poem">\n';
        if (selfContained)
            s += htmlStyle;
        if (this.title) {
            var header = '<header>\n' + utils_1.indent('<h1>' + utils_1.renderMD(utils_1.escapeHTML(this.title), 'html') + '</h1>') + '\n';
            if (this.subtitle)
                header += utils_1.indent('<div class="poemsubtitle">' + utils_1.renderMD(utils_1.escapeHTML(this.subtitle), 'html') + '</div>') + '\n';
            if (this.author)
                header += utils_1.indent('<div class="poemauthor">' + utils_1.renderMD(utils_1.escapeHTML(this.author), 'html') + '</div>') + '\n';
            header += '</header>';
            s += utils_1.indent(header) + '\n\n';
        }
        s += utils_1.renderMD(this.content.map(function (s) { return s.toHTML(); }).join('\n'), 'html');
        if (this.date) {
            var date = this.date;
            if (date == 'auto')
                date = utils_1.getLatexDate();
            s += '\n\n' + utils_1.indent('<footer>\n' +
                utils_1.indent('<div class="poemdate">' + utils_1.renderMD(utils_1.escapeHTML(date), 'html') + '</div>') +
                '\n</footer>') + '\n';
        }
        s += '\n</div>';
        return s;
    };
    Poem.prototype.toLatex = function () {
        var s = '\\begin{poem}\n';
        if (this.title)
            s += utils_1.indent("\\poemtitle{" + utils_1.renderMD(utils_1.escapeLatex(this.title), 'latex') + "}") + '\n';
        if (this.subtitle)
            s += utils_1.indent("\\poemsubtitle{" + utils_1.renderMD(utils_1.escapeLatex(this.subtitle), 'latex') + "}") + '\n';
        if (this.author)
            s += utils_1.indent("\\attribution{" + utils_1.renderMD(utils_1.escapeLatex(this.author), 'latex') + "}") + '\n';
        s += "\n" + utils_1.renderMD(this.content.map(function (s) { return s.toLatex(); }).join('\n\n'), 'latex') + "\n\n\\end{poem}";
        if (this.date) {
            var date = this.date;
            if (date == 'auto')
                date = utils_1.getLatexDate();
            s += "\n\\poemdate{" + utils_1.renderMD(utils_1.escapeLatex(date), 'latex') + "}";
        }
        return s;
    };
    return Poem;
}());
exports.Poem = Poem;
var Document = /** @class */ (function () {
    function Document() {
        this.poems = [];
        this.paper = config_1.CONFIGURATION.defaults.paper;
        this.fontSize = config_1.CONFIGURATION.defaults.fontSize;
    }
    Document.prototype.addPoem = function (poem) {
        this.poems.push(poem);
    };
    Document.prototype.clean = function () {
        this.poems.forEach(function (p) { return p.clean(); });
    };
    Document.prototype.getLatexClass = function () {
        var options = ['twoside', this.paper.toLowerCase() + 'paper', this.fontSize + 'pt'];
        return "\\documentclass[" + options.join(',') + "]{article}";
    };
    Document.prototype.getLanguages = function () {
        var langs = [];
        this.poems.forEach(function (p) {
            if (langs.indexOf(p.language) != -1)
                langs.push(p.language);
        });
        return langs.length ? langs.join(',') : config_1.CONFIGURATION.defaults.language;
    };
    Document.prototype.indentUsed = function () {
        var res = false;
        try {
            this.poems.forEach(function (p) {
                return p.content.forEach(function (s) {
                    return s instanceof Stanza && s.content.forEach(function (v) {
                        if (v.indentLevel) {
                            res = true;
                            throw null;
                        }
                    });
                });
            });
        }
        catch (e) {
            if (e)
                throw e;
        }
        return res;
    };
    Document.prototype.toHTML = function (selfContained) {
        if (selfContained === void 0) { selfContained = false; }
        var s = '<!DOCTYPE html>\n\n' +
            '<html>\n\n';
        if (selfContained)
            s += '<head>\n\n' + htmlStyle + '</head>\n\n';
        s += '<body>\n\n';
        this.poems.forEach(function (p) { return s += p.toHTML(false) + '\n\n'; });
        s += '</body>\n\n</html>\n';
        return s;
    };
    Document.prototype.toLatex = function () {
        var s = this.getLatexClass() + '\n\n' +
            '\\usepackage[utf8]{inputenc}\n' +
            ("\\usepackage[" + this.getLanguages() + "]{babel}\n") +
            '\\usepackage[pass]{geometry}\n' +
            '\\usepackage{ulem}\n' +
            '\\usepackage{fancyhdr}\n' +
            '\\usepackage{poemscol}\n' +
            (this.indentUsed() ? '\\usepackage{ifthen}\n' : '') + '\n';
        s += '\\normalem\n' +
            '\\normaltitleindentationscheme\n\n' +
            '\\begin{document}\n\n';
        this.poems.forEach(function (p) { return s += p.toLatex() + '\n\n'; });
        s += '\\end{document}\n';
        return s;
    };
    return Document;
}());
exports.Document = Document;

},{"./config":2,"./utils":8}],6:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.parse = exports.Document = exports.Poem = exports.SectionTitle = exports.Stanza = exports.Verse = exports.Message = void 0;
exports.parse = require("./parser").parse;
var poem = require("./poem");
exports.Document = poem.Document;
exports.Poem = poem.Poem;
exports.SectionTitle = poem.SectionTitle;
exports.Stanza = poem.Stanza;
exports.Verse = poem.Verse;
exports.Message = require("./message");

},{"./message":3,"./parser":4,"./poem":5}],7:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["EndOfFile"] = -3] = "EndOfFile";
    TokenType[TokenType["EndOfStanza"] = -2] = "EndOfStanza";
    TokenType[TokenType["VerseContinuation"] = -1] = "VerseContinuation";
    TokenType[TokenType["VerseBreak"] = 0] = "VerseBreak";
    // any number >0 is verse indentation
})(TokenType = exports.TokenType || (exports.TokenType = {}));

},{}],8:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.indent = exports.renderMD = exports.escapeHTML = exports.escapeLatex = exports.cleanString = exports.getLatexDate = exports.formatString = exports.getValues = exports.getKeys = exports.repeat = exports.getLast = exports.oneOf = void 0;
var config_1 = require("./config");
function oneOf(orig) {
    var vals = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        vals[_i - 1] = arguments[_i];
    }
    for (var _a = 0, vals_1 = vals; _a < vals_1.length; _a++) {
        var e = vals_1[_a];
        if (e == orig)
            return true;
    }
    return false;
}
exports.oneOf = oneOf;
function getLast(arr, offset) {
    if (offset === void 0) { offset = 0; }
    return arr[arr.length - 1 - offset];
}
exports.getLast = getLast;
function repeat(str, count) {
    var res = '';
    for (var i = 0; i < count; i++)
        res += str;
    return res;
}
exports.repeat = repeat;
/** ES3 compliant replacement for `Object.keys`. */
function getKeys(obj) {
    var res = [];
    for (var k in obj)
        res.push(k);
    return res;
}
exports.getKeys = getKeys;
/** ES3 compliant replacement for `Object.values`. */
function getValues(obj) {
    var res = [];
    for (var k in obj)
        res.push(obj[k]);
    return res;
}
exports.getValues = getValues;
function formatString(format, args) {
    var res = format;
    for (var key in args)
        res = res.replace(new RegExp("{" + key + "}", 'g'), args[key].toString());
    return res;
}
exports.formatString = formatString;
function getLatexDate() {
    var date = new Date();
    var month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    return month + " " + date.getDate() + ", " + date.getFullYear();
}
exports.getLatexDate = getLatexDate;
function cleanString(s) {
    return s == void 0 ? void 0 : s.trim().replace(/\s+/g, ' ');
}
exports.cleanString = cleanString;
function escapeLatex(s) {
    return (s !== null && s !== void 0 ? s : '')
        .replace(/\\/g, '\\textbackslash ')
        .replace(/\\textbackslash  /g, '\\textbackslash\\ ')
        .replace(/\^/g, '\\textasciicircum ')
        .replace(/\\textasciicircum  /g, '\\textasciicircum\\ ')
        .replace(/&/g, '\\&')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/%/g, '\\%')
        .replace(/\.\.\. /g, '\\ldots\\ ')
        .replace(/\.\.\./g, '\\ldots ');
}
exports.escapeLatex = escapeLatex;
function escapeHTML(s) {
    return (s !== null && s !== void 0 ? s : '')
        .replace(/</g, '&iexcl;')
        .replace(/>/g, '&iquest;')
        .replace(/&/g, '&amp;')
        .replace(/\.\.\./g, '&hellip;')
        .replace(/---/g, '&mdash;')
        .replace(/--/g, '&ndash;')
        .replace(/``/g, '&ldquo;')
        .replace(/''/g, '&rdquo;')
        .replace(/"/g, '&rdquo;')
        .replace(/,,/g, '&bdquo;')
        .replace(/`/g, '&lsquo;')
        .replace(/'/g, '&rsquo;');
}
exports.escapeHTML = escapeHTML;
function renderMD(s, lang) {
    s = (s !== null && s !== void 0 ? s : '')
        .replace(/~~(\S[\s\S]*?\S)~~/gm, lang == 'latex' ? '\\sout{$1}' : '<s>$1</s>')
        .replace(/__(\S[\s\S]*?\S)__/gm, lang == 'latex' ? '\\underline{$1}' : '<u>$1</u>')
        .replace(/\*\*(\S[\s\S]*?\S)\*\*/gm, lang == 'latex' ? '\\textbf{$1}' : '<strong>$1</strong>')
        .replace(/\*(\S[\s\S]*?\S)\*/gm, lang == 'latex' ? '\\emph{$1}' : '<em>$1</em>');
    if (lang == 'latex')
        s = s
            .replace(/_/g, '\\_')
            .replace(/~/g, '\\texttilde ')
            .replace(/\\texttilde  /g, '\\texttilde\\ ');
    return s;
}
exports.renderMD = renderMD;
function indent(s, count) {
    if (count === void 0) { count = 1; }
    return (s !== null && s !== void 0 ? s : '')
        .replace(/^/gm, repeat(config_1.CONFIGURATION.indentation, count));
}
exports.indent = indent;

},{"./config":2}]},{},[1]);
