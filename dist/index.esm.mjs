const once = t => {
  let e, r;
  return function(...s) {
    return r || (e = t(...s), r = !0), e;
  };
}, isEmpty = t => {
  if (!t) return !0;
  if (Array.isArray(t)) {
    if (0 === t.length) return !0;
  } else if ("object" == typeof t && 0 === Object.keys(t).length) return !0;
  return !1;
}, first = t => t[0], getSplitSmartlyArgs = (t, e) => {
  if (null == t || !t.length) throw new RangeError("empty arguments");
  if (3 === t.length) {
    if (!e) return t;
  } else if (1 === t.length) {
    const e = first(t);
    "string" == typeof e ? t.push(",", {}) : Array.isArray(e) ? (t.unshift(null), t.push({})) : "object" == typeof e && t.unshift(null, ",");
  } else if (2 === t.length) "string" == typeof t[0] && t[1] instanceof RegExp || "string" == typeof t[1] || Array.isArray(t[1]) ? t.push({}) : t.unshift(null); else if (t.length > 3) throw new RangeError("Too much arguments passed to splitSmartly function!!!");
  return e && (t[2] = {
    ...t[2],
    ...e
  }), t;
};

let t;

const prepareSearch = (e, r) => {
  const s = {
    brackets: [],
    mentions: [],
    ignoreInsideQuotes: !0,
    includeSeparatorMode: "NONE",
    ignoreCase: !0,
    trimResult: !0,
    trimSeparators: !1,
    defaultBrackets: [ [ "(", ")" ], [ "[", "]" ], [ "{", "}" ] ],
    ...r,
    separators: e,
    init() {
      return function initSettings(t) {
        if (Array.isArray(t.mentions) || "string" == typeof t.mentions) {
          const e = [ t.mentions ].flat().filter(Boolean).reduce(((e, r) => (e[t.ignoreCase ? r.toUpperCase() : r] = r, 
          e)), {});
          t.mentions = !isEmpty(e) && e;
        }
        return t.createBracketsMap().createBracketsSearch().createSeparatorsSearch();
      }(this);
    },
    merge(t) {
      return function mergeSettings(t, e) {
        return e ? (e = {
          ...t,
          ...e
        }, [ "brackets", "mentions" ].some((t => t in e)) && e.init(), e) : t;
      }(this, t);
    },
    arrayToPattern: e => function arrayToPattern(e) {
      var r;
      return null !== (r = t) && void 0 !== r || (t = new Set(".{}[]^()+*?\\/$|".split(""))), 
      e.map((e => e instanceof RegExp ? e.source : e.split("").map((e => t.has(e) ? "\\" + e : e)).join(""))).join("|");
    }(e),
    createRegExp: t => RegExp(t, "g"),
    createBracketsMap() {
      return function createBracketsMap(t) {
        let e = t.brackets = function normalizeBrackets(t, e) {
          var r;
          return !0 === t ? t = e.slice() : "object" != typeof t || Array.isArray(t) ? "string" == typeof t && (t = t.split(",").map((t => {
            let e = t.trim().split(" ");
            if (2 !== e.length) {
              if (2 !== first(e).length) throw new TypeError("open and close parts of brackets should be separated by space symbol");
              e = first(e).split("");
            }
            return e;
          }))) : t = Object.entries(t), null !== (r = t) && void 0 !== r ? r : [];
        }(t.brackets, t.defaultBrackets);
        return e = function handleBracketsMapOptions(t, e) {
          return e.ignoreInsideQuotes && t.unshift([ "'", , , !0 ], [ '"', , , !0 ]), t;
        }(e, t), t.bracketsMap = function buildBracketsMap(t, e) {
          return t.reduce(((t, [r, s, ...n]) => {
            1 !== n.length || e || n.unshift(void 0);
            let [i = e && 1, a] = n;
            return "number" == typeof i && (i = [ i ]), t[r] = {
              open: r,
              ignoreMode: a,
              searchLevels: i,
              close: s || r
            }, t;
          }), {});
        }(e, t.searchWithin), t;
      }(this);
    },
    createBracketsSearch() {
      return function createBracketsSearch(t) {
        const e = Object.entries(t.bracketsMap).flatMap((([, {close: t, open: e}]) => t !== e ? [ e, t ] : e)).concat(Object.keys(t.mentions || {})).filter(Boolean), r = t.arrayToPattern(e);
        return t.bracketsSearch = t.createRegExp(r), t;
      }(this);
    },
    createSeparatorsSearch() {
      return function createSeparatorsSearch(t) {
        const {separators: e} = t;
        if ("string" == typeof e || Array.isArray(e)) {
          const r = t.arrayToPattern([ e ].flat().filter(Boolean));
          t.separatorSearch = t.createRegExp(r);
        } else e ? (t.separatorSearch = e, t.ignoreCase = e.ignoreCase) : t.separatorSearch = /empty/;
        return t;
      }(this);
    }
  };
  return s.init();
};

function buildIndexesObject(t) {
  const e = [ t ].flat().filter(Boolean);
  return !isEmpty(e) && {
    values: new Set(e),
    max: Math.max(...e),
    count: 0,
    hasIndex() {
      return -Infinity === this.max || this.values.has(this.count++);
    },
    isOverMax() {
      return -Infinity !== this.max && this.count > this.max;
    }
  };
}

class SearchResults {
  constructor(t, e) {
    this.string = t, this.searchSettings = e, this.prepareSearch();
  }
  prepareSearch() {
    for (const t of [ this.searchSettings.separatorSearch, this.searchSettings.bracketsSearch ]) t.lastIndex = 0;
    Object.assign(this, {
      brackets: [],
      pipe: [],
      currentMentions: [],
      position: 0,
      isDone: !1,
      freeArea: {
        start: 0,
        end: void 0
      },
      lastSeparator: void 0,
      searchString: this.searchSettings.ignoreCase && !this.searchSettings.separatorSearch.ignoreCase ? this.string.toUpperCase() : this.string,
      indexes: buildIndexesObject(this.searchSettings.indexes)
    });
  }
  get pipeIsEmpty() {
    return isEmpty(this.pipe);
  }
  getMentions(t, e) {
    const r = [], s = [];
    for (const n of this.currentMentions) n.index >= t && n.index < e ? r.push(n.mention) : s.push(n);
    return [ r.length && r, s ];
  }
  trimResultText(t) {
    return this.searchSettings.trimResult ? t.trim() : t;
  }
  trimSeparatorText(t) {
    return this.searchSettings.trimSeparators ? t.trim() : t;
  }
  checkSeparator(t) {
    const {string: e} = this, {check: r, includePositions: s, mentions: n} = this.searchSettings;
    let {0: i = "", index: a = e.length, searchWithinData: o} = null != t ? t : {};
    const h = i.length, c = o ? o.openPosition : this.position;
    let p = e.substring(c, a);
    i || (this.isDone = !0), p = this.trimResultText(p), i = this.trimSeparatorText(i);
    let l, u = o ? [ o.open, o.close ] : i;
    if (s && (p = {
      text: p,
      position: c
    }, u = {
      text: u,
      position: a,
      isSeparator: !0
    }), n) {
      p = "string" == typeof p ? {
        text: p
      } : p;
      const [t, e] = this.getMentions(c, a);
      t && (p.mentions = t, l = e);
    }
    if (r && i) {
      const t = isNaN(this.tempPosition) ? c : this.tempPosition;
      this.tempPosition = a + i.length;
      const s = this;
      if (!r({
        getString: once((() => s.trimResultText(e.substring(t, a)))),
        getTextAfter: once((() => e.substring(a + i.length))),
        getMentions: once((() => s.getMentions(t, a)[0])),
        getSeparator: once((() => i)),
        get string() {
          return this.getString();
        },
        get textAfter() {
          return this.getTextAfter();
        },
        get mentions() {
          return this.getMentions();
        },
        get separator() {
          return this.getSeparator();
        }
      })) return [];
      delete this.tempPosition;
    }
    return l && (this.currentMentions = l), this.position = a + h, [ p, u, !0 ];
  }
  pushToPipe(t) {
    if (this.indexes) {
      if (!this.indexes.hasIndex()) return;
      this.indexes.isOverMax() && (this.isDone = !0);
    }
    this.pipe.push(t);
  }
  addToPipe(t) {
    let [e, r, s] = this.checkSeparator(t);
    if (!s) return !1;
    switch (this.searchSettings.includeSeparatorMode) {
     case "SEPARATELY":
      this.pushToPipe(e), r && this.pushToPipe(r);
      break;

     case "LEFT":
      this.pushToPipe([ e, r ]);
      break;

     case "RIGHT":
      !("object" == typeof e ? e.text : e) && !this.lastSeparator || this.pushToPipe([ this.lastSeparator, e ]), 
      this.lastSeparator = r;
      break;

     case "ONLY":
      r && this.pushToPipe(r);
      break;

     default:
      this.pushToPipe(e);
    }
    return !this.pipeIsEmpty;
  }
  findBrackets() {
    const {searchString: t, brackets: e, freeArea: r, searchSettings: s} = this, {bracketsSearch: n, separatorSearch: i, searchWithin: a} = s, o = a ? () => this.pipeIsEmpty : () => ("number" != typeof r.start || r.start !== r.end) && !r.end;
    for (;o(); ) {
      var h;
      const o = n.exec(t);
      if (!o) {
        if (a || isNaN(r.start)) return !1;
        r.end = t.length - 1;
        continue;
      }
      const p = o[0], {close: l, ignoreMode: u, searchLevels: g} = (c = e)[c.length - 1] || {};
      let f;
      switch ((p === l ? 1 : u && 4) || (f = s.bracketsMap[p]) && 2 || (null === (h = s.mentions) || void 0 === h ? void 0 : h[p]) && 3) {
       case 1:
        const t = e.pop();
        a ? (!0 === g || g.includes(e.length + 1)) && this.addToPipe(Object.assign(o, {
          searchWithinData: t
        })) : isEmpty(e) && (r.start = o.index, i && i.lastIndex < r.start && (i.lastIndex = r.start));
        break;

       case 2:
        e.push({
          ...f,
          openPosition: o.index + p.length
        }), 1 !== e.length || a || (r.end = o.index);
        break;

       case 3:
        this.currentMentions.push({
          mention: s.mentions[p],
          index: o.index
        });
      }
    }
    var c;
    return !0;
  }
  findSeparator(t) {
    const {searchString: e, freeArea: r} = this, {separatorSearch: s} = this.searchSettings;
    let n;
    for (;!n; ) {
      if (t = t || s.exec(e)) if (t.index <= r.end) {
        const e = t.index >= r.start && this.addToPipe(t);
        if (t = null, !e) continue;
      } else r.start = r.end = void 0; else this.addToPipe();
      n = !0;
    }
    return t;
  }
  getNext() {
    let t;
    for (;this.pipeIsEmpty && !this.isDone; ) this.findBrackets() ? this.searchSettings.searchWithin || (t = this.findSeparator(t)) : this.isDone = !0;
    return this.pipeIsEmpty ? null : this.pipe.shift();
  }
  getAll() {
    return [ ...this ];
  }
  getRest() {
    const t = [];
    let e;
    for (;null !== (e = this.getNext()); ) t.push(e);
    return t;
  }
  * [Symbol.iterator]() {
    this.prepareSearch();
    const t = this;
    let e;
    do {
      e = t.getNext(), null !== e && (yield e);
    } while (null !== e);
  }
}

function split(t, e) {
  const r = this.merge(e);
  let s = new SearchResults(t, r);
  return "number" == typeof r.indexes ? s.getNext() : r.returnIterator ? s : s.getAll();
}

const createSplitFunction = t => {
  const e = split.bind(t);
  return Object.assign(e, {
    getOne(t, r, s = {}) {
      if (isNaN(r)) throw new TypeError("second parameter of `getOne` function should be index");
      return e(t, {
        ...s,
        indexes: r
      });
    },
    getFirst: (t, r = {}) => e(t, {
      ...r,
      indexes: 0
    }),
    getIndexes(t, r, s = {}) {
      if (!Array.isArray(r)) throw new TypeError("second parameter of `getOne` function should be array of indexes");
      return e(t, {
        ...s,
        indexes: r
      });
    },
    getIterator: (t, r = {}) => e(t, {
      ...r,
      returnIterator: !0
    })
  });
};

var e, r;

function splitSmartly(...t) {
  let [e, r, s] = getSplitSmartlyArgs(t);
  const n = prepareSearch(r, s), i = createSplitFunction(n);
  return null !== e ? i(e) : i;
}

!function(t) {
  t.INCLUDE_SEPARATOR_NONE = "NONE", t.INCLUDE_SEPARATOR_SEPARATELY = "SEPARATELY", 
  t.INCLUDE_SEPARATOR_LEFT = "LEFT", t.INCLUDE_SEPARATOR_RIGHT = "RIGHT", t.INCLUDE_SEPARATOR_ONLY = "ONLY";
}(e || (e = {})), function(t) {
  t[t.ACTION_CLOSE = 1] = "ACTION_CLOSE", t[t.ACTION_OPEN = 2] = "ACTION_OPEN", t[t.ACTION_ADD_FRAGMENT = 3] = "ACTION_ADD_FRAGMENT", 
  t[t.ACTION_NULL = 4] = "ACTION_NULL";
}(r || (r = {})), splitSmartly.searchWithin = (...t) => (1 === t.length && ("string" == typeof t[0] ? t.push(null, {}) : t.unshift(null)), 
"object" == typeof t[1] && t[1].brackets || (t[1] = {
  brackets: t[1]
}), t.splice(1, 0, null), splitSmartly(...getSplitSmartlyArgs(t, {
  searchWithin: !0
}))), splitSmartly.search = (...t) => splitSmartly(...getSplitSmartlyArgs(t, {
  includeSeparatorMode: "ONLY"
}));

export { e as EnumIncludeSeparatorMode, SearchResults, createSplitFunction, splitSmartly as default, getSplitSmartlyArgs, prepareSearch, splitSmartly };
//# sourceMappingURL=index.esm.mjs.map
