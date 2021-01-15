"use strict";

const Parser = (function () { 

function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }
  
  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";
  
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }
  
  peg$subclass(peg$SyntaxError, Error);
  
  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return "\"" + literalEscape(expectation.text) + "\"";
          },
  
          "class": function(expectation) {
            var escapedParts = "",
                i;
  
            for (i = 0; i < expectation.parts.length; i++) {
              escapedParts += expectation.parts[i] instanceof Array
                ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                : classEscape(expectation.parts[i]);
            }
  
            return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
          },
  
          any: function(expectation) {
            return "any character";
          },
  
          end: function(expectation) {
            return "end of input";
          },
  
          other: function(expectation) {
            return expectation.description;
          }
        };
  
    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
  
    function literalEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g,  '\\"')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }
  
    function classEscape(s) {
      return s
        .replace(/\\/g, '\\\\')
        .replace(/\]/g, '\\]')
        .replace(/\^/g, '\\^')
        .replace(/-/g,  '\\-')
        .replace(/\0/g, '\\0')
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
        .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
    }
  
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
  
    function describeExpected(expected) {
      var descriptions = new Array(expected.length),
          i, j;
  
      for (i = 0; i < expected.length; i++) {
        descriptions[i] = describeExpectation(expected[i]);
      }
  
      descriptions.sort();
  
      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
  
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
  
        case 2:
          return descriptions[0] + " or " + descriptions[1];
  
        default:
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }
  
    function describeFound(found) {
      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }
  
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };
  
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
  
    var peg$FAILED = {},
  
        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,
  
        peg$c0 = " ",
        peg$c1 = peg$literalExpectation(" ", false),
        peg$c2 = "|",
        peg$c3 = peg$literalExpectation("|", false),
        peg$c4 = function(i) {return i;},
        peg$c5 = function(start, last) {return start.concat(last)},
        peg$c6 = function(note, quality, accAdd, modList, addList, slashNote) {
          return {
            
          "note": note,
          "quality":quality,
          "modList": modList,
          "addList": accAdd.concat(addList),
          "slashNote": slashNote
          }
        },
        peg$c7 = function(root, acc) {return root + acc},
        peg$c8 = /^[A-G]/,
        peg$c9 = peg$classExpectation([["A", "G"]], false, false),
        peg$c10 = "b",
        peg$c11 = peg$literalExpectation("b", false),
        peg$c12 = "#",
        peg$c13 = peg$literalExpectation("#", false),
        peg$c14 = function(acc) {
          if(acc === undefined)
          {
            return ""
          }
          else {
            return acc.join("");
          }
        },
        peg$c15 = "sus2",
        peg$c16 = peg$literalExpectation("sus2", false),
        peg$c17 = "sus4",
        peg$c18 = peg$literalExpectation("sus4", false),
        peg$c19 = function(extension, triad) {
        return {
        "triad":{
            "symbol":triad,
            "value":triad,
        },
        "extension": extension
        }
        },
        peg$c20 = "dim",
        peg$c21 = peg$literalExpectation("dim", false),
        peg$c22 = function() {
          return {
            "symbol":"dim",
            "value":"dim",
          }
        },
        peg$c23 = "aug",
        peg$c24 = peg$literalExpectation("aug", false),
        peg$c25 = function() {
          return {
            "symbol":"aug",
            "value":"aug",
          }
        },
        peg$c26 = "m",
        peg$c27 = peg$literalExpectation("m", false),
        peg$c28 = function() {
          return {
            "symbol":"m",
            "value":"minor",
          }
        },
        peg$c29 = "-maj7",
        peg$c30 = peg$literalExpectation("-maj7", false),
        peg$c31 = "-maj9",
        peg$c32 = peg$literalExpectation("-maj9", false),
        peg$c33 = "-maj11",
        peg$c34 = peg$literalExpectation("-maj11", false),
        peg$c35 = "-maj13",
        peg$c36 = peg$literalExpectation("-maj13", false),
        peg$c37 = function(triad, symbol) {
        return {
           "triad": triad,
            "extension": {
              "symbol":symbol,
              "value":symbol.substr(1),
              } 
        }
        },
        peg$c38 = function(triad, extension) {
        return {
        "triad":triad ? triad : {
            "symbol":"",
            "value":"major",
          },
        "extension":extension
        }
        },
        peg$c39 = "\xF8",
        peg$c40 = peg$literalExpectation("\xF8", false),
        peg$c41 = function() {
          return {
            "symbol":"ø",
            "value":"dim",
          }
        },
        peg$c42 = "dom",
        peg$c43 = peg$literalExpectation("dom", false),
        peg$c44 = function() {
          return {
            "symbol":"dom",
            "value":"major",
          }
        },
        peg$c45 = "maj",
        peg$c46 = peg$literalExpectation("maj", false),
        peg$c47 = function() {
          return {
            "symbol":"maj",
            "value":"major",
          }
        },
        peg$c48 = "+",
        peg$c49 = peg$literalExpectation("+", false),
        peg$c50 = function(symbol) {
          return {
            "symbol":symbol,
            "value":"aug",
          }
        },
        peg$c51 = function() {
          return {
            "symbol":"sus2",
            "value":"sus2",
          }
        },
        peg$c52 = function() {
          return {
            "symbol":"sus4",
            "value":"sus4",
          }
        },
        peg$c53 = "lyd",
        peg$c54 = peg$literalExpectation("lyd", false),
        peg$c55 = function() {
          return {
            "symbol":"lyd",
            "value":"lyd",
          }
        },
        peg$c56 = "phryg",
        peg$c57 = peg$literalExpectation("phryg", false),
        peg$c58 = function() {
          return {
            "symbol":"phryg",
            "value":"phryg",
          }
        },
        peg$c59 = "6",
        peg$c60 = peg$literalExpectation("6", false),
        peg$c61 = function() {
          return {
            "symbol":"6",
            "value":"6",
          }
        },
        peg$c62 = function(digit) {
          return {
            "symbol":digit,
            "value":digit,
          }
        },
        peg$c63 = function() {
          return {
            "symbol":"",
            "value":"7",
          }
        },
        peg$c64 = function(digit) {
          return {
            "symbol":digit,
            "value": "dim" + digit,
          }
        },
        peg$c65 = function(extensionSymbol, extensionDigits) {
          return {
            "symbol":(extensionSymbol? extensionSymbol : "" ) + extensionDigits,
            "value":(extensionSymbol? extensionSymbol : ""  )  + extensionDigits,
          }
        },
        peg$c66 = function() {
          return {
            "symbol":"",
            "value":"",
          }
        },
        peg$c67 = "\u0394",
        peg$c68 = peg$literalExpectation("\u0394", false),
        peg$c69 = function(digit) {
          return {
            "symbol":"Δ" + digit,
            "value":"maj" + digit,
          }
        },
        peg$c70 = function() {
          return {
            "symbol":"Δ",
            "value":"maj7",
          }
        },
        peg$c71 = "7",
        peg$c72 = peg$literalExpectation("7", false),
        peg$c73 = "9",
        peg$c74 = peg$literalExpectation("9", false),
        peg$c75 = "11",
        peg$c76 = peg$literalExpectation("11", false),
        peg$c77 = "13",
        peg$c78 = peg$literalExpectation("13", false),
        peg$c79 = "-maj",
        peg$c80 = peg$literalExpectation("-maj", false),
        peg$c81 = "M",
        peg$c82 = peg$literalExpectation("M", false),
        peg$c83 = "-M",
        peg$c84 = peg$literalExpectation("-M", false),
        peg$c85 = function() {return "maj"},
        peg$c86 = function(acc) {
            return acc.join("");
        },
        peg$c87 = "",
        peg$c88 = function(acc) {
          if(acc === "")
          {
            return ""
          }
          else {
            return acc.join("");
          }
        },
        peg$c89 = "2",
        peg$c90 = peg$literalExpectation("2", false),
        peg$c91 = "3",
        peg$c92 = peg$literalExpectation("3", false),
        peg$c93 = "4",
        peg$c94 = peg$literalExpectation("4", false),
        peg$c95 = "5",
        peg$c96 = peg$literalExpectation("5", false),
        peg$c97 = "8",
        peg$c98 = peg$literalExpectation("8", false),
        peg$c99 = "10",
        peg$c100 = peg$literalExpectation("10", false),
        peg$c101 = "12",
        peg$c102 = peg$literalExpectation("12", false),
        peg$c103 = function(head, tail) {
        return head + tail;
        },
        peg$c104 = "(",
        peg$c105 = peg$literalExpectation("(", false),
        peg$c106 = ",",
        peg$c107 = peg$literalExpectation(",", false),
        peg$c108 = ")",
        peg$c109 = peg$literalExpectation(")", false),
        peg$c110 = "add",
        peg$c111 = peg$literalExpectation("add", false),
        peg$c112 = /^[\t\n\r]/,
        peg$c113 = peg$classExpectation(["\t", "\n", "\r"], false, false),
        peg$c114 = "/",
        peg$c115 = peg$literalExpectation("/", false),
        peg$c116 = function(note) {return note;},
  
        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1 }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,
  
        peg$result;
  
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }
  
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
  
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
  
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
  
    function expected(description, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
  
      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location
      );
    }
  
    function error(message, location) {
      location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
  
      throw peg$buildSimpleError(message, location);
    }
  
    function peg$literalExpectation(text, ignoreCase) {
      return { type: "literal", text: text, ignoreCase: ignoreCase };
    }
  
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
    }
  
    function peg$anyExpectation() {
      return { type: "any" };
    }
  
    function peg$endExpectation() {
      return { type: "end" };
    }
  
    function peg$otherExpectation(description) {
      return { type: "other", description: description };
    }
  
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos], p;
  
      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }
  
        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column
        };
  
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
  
          p++;
        }
  
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
  
    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);
  
      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }
  
    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }
  
      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }
  
      peg$maxFailExpected.push(expected);
    }
  
    function peg$buildSimpleError(message, location) {
      return new peg$SyntaxError(message, null, null, location);
    }
  
    function peg$buildStructuredError(expected, found, location) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected, found),
        expected,
        found,
        location
      );
    }
  
    function peg$parsestart() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
  
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parsechord();
      if (s3 !== peg$FAILED) {
        s4 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s5 = peg$c0;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c1); }
        }
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          if (input.charCodeAt(peg$currPos) === 32) {
            s5 = peg$c0;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c1); }
          }
        }
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 124) {
            s5 = peg$c2;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c3); }
          }
          if (s5 !== peg$FAILED) {
            s6 = [];
            if (input.charCodeAt(peg$currPos) === 32) {
              s7 = peg$c0;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c1); }
            }
            while (s7 !== peg$FAILED) {
              s6.push(s7);
              if (input.charCodeAt(peg$currPos) === 32) {
                s7 = peg$c0;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c1); }
              }
            }
            if (s6 !== peg$FAILED) {
              peg$savedPos = s2;
              s3 = peg$c4(s3);
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$parsechord();
        if (s3 !== peg$FAILED) {
          s4 = [];
          if (input.charCodeAt(peg$currPos) === 32) {
            s5 = peg$c0;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c1); }
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (input.charCodeAt(peg$currPos) === 32) {
              s5 = peg$c0;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c1); }
            }
          }
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 124) {
              s5 = peg$c2;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c3); }
            }
            if (s5 !== peg$FAILED) {
              s6 = [];
              if (input.charCodeAt(peg$currPos) === 32) {
                s7 = peg$c0;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c1); }
              }
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                if (input.charCodeAt(peg$currPos) === 32) {
                  s7 = peg$c0;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c1); }
                }
              }
              if (s6 !== peg$FAILED) {
                peg$savedPos = s2;
                s3 = peg$c4(s3);
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsechord();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c5(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
  
      return s0;
    }
  
    function peg$parsechord() {
      var s0, s1, s2, s3, s4, s5, s6;
  
      s0 = peg$currPos;
      s1 = peg$parsenote();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsequality();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseaccAdd();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemodList();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseaddList();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseslashNote();
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c6(s1, s2, s3, s4, s5, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
  
      return s0;
    }
  
    function peg$parsenote() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = peg$parserootNote();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseaccidentals();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c7(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
  
      return s0;
    }
  
    function peg$parserootNote() {
      var s0;
  
      if (peg$c8.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
  
      return s0;
    }
  
    function peg$parseaccidentals() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 98) {
        s2 = peg$c10;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 98) {
            s2 = peg$c10;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = [];
        if (input.charCodeAt(peg$currPos) === 35) {
          s2 = peg$c12;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c13); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (input.charCodeAt(peg$currPos) === 35) {
              s2 = peg$c12;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          peg$silentFails++;
          if (input.charCodeAt(peg$currPos) === 98) {
            s2 = peg$c10;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 35) {
              s2 = peg$c12;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
          }
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = void 0;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c14(s1);
      }
      s0 = s1;
  
      return s0;
    }
  
    function peg$parsequality() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = peg$parseextension();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c15) {
          s2 = peg$c15;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c16); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c17) {
            s2 = peg$c17;
            peg$currPos += 4;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c18); }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c19(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        if (input.substr(peg$currPos, 3) === peg$c20) {
          s2 = peg$c20;
          peg$currPos += 3;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s1;
          s2 = peg$c22();
        }
        s1 = s2;
        if (s1 === peg$FAILED) {
          s1 = peg$currPos;
          if (input.substr(peg$currPos, 3) === peg$c23) {
            s2 = peg$c23;
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s1;
            s2 = peg$c25();
          }
          s1 = s2;
          if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 109) {
              s2 = peg$c26;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c27); }
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s1;
              s2 = peg$c28();
            }
            s1 = s2;
          }
        }
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 5) === peg$c29) {
            s2 = peg$c29;
            peg$currPos += 5;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 5) === peg$c31) {
              s2 = peg$c31;
              peg$currPos += 5;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c32); }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 6) === peg$c33) {
                s2 = peg$c33;
                peg$currPos += 6;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 6) === peg$c35) {
                  s2 = peg$c35;
                  peg$currPos += 6;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c36); }
                }
              }
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c37(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsetriad();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseextension();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c38(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
  
      return s0;
    }
  
    function peg$parsetriad() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 248) {
        s2 = peg$c39;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      peg$silentFails--;
      if (s2 !== peg$FAILED) {
        peg$currPos = s1;
        s1 = void 0;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c41();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 3) === peg$c42) {
          s2 = peg$c42;
          peg$currPos += 3;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c43); }
        }
        peg$silentFails--;
        if (s2 !== peg$FAILED) {
          peg$currPos = s1;
          s1 = void 0;
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c44();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 3) === peg$c20) {
            s2 = peg$c20;
            peg$currPos += 3;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c21); }
          }
          peg$silentFails--;
          if (s2 !== peg$FAILED) {
            peg$currPos = s1;
            s1 = void 0;
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c22();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 3) === peg$c45) {
              s2 = peg$c45;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c46); }
            }
            peg$silentFails--;
            if (s2 !== peg$FAILED) {
              peg$currPos = s1;
              s1 = void 0;
            } else {
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c47();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 109) {
                s1 = peg$c26;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c27); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c28();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c23) {
                  s1 = peg$c23;
                  peg$currPos += 3;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
                }
                if (s1 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 43) {
                    s1 = peg$c48;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c49); }
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c50(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 4) === peg$c15) {
                    s1 = peg$c15;
                    peg$currPos += 4;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c16); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c51();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 4) === peg$c17) {
                      s1 = peg$c17;
                      peg$currPos += 4;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c18); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c52();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 3) === peg$c53) {
                        s1 = peg$c53;
                        peg$currPos += 3;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c54); }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c55();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 5) === peg$c56) {
                          s1 = peg$c56;
                          peg$currPos += 5;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c57); }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c58();
                        }
                        s0 = s1;
                      }
                    }
                  }
                }
              }
              if (s0 === peg$FAILED) {
                s0 = null;
              }
            }
          }
        }
      }
  
      return s0;
    }
  
    function peg$parseextension() {
      var s0, s1, s2, s3;
  
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 54) {
        s1 = peg$c59;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c60); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c61();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 248) {
          s1 = peg$c39;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c40); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseextensionDigits();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c62(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 248) {
            s1 = peg$c39;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseextensionDigits();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
              s2 = void 0;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c63();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3) === peg$c42) {
              s1 = peg$c42;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c43); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseextensionDigits();
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c62(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c42) {
                s1 = peg$c42;
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseextensionDigits();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = void 0;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c63();
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c20) {
                  s1 = peg$c20;
                  peg$currPos += 3;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c21); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseextensionDigits();
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c64(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c20) {
                    s1 = peg$c20;
                    peg$currPos += 3;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c21); }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseextensionSymbol();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parseextensionDigits();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c65(s2, s3);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c20) {
                      s1 = peg$c20;
                      peg$currPos += 3;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c21); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$currPos;
                      peg$silentFails++;
                      s3 = peg$parseextensionDigits();
                      peg$silentFails--;
                      if (s3 === peg$FAILED) {
                        s2 = void 0;
                      } else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                      }
                      if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c66();
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 916) {
                        s1 = peg$c67;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c68); }
                      }
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parseextensionDigits();
                        if (s2 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c69(s2);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 916) {
                          s1 = peg$c67;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c68); }
                        }
                        if (s1 !== peg$FAILED) {
                          s2 = peg$currPos;
                          peg$silentFails++;
                          s3 = peg$parseextensionDigits();
                          peg$silentFails--;
                          if (s3 === peg$FAILED) {
                            s2 = void 0;
                          } else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                          }
                          if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c70();
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parseextensionSymbol();
                          if (s1 === peg$FAILED) {
                            s1 = null;
                          }
                          if (s1 !== peg$FAILED) {
                            s2 = peg$parseextensionDigits();
                            if (s2 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$c65(s1, s2);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsews();
      }
  
      return s0;
    }
  
    function peg$parseextensionDigits() {
      var s0;
  
      if (input.charCodeAt(peg$currPos) === 55) {
        s0 = peg$c71;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c72); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 57) {
          s0 = peg$c73;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c75) {
            s0 = peg$c75;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c77) {
              s0 = peg$c77;
              peg$currPos += 2;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
          }
        }
      }
  
      return s0;
    }
  
    function peg$parseextensionSymbol() {
      var s0, s1;
  
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c79) {
        s1 = peg$c79;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c80); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c45) {
          s1 = peg$c45;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 77) {
            s1 = peg$c81;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c82); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c83) {
              s1 = peg$c83;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c84); }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c85();
      }
      s0 = s1;
  
      return s0;
    }
  
    function peg$parserequiredAccidentals() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 98) {
        s2 = peg$c10;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 98) {
            s2 = peg$c10;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = [];
        if (input.charCodeAt(peg$currPos) === 35) {
          s2 = peg$c12;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c13); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (input.charCodeAt(peg$currPos) === 35) {
              s2 = peg$c12;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
          }
        } else {
          s1 = peg$FAILED;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c86(s1);
      }
      s0 = s1;
  
      return s0;
    }
  
    function peg$parseoptionalAccidentals() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 98) {
        s2 = peg$c10;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c11); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 98) {
            s2 = peg$c10;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        s1 = [];
        if (input.charCodeAt(peg$currPos) === 35) {
          s2 = peg$c12;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c13); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (input.charCodeAt(peg$currPos) === 35) {
              s2 = peg$c12;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c13); }
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
          s1 = peg$c87;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c88(s1);
      }
      s0 = s1;
  
      return s0;
    }
  
    function peg$parseinterval() {
      var s0;
  
      if (input.charCodeAt(peg$currPos) === 50) {
        s0 = peg$c89;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 51) {
          s0 = peg$c91;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c92); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 52) {
            s0 = peg$c93;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c94); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 53) {
              s0 = peg$c95;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c96); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 54) {
                s0 = peg$c59;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 55) {
                  s0 = peg$c71;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c72); }
                }
                if (s0 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 56) {
                    s0 = peg$c97;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c98); }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 57) {
                      s0 = peg$c73;
                      peg$currPos++;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c74); }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c99) {
                        s0 = peg$c99;
                        peg$currPos += 2;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c100); }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 2) === peg$c75) {
                          s0 = peg$c75;
                          peg$currPos += 2;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c76); }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 2) === peg$c101) {
                            s0 = peg$c101;
                            peg$currPos += 2;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c102); }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c77) {
                              s0 = peg$c77;
                              peg$currPos += 2;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c78); }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
  
      return s0;
    }
  
    function peg$parsemodInterval() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = peg$parserequiredAccidentals();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinterval();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c103(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
  
      return s0;
    }
  
    function peg$parseaddInterval() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      s1 = peg$parseoptionalAccidentals();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseinterval();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c103(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
  
      return s0;
    }
  
    function peg$parseaccAdd() {
      var s0, s1;
  
      s0 = [];
      s1 = peg$parseaddInterval();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parseaddInterval();
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsews();
      }
  
      return s0;
    }
  
    function peg$parsemodList() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
  
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c104;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c105); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c0;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c1); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c0;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c1); }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parsemodInterval();
          if (s5 !== peg$FAILED) {
            s6 = [];
            if (input.charCodeAt(peg$currPos) === 32) {
              s7 = peg$c0;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c1); }
            }
            while (s7 !== peg$FAILED) {
              s6.push(s7);
              if (input.charCodeAt(peg$currPos) === 32) {
                s7 = peg$c0;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c1); }
              }
            }
            if (s6 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s7 = peg$c106;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c107); }
              }
              if (s7 !== peg$FAILED) {
                s8 = [];
                if (input.charCodeAt(peg$currPos) === 32) {
                  s9 = peg$c0;
                  peg$currPos++;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c1); }
                }
                while (s9 !== peg$FAILED) {
                  s8.push(s9);
                  if (input.charCodeAt(peg$currPos) === 32) {
                    s9 = peg$c0;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c1); }
                  }
                }
                if (s8 !== peg$FAILED) {
                  peg$savedPos = s4;
                  s5 = peg$c4(s5);
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parsemodInterval();
            if (s5 !== peg$FAILED) {
              s6 = [];
              if (input.charCodeAt(peg$currPos) === 32) {
                s7 = peg$c0;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c1); }
              }
              while (s7 !== peg$FAILED) {
                s6.push(s7);
                if (input.charCodeAt(peg$currPos) === 32) {
                  s7 = peg$c0;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c1); }
                }
              }
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                  s7 = peg$c106;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c107); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = [];
                  if (input.charCodeAt(peg$currPos) === 32) {
                    s9 = peg$c0;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c1); }
                  }
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    if (input.charCodeAt(peg$currPos) === 32) {
                      s9 = peg$c0;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c1); }
                    }
                  }
                  if (s8 !== peg$FAILED) {
                    peg$savedPos = s4;
                    s5 = peg$c4(s5);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsemodInterval();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c108;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c109); }
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c5(s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsews();
      }
  
      return s0;
    }
  
    function peg$parseaddList() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
  
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c104;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c105); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c0;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c1); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.charCodeAt(peg$currPos) === 32) {
            s3 = peg$c0;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c1); }
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c110) {
            s3 = peg$c110;
            peg$currPos += 3;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c111); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            if (input.charCodeAt(peg$currPos) === 32) {
              s5 = peg$c0;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c1); }
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              if (input.charCodeAt(peg$currPos) === 32) {
                s5 = peg$c0;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c1); }
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$currPos;
              s7 = peg$parseaddInterval();
              if (s7 !== peg$FAILED) {
                s8 = [];
                if (input.charCodeAt(peg$currPos) === 32) {
                  s9 = peg$c0;
                  peg$currPos++;
                } else {
                  s9 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c1); }
                }
                while (s9 !== peg$FAILED) {
                  s8.push(s9);
                  if (input.charCodeAt(peg$currPos) === 32) {
                    s9 = peg$c0;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c1); }
                  }
                }
                if (s8 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s9 = peg$c106;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c107); }
                  }
                  if (s9 !== peg$FAILED) {
                    s10 = [];
                    if (input.charCodeAt(peg$currPos) === 32) {
                      s11 = peg$c0;
                      peg$currPos++;
                    } else {
                      s11 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c1); }
                    }
                    while (s11 !== peg$FAILED) {
                      s10.push(s11);
                      if (input.charCodeAt(peg$currPos) === 32) {
                        s11 = peg$c0;
                        peg$currPos++;
                      } else {
                        s11 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c1); }
                      }
                    }
                    if (s10 !== peg$FAILED) {
                      peg$savedPos = s6;
                      s7 = peg$c4(s7);
                      s6 = s7;
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$currPos;
                s7 = peg$parseaddInterval();
                if (s7 !== peg$FAILED) {
                  s8 = [];
                  if (input.charCodeAt(peg$currPos) === 32) {
                    s9 = peg$c0;
                    peg$currPos++;
                  } else {
                    s9 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c1); }
                  }
                  while (s9 !== peg$FAILED) {
                    s8.push(s9);
                    if (input.charCodeAt(peg$currPos) === 32) {
                      s9 = peg$c0;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c1); }
                    }
                  }
                  if (s8 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 44) {
                      s9 = peg$c106;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c107); }
                    }
                    if (s9 !== peg$FAILED) {
                      s10 = [];
                      if (input.charCodeAt(peg$currPos) === 32) {
                        s11 = peg$c0;
                        peg$currPos++;
                      } else {
                        s11 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c1); }
                      }
                      while (s11 !== peg$FAILED) {
                        s10.push(s11);
                        if (input.charCodeAt(peg$currPos) === 32) {
                          s11 = peg$c0;
                          peg$currPos++;
                        } else {
                          s11 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c1); }
                        }
                      }
                      if (s10 !== peg$FAILED) {
                        peg$savedPos = s6;
                        s7 = peg$c4(s7);
                        s6 = s7;
                      } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$FAILED;
                }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseaddInterval();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c108;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c109); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c5(s5, s6);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsews();
      }
  
      return s0;
    }
  
    function peg$parsews() {
      var s0, s1;
  
      s0 = [];
      if (peg$c112.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c113); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c112.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c113); }
        }
      }
  
      return s0;
    }
  
    function peg$parseslashNote() {
      var s0, s1, s2;
  
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 47) {
        s1 = peg$c114;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c115); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsenote();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c116(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsews();
      }
  
      return s0;
    }
  
    peg$result = peg$startRuleFunction();
  
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }
  
      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }
  return {    
    parse: peg$parse
}  
})() 

const intervalParser = (function() {
    function peg$subclass(child, parent) {
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
      }
      
      function peg$SyntaxError(message, expected, found, location) {
        this.message  = message;
        this.expected = expected;
        this.found    = found;
        this.location = location;
        this.name     = "SyntaxError";
      
        if (typeof Error.captureStackTrace === "function") {
          Error.captureStackTrace(this, peg$SyntaxError);
        }
      }
      
      peg$subclass(peg$SyntaxError, Error);
      
      peg$SyntaxError.buildMessage = function(expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
              literal: function(expectation) {
                return "\"" + literalEscape(expectation.text) + "\"";
              },
      
              "class": function(expectation) {
                var escapedParts = "",
                    i;
      
                for (i = 0; i < expectation.parts.length; i++) {
                  escapedParts += expectation.parts[i] instanceof Array
                    ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
                    : classEscape(expectation.parts[i]);
                }
      
                return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
              },
      
              any: function(expectation) {
                return "any character";
              },
      
              end: function(expectation) {
                return "end of input";
              },
      
              other: function(expectation) {
                return expectation.description;
              }
            };
      
        function hex(ch) {
          return ch.charCodeAt(0).toString(16).toUpperCase();
        }
      
        function literalEscape(s) {
          return s
            .replace(/\\/g, '\\\\')
            .replace(/"/g,  '\\"')
            .replace(/\0/g, '\\0')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }
      
        function classEscape(s) {
          return s
            .replace(/\\/g, '\\\\')
            .replace(/\]/g, '\\]')
            .replace(/\^/g, '\\^')
            .replace(/-/g,  '\\-')
            .replace(/\0/g, '\\0')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
        }
      
        function describeExpectation(expectation) {
          return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }
      
        function describeExpected(expected) {
          var descriptions = new Array(expected.length),
              i, j;
      
          for (i = 0; i < expected.length; i++) {
            descriptions[i] = describeExpectation(expected[i]);
          }
      
          descriptions.sort();
      
          if (descriptions.length > 0) {
            for (i = 1, j = 1; i < descriptions.length; i++) {
              if (descriptions[i - 1] !== descriptions[i]) {
                descriptions[j] = descriptions[i];
                j++;
              }
            }
            descriptions.length = j;
          }
      
          switch (descriptions.length) {
            case 1:
              return descriptions[0];
      
            case 2:
              return descriptions[0] + " or " + descriptions[1];
      
            default:
              return descriptions.slice(0, -1).join(", ")
                + ", or "
                + descriptions[descriptions.length - 1];
          }
        }
      
        function describeFound(found) {
          return found ? "\"" + literalEscape(found) + "\"" : "end of input";
        }
      
        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
      };
      
      function peg$parse(input, options) {
        options = options !== void 0 ? options : {};
      
        var peg$FAILED = {},
      
            peg$startRuleFunctions = { start: peg$parsestart },
            peg$startRuleFunction  = peg$parsestart,
      
            peg$c0 = function(acc, digit) {
            return {
            "accidentals":acc,
            "digit": digit
            }
            },
            peg$c1 = "b",
            peg$c2 = peg$literalExpectation("b", false),
            peg$c3 = "#",
            peg$c4 = peg$literalExpectation("#", false),
            peg$c5 = function(acc) {
              if(acc === undefined)
              {
                return ""
              }
              else {
                return acc.join("");
              }
            },
            peg$c6 = "2",
            peg$c7 = peg$literalExpectation("2", false),
            peg$c8 = "3",
            peg$c9 = peg$literalExpectation("3", false),
            peg$c10 = "4",
            peg$c11 = peg$literalExpectation("4", false),
            peg$c12 = "5",
            peg$c13 = peg$literalExpectation("5", false),
            peg$c14 = "6",
            peg$c15 = peg$literalExpectation("6", false),
            peg$c16 = "7",
            peg$c17 = peg$literalExpectation("7", false),
            peg$c18 = "8",
            peg$c19 = peg$literalExpectation("8", false),
            peg$c20 = "9",
            peg$c21 = peg$literalExpectation("9", false),
            peg$c22 = "10",
            peg$c23 = peg$literalExpectation("10", false),
            peg$c24 = "11",
            peg$c25 = peg$literalExpectation("11", false),
            peg$c26 = "12",
            peg$c27 = peg$literalExpectation("12", false),
            peg$c28 = "13",
            peg$c29 = peg$literalExpectation("13", false),
      
            peg$currPos          = 0,
            peg$savedPos         = 0,
            peg$posDetailsCache  = [{ line: 1, column: 1 }],
            peg$maxFailPos       = 0,
            peg$maxFailExpected  = [],
            peg$silentFails      = 0,
      
            peg$result;
      
        if ("startRule" in options) {
          if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
          }
      
          peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }
      
        function text() {
          return input.substring(peg$savedPos, peg$currPos);
        }
      
        function location() {
          return peg$computeLocation(peg$savedPos, peg$currPos);
        }
      
        function expected(description, location) {
          location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
      
          throw peg$buildStructuredError(
            [peg$otherExpectation(description)],
            input.substring(peg$savedPos, peg$currPos),
            location
          );
        }
      
        function error(message, location) {
          location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)
      
          throw peg$buildSimpleError(message, location);
        }
      
        function peg$literalExpectation(text, ignoreCase) {
          return { type: "literal", text: text, ignoreCase: ignoreCase };
        }
      
        function peg$classExpectation(parts, inverted, ignoreCase) {
          return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
        }
      
        function peg$anyExpectation() {
          return { type: "any" };
        }
      
        function peg$endExpectation() {
          return { type: "end" };
        }
      
        function peg$otherExpectation(description) {
          return { type: "other", description: description };
        }
      
        function peg$computePosDetails(pos) {
          var details = peg$posDetailsCache[pos], p;
      
          if (details) {
            return details;
          } else {
            p = pos - 1;
            while (!peg$posDetailsCache[p]) {
              p--;
            }
      
            details = peg$posDetailsCache[p];
            details = {
              line:   details.line,
              column: details.column
            };
      
            while (p < pos) {
              if (input.charCodeAt(p) === 10) {
                details.line++;
                details.column = 1;
              } else {
                details.column++;
              }
      
              p++;
            }
      
            peg$posDetailsCache[pos] = details;
            return details;
          }
        }
      
        function peg$computeLocation(startPos, endPos) {
          var startPosDetails = peg$computePosDetails(startPos),
              endPosDetails   = peg$computePosDetails(endPos);
      
          return {
            start: {
              offset: startPos,
              line:   startPosDetails.line,
              column: startPosDetails.column
            },
            end: {
              offset: endPos,
              line:   endPosDetails.line,
              column: endPosDetails.column
            }
          };
        }
      
        function peg$fail(expected) {
          if (peg$currPos < peg$maxFailPos) { return; }
      
          if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
          }
      
          peg$maxFailExpected.push(expected);
        }
      
        function peg$buildSimpleError(message, location) {
          return new peg$SyntaxError(message, null, null, location);
        }
      
        function peg$buildStructuredError(expected, found, location) {
          return new peg$SyntaxError(
            peg$SyntaxError.buildMessage(expected, found),
            expected,
            found,
            location
          );
        }
      
        function peg$parsestart() {
          var s0, s1, s2;
      
          s0 = peg$currPos;
          s1 = peg$parseaccidentals();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsedigit();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c0(s1, s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
      
          return s0;
        }
      
        function peg$parseaccidentals() {
          var s0, s1, s2;
      
          s0 = peg$currPos;
          s1 = [];
          if (input.charCodeAt(peg$currPos) === 98) {
            s2 = peg$c1;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c2); }
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              if (input.charCodeAt(peg$currPos) === 98) {
                s2 = peg$c1;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c2); }
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 === peg$FAILED) {
            s1 = [];
            if (input.charCodeAt(peg$currPos) === 35) {
              s2 = peg$c3;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (input.charCodeAt(peg$currPos) === 35) {
                  s2 = peg$c3;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c4); }
                }
              }
            } else {
              s1 = peg$FAILED;
            }
            if (s1 === peg$FAILED) {
              s1 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 98) {
                s2 = peg$c1;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c2); }
              }
              if (s2 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 35) {
                  s2 = peg$c3;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c4); }
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = void 0;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c5(s1);
          }
          s0 = s1;
      
          return s0;
        }
      
        function peg$parsedigit() {
          var s0;
      
          if (input.charCodeAt(peg$currPos) === 50) {
            s0 = peg$c6;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c7); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 51) {
              s0 = peg$c8;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c9); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 52) {
                s0 = peg$c10;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c11); }
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 53) {
                  s0 = peg$c12;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c13); }
                }
                if (s0 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 54) {
                    s0 = peg$c14;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c15); }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 55) {
                      s0 = peg$c16;
                      peg$currPos++;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c17); }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 56) {
                        s0 = peg$c18;
                        peg$currPos++;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c19); }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 57) {
                          s0 = peg$c20;
                          peg$currPos++;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c21); }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 2) === peg$c22) {
                            s0 = peg$c22;
                            peg$currPos += 2;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c23); }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c24) {
                              s0 = peg$c24;
                              peg$currPos += 2;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c25); }
                            }
                            if (s0 === peg$FAILED) {
                              if (input.substr(peg$currPos, 2) === peg$c26) {
                                s0 = peg$c26;
                                peg$currPos += 2;
                              } else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c27); }
                              }
                              if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2) === peg$c28) {
                                  s0 = peg$c28;
                                  peg$currPos += 2;
                                } else {
                                  s0 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c29); }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
      
          return s0;
        }
      
        peg$result = peg$startRuleFunction();
      
        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
          return peg$result;
        } else {
          if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
          }
      
          throw peg$buildStructuredError(
            peg$maxFailExpected,
            peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
            peg$maxFailPos < input.length
              ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
              : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
          );
        }
      }


    return {    
        parse: peg$parse
    }  
    })()








const chordExpressions = (function () { 
    const triads = {
        "major": ["1","3","5"],
        "minor": ["1", "b3", "5"],
        "aug": ["1", "3", "#5"],
        "dim": ["1", "b3", "b5"],
        "sus2": ["1", "2", "5"],
        "sus4": ["1", "4", "5"],
        "lyd": ["1", "#4", "5"],
        "phryg": ["1", "b2", "5"]
    };
    
    const extensions = {
        "6": ["6"],
        "7": ["b7"],
        "9": ["b7", "9"],
        "11": ["b7", "9", "11"],
        "13": ["b7", "9", "11", "13"],
        "maj7": ["7"],
        "maj9": ["7", "9"],
        "maj11": ["7", "9", "11"],
        "maj13": ["7", "9", "11", "13"]
    };

  const intervalDigitRegExp = "[1,2,3,4,5,6,7,8,9,10,11,12,13]+";
  const accidentalRegExp = "[#,b]+";
  const intervalNames = [
      "1",
      "b2",
      "2",
      "b3",
      "3",
      "4",
      "#4",
      "5",
      "b6",
      "6",
      "b7",
      "7"
  ];
  const noteNames = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#"
  ];
const INTERVAL_COUNT = intervalNames.length;

function Interval(name, value) {
    this.name = name;
    this.value = value;

}

// TODO: Intervalproto

Interval.List = {}; // Manipulations of Interval lists, maybe TODO
Interval.Notation = {}; // Specific to notation
Interval.Notation.Accidental = {}; //Accidentals
Interval.Notation.List = {}; // Manipulations of notation lists
Interval.Value = {};

//TODO: merge List and list someday
Object.defineProperty(Interval, "list", {
  value: (function generateReferenceIntervals() {
      return Object.freeze(intervalNames.map((str, value) => {
        return Object.freeze(new Interval(str, value));
      }));
  })(),
  writable: false
});

Interval.Notation.hasAccidental = function (notation) {
    return Boolean(notation.match(accidentalRegExp));
}

Interval.fromNotation = function(notation) {
    let passedNotation = notation;
    // allow for 9,11,13,etc by normalizing
    let passedDigit = notation.match(intervalDigitRegExp)[0];
    let digit = parseInt(passedDigit) === 7 ? 7 : (parseInt(passedDigit) % 7);
    let accidental = notation.match(accidentalRegExp) ? notation.match(accidentalRegExp)[0] : "";

    /* If anything is left it wasn't valid */
    let remaining = notation.replace(passedDigit, "").replace(accidental,"");
    if (remaining) {throw new Error("Bad Interval Name: |" + remaining + "|" + passedNotation)}

    notation =  accidental + digit;
    let interval = Interval.list.find(function(item) {
      return item.name === notation;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: "+passedNotation+",Calced: "+notation)}
    return interval;
}

Interval.fromValue = function(value) {
    let interval = Interval.list.find(function(item) {
      return item.value === value;
    });
    if(interval === undefined) {throw Error("Invalid name. Recieved: " + value)}
    return interval;
};

Interval.Notation.removeAccidentals = function(symbol) {
  let passedDigit = symbol.match(intervalDigitRegExp)[0];
  return passedDigit;
};

Interval.prototype.flat = function() {
    return this.minus("b2");
};

Interval.prototype.sharp = function() {
    return this.plus("b2");
};

Interval.prototype.getSum = function(value) {
  let sum = (value + this.value) % INTERVAL_COUNT;
  return (sum >= 0) ? sum : sum + INTERVAL_COUNT;
};

Interval.prototype.plus = function(notation) {
    const value = Interval.Notation.getValue(notation);
    const constructor = Object.getPrototypeOf(this).constructor;
    return constructor.fromValue(Interval.Value.normalize(this.value + value));
};
Interval.prototype.minus = function(notation) {
    const value = Interval.Notation.getValue(notation);
    const constructor = Object.getPrototypeOf(this).constructor;
    try {
        constructor.fromValue(Interval.Value.normalize(this.value - value))
    }catch {
      // wth is this! just dont break!
        throw new Error(constructor.name);
    }
    return constructor.fromValue(Interval.Value.normalize(this.value - value));
};

// func("bb7") returns "Flat Flat Seven"
Interval.Notation.toText = function(str) {
  let accidental = str.match(accidentalRegExp) ? str.match(accidentalRegExp)[0] : "";
  let accidentalEnglish = (() =>{
      let string = "";
    for(let i = 0; i < accidental.length; i++){
      let char = accidental[i];

      switch(char) {
        case "#":
          string = string.concat("Sharp ");
          break;
        case "b":
          string = string.concat("Flat ");
          break;
        default:
          throw new Error("No something bad happened");
      }
    }
    return string;
  })();

  let numberStr = str.match(intervalDigitRegExp)[0];
  let numberEnglish = Interval.Notation.numberToText(numberStr);

  return accidentalEnglish.concat(numberEnglish);
}

Interval.Notation.numberToText = function(str) {
  //TODO: add support for integers rather than only text
  switch(str) {
    case "1":
      return "One";
    case "2":
      return "Two";
    case "3":
      return "Three";
    case "4":
      return "Four";
    case "5":
      return "Five";
    case "6":
      return "Six";
    case "7":
      return "Seven";
    case "8":
      return "Eight";
    case "9":
      return "Nine";
    case "10":
      return "Ten";
    case "11":
      return "Eleven";
    case "12":
      return "Twelve";
    case "13":
      return "Thirteen";
    case "15":
      return "Thirteen";
    default:
      throw new Error("something bad happened");
  }
};

Interval.Notation.Accidental.getValue = function(accidentalString) {
    //TODO: Make sure is empty string or accidental
    let count = 0;
    for (let char of accidentalString) {
        if (char === "#") {
            count++;
            continue;
        } else if (char === "b") {
            count--;
            continue;
        }
        throw new TypeError("accidentalString must only have # and b characters");
    }
    return count;
};

Interval.Value.normalize = function (value) {
  let sum = value % INTERVAL_COUNT;
  return (sum >= 0 ) ? sum : sum + INTERVAL_COUNT;
}

Interval.Notation.getValue = function(notation) {
  const accidentalStr = notation.match(accidentalRegExp);
  const accidentalVal = accidentalStr ? Interval.Notation.Accidental.getValue(accidentalStr[0]) : 0;
  const referenceNotation = notation.match(intervalDigitRegExp)[0];
  if(referenceNotation === null) {throw new Error("Must include an Interval");}
  const referenceInterval = Interval.fromNotation(referenceNotation);

  return Interval.Value.normalize(referenceInterval.value + accidentalVal);
};

Interval.Notation.List.removeValue = function(list, notation) {
    //TODO: also allow integer to be passed in rather than just string?
    //TODO: also allow Interval objects to be passed?
    let passedValue = Interval.Notation.getValue(notation);

    return list.reduce((collection, sym) => {
        let checkValue = Interval.Notation.getValue(sym);
        if (checkValue !== passedValue) { collection.push(sym);}
        return collection;
    }, []);

};

// intervalList: Array of intervals in symbol form (String)
// interval: MUST be interval with mod, NOT pure, is a sysmbol (String) TODO: enforce
// Returns: Boolean
Interval.Notation.List.hasPureInterval = function(intervalList, notation, opts = {restrictOctave: false}) {
  if (!opts.restrictOctave) {
      let passedValue = Interval.Notation.getValue(Interval.Notation.removeAccidentals(notation));

      return Boolean(intervalList.find(sym => {
          let checkValue = Interval.Notation.getValue(Interval.Notation.removeAccidentals(sym));
          return checkValue === passedValue;
      }));

  } else if (opts.restrictOctave) {
    let passedValue = Interval.Notation.removeAccidentals(notation);
      return Boolean(intervalList.find(sym => {
          let checkValue = Interval.Notation.removeAccidentals(sym);
          return checkValue === passedValue;
      }));
  }
    throw new Error("Something went wrong");
};

// ["b7", "b9"] returns false
// ["b7", "9"] returns true
Interval.Notation.List.hasAnyPureInterval = function(list) {
      return Boolean(list.find(notation => {
          let remaining = Interval.Notation.removeAccidentals(notation);
          // empty string means this was pure, non-empty means it wasn't
          return !Boolean(remaining);
      }));
};

// intervals: list of string symbols
// interval: a string symbol with an accidental (one hopes)
// todo: this function is octave specific. b2 wouldn't knock a pure 9 out of the way or vice versa etc
// is that GOOD behavior?. That might be what we want!!!!
Interval.Notation.List.modify = function (intervals, interval) {
    let pureInterval = Interval.Notation.removeAccidentals(interval);
    return intervals.map(reference => {
        return (reference === pureInterval) ? interval : reference;
    });
}


Interval.behavior = {
  flat: Interval.prototype.flat,
  sharp: Interval.prototype.sharp,
  minus: Interval.prototype.minus,
  plus: Interval.prototype.plus,
};
    
    function Chord(chord, notation) {
        this.rootNote = Note.fromName(chord.note);
        this.baseNote = chord.slashNote.length ? Note.fromName(chord.slashNote) : null;
        this.quality = chord.quality;
        this.modList = chord.modList;
        this.addList = chord.addList;
        this.notes = [];
        this.notation = notation;
        this.generateNotes();
    }
    
    Chord.prototype.generateNotes = function() {
        let triad = triads[this.quality.triad.value];
        let quality = this.quality.extension.length > 0 ? triad.concat(extensions[this.quality.extension.value]) : triad;
        quality.forEach(function(interval) {
            let note = this.rootNote.plus(interval);
            this.notes.push(note);
        }.bind(this));
        if (this.modList.length > 0) {
            this.modNotes(this.modList);
        }
        if (this.addList.length > 0) {
            this.addNotes(this.addList);
        }
    }
    
    Chord.prototype.addNotes = function (addNotes,currentNotes) {
    
      addNotes.forEach(interval => {
        let note = this.rootNote.plus(interval);
    
        if(this.noDuplicateNotes(note)) {
          this.notes.push(note);
        }
      });
    }
    
    Chord.prototype.modNotes = function(modNotes) {
        //check all currentNotes for the modNote. If they match add the interval to the note
        modNotes.forEach(function(modNote) {
            let accidental = modNote[0];
            let interval = parseInt(modNote.substring(1));
            //locate the note you are attempting to mod in the chords note list
            let index = -1;
            let match = this.notes.find( (note, i) => {
                let check = this.rootNote.plus(interval.toString());
                if (check.value === note.value) {
                    index = i;
                    return true;
                }
            });
    
            //modNote.quality
    
            //note = Note.fromName(modNote);
            //if the note is in the this.notes array, mod it
            //var index = this.notes.indexOf(match);
            if (match) {
                if (accidental === 'b') {
                    //this.notes[index] = this.notes[index].flat();
                    this.notes[index] = match.flat();
                } else if (acidental === '#') {
                    //this.notes[index] = this.notes[index].sharp();
                    this.notes[index] = match.sharp();
                }
            }
            // if it is not in the this.notes array, add to the add array of mpds
            else {
                this.addList.push(modNote);
            }
        }.bind(this));
    }
    
    Chord.prototype.noDuplicateNotes = function(note) {
        return !this.notes.find(function(currentNote) {
            return currentNote.value === this;
        }.bind(note));
    }
    
    Chord.prototype.duplicateNote = function(note) {
        return this.notes.findIndex(function(currentNote) {
            return currentNote.value === this.value
        }.bind(note));
    }
    
    Chord.prototype.hasNote = function(note) {
        if(typeof note === 'object' && typeof note.name === 'string'){
            note = note.name;
        }
        return !!(this.notes.find(function(currentNote) {
            return currentNote.name === this;
        }.bind(note)));
    }
    
    
    Chord.chordFromNotation = function(notation) {
        let parsedNotation = Parser.parse(notation);
        if(Array.isArray(parsedNotation)) {parsedNotation = parsedNotation[0]}
        /* should always have a triad */
        if (parsedNotation.quality.triad == undefined) {throw new Error("no triad: " + notation)}
        return new Chord(parsedNotation, notation);
    }
    
    Chord.triads = triads;
    Chord.extensions = extensions;
    
    const noteRegExp = "[A-G]";

const NOTE_COUNT = noteNames.length;

function Note(name, value){
  this.name = name;
  this.value = value;
}

Note.prototype.copy = function() {
  let copy = Object.create(Note.prototype);
  Object.assign(copy, this);
  copy.reference = this;
  return copy;
};

Object.defineProperty(Note, "list", {
  value: (function generateReferenceNotes() {
      return Object.freeze(noteNames.map((str, value) => {
        return Object.freeze(new Note(str, value));
      }));
  })(),
  writable: false
});

Object.assign(Note.prototype, Interval.behavior);

/* Accepts [A-G] + (b|#)? */
function fromNormalizedName(name) {
    return Note.list.find(function(note) {
      return note.name === name;
    });
}

/* Accepts [A-G] + any sequence of #s or bs */
function fromCustomName(str) {
    if(typeof str !== 'string' || str.length < 0 ){
        throw new Error("Invalid Note Name. Expected A-G with any sequence of # and b. Received: " + str);
    }
    const referenceNoteString = str.match(noteRegExp)[0];
    const referenceNote = fromNormalizedName(referenceNoteString);
    const accidentalString = str.match(accidentalRegExp);
    const accidentalValue = accidentalString ? Interval.Value.normalize(Interval.Notation.Accidental.getValue(accidentalString[0])) : 0;
    let index = (referenceNote.value + accidentalValue) % NOTE_COUNT;
    return Note.list[index];
}

// Why does each note object need the whole list?
// Can code dealing with a note and wanting the list not do Note.list?
Note.prototype.list = Note.list;

Note.fromName = function(name, nameOverride = false) {
    let refNote = fromCustomName(name);
    let note = refNote.copy();

    if (nameOverride) {
      note.name = name;
    }
    return note;
};

Note.fromValue = function(value) {
    return Note.list.find(function(item) {
      return item.value === value;
    });
};



    return {    
        chord: Chord,
        interval: Interval,
        note: Note
    }  
})() // Return what others can use