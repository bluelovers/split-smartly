'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.EnumIncludeSeparatorMode = void 0;
(function (EnumIncludeSeparatorMode) {
  EnumIncludeSeparatorMode["INCLUDE_SEPARATOR_NONE"] = "NONE";
  EnumIncludeSeparatorMode["INCLUDE_SEPARATOR_SEPARATELY"] = "SEPARATELY";
  EnumIncludeSeparatorMode["INCLUDE_SEPARATOR_LEFT"] = "LEFT";
  EnumIncludeSeparatorMode["INCLUDE_SEPARATOR_RIGHT"] = "RIGHT";
  EnumIncludeSeparatorMode["INCLUDE_SEPARATOR_ONLY"] = "ONLY";
})(exports.EnumIncludeSeparatorMode || (exports.EnumIncludeSeparatorMode = {}));
var EnumFindBracketsAction;
(function (EnumFindBracketsAction) {
  EnumFindBracketsAction[EnumFindBracketsAction["ACTION_CLOSE"] = 1] = "ACTION_CLOSE";
  EnumFindBracketsAction[EnumFindBracketsAction["ACTION_OPEN"] = 2] = "ACTION_OPEN";
  EnumFindBracketsAction[EnumFindBracketsAction["ACTION_ADD_FRAGMENT"] = 3] = "ACTION_ADD_FRAGMENT";
  EnumFindBracketsAction[EnumFindBracketsAction["ACTION_NULL"] = 4] = "ACTION_NULL";
})(EnumFindBracketsAction || (EnumFindBracketsAction = {}));

const once = fn => {
  let value, hasValue;
  return function (...args) {
    if (!hasValue) {
      value = fn(...args);
      hasValue = true;
    }
    return value;
  };
};
const isEmpty = value => {
  if (!value) return true;
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
  } else if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return true;
  }
  return false;
};
const first = value => value[0];
const last = value => value[value.length - 1];

function buildIndexesObject(indexes) {
  const indexesArr = [indexes].flat().filter(Boolean);
  return !isEmpty(indexesArr) && {
    values: new Set(indexesArr),
    max: Math.max(...indexesArr),
    count: 0,
    hasIndex() {
      return this.max === -Infinity || this.values.has(this.count++);
    },
    isOverMax() {
      return this.max !== -Infinity && this.count > this.max;
    }
  };
}

class SearchResults {
  constructor(string, searchSettings) {
    this.string = string;
    this.searchSettings = searchSettings;
    this.prepareSearch();
  }
  prepareSearch() {
    for (const regExp of [this.searchSettings.separatorSearch, this.searchSettings.bracketsSearch]) regExp.lastIndex = 0;
    Object.assign(this, {
      brackets: [],
      pipe: [],
      currentMentions: [],
      position: 0,
      isDone: false,
      freeArea: {
        start: 0,
        end: undefined
      },
      lastSeparator: undefined,
      searchString: this.searchSettings.ignoreCase && !this.searchSettings.separatorSearch.ignoreCase ? this.string.toUpperCase() : this.string,
      indexes: buildIndexesObject(this.searchSettings.indexes)
    });
  }
  get pipeIsEmpty() {
    return isEmpty(this.pipe);
  }
  getMentions(indexFrom, indexTo) {
    const properMentions = [],
      restMentions = [];
    for (const item of this.currentMentions) {
      if (item.index >= indexFrom && item.index < indexTo) {
        properMentions.push(item.mention);
      } else {
        restMentions.push(item);
      }
    }
    return [properMentions.length && properMentions, restMentions];
  }
  trimResultText(text) {
    return this.searchSettings.trimResult ? text.trim() : text;
  }
  trimSeparatorText(text) {
    return this.searchSettings.trimSeparators ? text.trim() : text;
  }
  checkSeparator(pSeparator) {
    const {
      string
    } = this;
    const {
      check,
      includePositions,
      mentions
    } = this.searchSettings;
    let {
      0: separatorText = '',
      index: separatorPosition = string.length,
      searchWithinData
    } = pSeparator !== null && pSeparator !== void 0 ? pSeparator : {};
    const separatorLength = separatorText.length;
    const lastPosition = searchWithinData ? searchWithinData.openPosition : this.position;
    let text = string.substring(lastPosition, separatorPosition);
    if (!separatorText) this.isDone = true;
    text = this.trimResultText(text);
    separatorText = this.trimSeparatorText(separatorText);
    let separator = searchWithinData ? [searchWithinData.open, searchWithinData.close] : separatorText;
    if (includePositions) {
      text = {
        text,
        position: lastPosition
      };
      separator = {
        text: separator,
        position: separatorPosition,
        isSeparator: true
      };
    }
    let restMentions;
    if (mentions) {
      text = typeof text === 'string' ? {
        text
      } : text;
      const [properMentions, restItems] = this.getMentions(lastPosition, separatorPosition);
      if (properMentions) {
        text.mentions = properMentions;
        restMentions = restItems;
      }
    }
    if (check && separatorText) {
      const position = isNaN(this.tempPosition) ? lastPosition : this.tempPosition;
      this.tempPosition = separatorPosition + separatorText.length;
      const self = this;
      const checkParams = {
        getString: once(() => self.trimResultText(string.substring(position, separatorPosition))),
        getTextAfter: once(() => string.substring(separatorPosition + separatorText.length)),
        getMentions: once(() => self.getMentions(position, separatorPosition)[0]),
        getSeparator: once(() => separatorText),
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
      };
      if (!check(checkParams)) return [];
      delete this.tempPosition;
    }
    if (restMentions) this.currentMentions = restMentions;
    this.position = separatorPosition + separatorLength;
    return [text, separator, true];
  }
  pushToPipe(value) {
    if (this.indexes) {
      if (!this.indexes.hasIndex()) {
        return;
      }
      if (this.indexes.isOverMax()) {
        this.isDone = true;
      }
    }
    this.pipe.push(value);
  }
  addToPipe(pSeparator) {
    let [text, separator, checked] = this.checkSeparator(pSeparator);
    if (!checked) return false;
    switch (this.searchSettings.includeSeparatorMode) {
      case "SEPARATELY" /* EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY */:
        this.pushToPipe(text);
        if (separator) {
          this.pushToPipe(separator);
        }
        break;
      case "LEFT" /* EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT */:
        this.pushToPipe([text, separator]);
        break;
      case "RIGHT" /* EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT */:
        const textIsEmpty = !(typeof text === 'object' ? text.text : text);
        if (!textIsEmpty || this.lastSeparator) {
          this.pushToPipe([this.lastSeparator, text]);
        }
        this.lastSeparator = separator;
        break;
      case "ONLY" /* EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY */:
        if (separator) this.pushToPipe(separator);
        break;
      default:
        this.pushToPipe(text);
    }
    return !this.pipeIsEmpty;
  }
  findBrackets() {
    const {
      searchString: string,
      brackets,
      freeArea,
      searchSettings
    } = this;
    const {
      bracketsSearch,
      separatorSearch,
      searchWithin
    } = searchSettings;
    const condition = searchWithin ? () => this.pipeIsEmpty : () => {
      if (typeof freeArea.start === 'number' && freeArea.start === freeArea.end) {
        return false;
      }
      return !freeArea.end;
    };
    while (condition()) {
      var _searchSettings$menti;
      const match = bracketsSearch.exec(string);
      if (!match) {
        if (searchWithin || isNaN(freeArea.start)) return false;
        freeArea.end = string.length - 1;
        continue;
      }
      const fragment = match[0];
      const {
        close,
        ignoreMode,
        searchLevels
      } = last(brackets) || {};
      let block;
      const action = fragment === close && 1 /* EnumFindBracketsAction.ACTION_CLOSE */ || ignoreMode && 4 /* EnumFindBracketsAction.ACTION_NULL */ || (block = searchSettings.bracketsMap[fragment]) && 2 /* EnumFindBracketsAction.ACTION_OPEN */ || ((_searchSettings$menti = searchSettings.mentions) === null || _searchSettings$menti === void 0 ? void 0 : _searchSettings$menti[fragment]) && 3 /* EnumFindBracketsAction.ACTION_ADD_FRAGMENT */;
      switch (action) {
        case 1 /* EnumFindBracketsAction.ACTION_CLOSE */:
          const bracketData = brackets.pop();
          if (searchWithin) {
            if (searchLevels === true || searchLevels.includes(brackets.length + 1)) {
              this.addToPipe(Object.assign(match, {
                searchWithinData: bracketData
              }));
            }
          } else if (isEmpty(brackets)) {
            freeArea.start = match.index;
            if (separatorSearch && separatorSearch.lastIndex < freeArea.start) {
              separatorSearch.lastIndex = freeArea.start;
            }
          }
          break;
        case 2 /* EnumFindBracketsAction.ACTION_OPEN */:
          brackets.push({
            ...block,
            openPosition: match.index + fragment.length
          });
          if (brackets.length === 1 && !searchWithin) {
            freeArea.end = match.index;
          }
          break;
        // @ts-ignore
        case 3 /* EnumFindBracketsAction.ACTION_ADD_FRAGMENT */:
          const mention = searchSettings.mentions[fragment];
          this.currentMentions.push({
            mention,
            index: match.index
          });
          break;
      }
    }
    return true;
  }
  findSeparator(separator) {
    const {
      searchString: string,
      freeArea
    } = this;
    const {
      separatorSearch
    } = this.searchSettings;
    let stopSearching;
    while (!stopSearching) {
      separator = separator || separatorSearch.exec(string);
      if (!separator) {
        this.addToPipe();
      } else if (separator.index <= freeArea.end) {
        const isAdded = separator.index >= freeArea.start && this.addToPipe(separator);
        separator = null;
        if (!isAdded) continue;
      } else {
        freeArea.start = freeArea.end = undefined;
      }
      stopSearching = true;
    }
    return separator;
  }
  getNext() {
    let separator;
    while (this.pipeIsEmpty && !this.isDone) {
      if (!this.findBrackets()) {
        this.isDone = true;
      } else if (!this.searchSettings.searchWithin) {
        separator = this.findSeparator(separator);
      }
    }
    return this.pipeIsEmpty ? null : this.pipe.shift();
  }
  getAll() {
    return [...this];
  }
  getRest() {
    const res = [];
    let value;
    while (null !== (value = this.getNext())) {
      res.push(value);
    }
    return res;
  }
  // @ts-ignore
  *[Symbol.iterator]() {
    this.prepareSearch();
    const object = this;
    let value;
    do {
      value = object.getNext();
      if (value !== null) {
        yield value;
      }
    } while (value !== null);
  }
}

function split(string, settings) {
  const splitSettings = this.merge(settings);
  let res = new SearchResults(string, splitSettings);
  if (typeof splitSettings.indexes === 'number') {
    return res.getNext();
  } else if (!splitSettings.returnIterator) {
    return res.getAll();
  }
  return res;
}

const createSplitFunction = settings => {
  const splitFn = split.bind(settings);
  return Object.assign(splitFn, {
    getOne(string, index, settings = {}) {
      if (isNaN(index)) {
        throw new TypeError('second parameter of `getOne` function should be index');
      }
      // @ts-ignore
      return splitFn(string, {
        ...settings,
        indexes: index
      });
    },
    getFirst(string, settings = {}) {
      // @ts-ignore
      return splitFn(string, {
        ...settings,
        indexes: 0
      });
    },
    getIndexes(string, indexes, settings = {}) {
      if (!Array.isArray(indexes)) {
        throw new TypeError('second parameter of `getOne` function should be array of indexes');
      }
      // @ts-ignore
      return splitFn(string, {
        ...settings,
        indexes
      });
    },
    getIterator(string, settings = {}) {
      // @ts-ignore
      return splitFn(string, {
        ...settings,
        returnIterator: true
      });
    }
  });
};

const getSplitSmartlyArgs = (args, extraSettings) => {
  if (!(args !== null && args !== void 0 && args.length)) {
    throw new RangeError('empty arguments');
  } else if (args.length === 3) {
    if (!extraSettings) return args;
  } else if (args.length === 1) {
    // @ts-ignore
    const arg = first(args);
    if (typeof arg === 'string') {
      // @ts-ignore
      args.push(',', {});
    } else if (Array.isArray(arg)) {
      args.unshift(null);
      args.push({});
    } else if (typeof arg === 'object') {
      // @ts-ignore
      args.unshift(null, ',');
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string' && args[1] instanceof RegExp) {
      args.push({});
    } else if (typeof args[1] === 'string' || Array.isArray(args[1])) {
      args.push({});
    } else {
      args.unshift(null);
    }
  } else if (args.length > 3) {
    throw new RangeError('Too many arguments passed to splitSmartly function!!!');
  }
  // @ts-ignore
  if (extraSettings) args[2] = {
    ...args[2],
    ...extraSettings
  };
  return args;
};

let screenedSymbols;
function arrayToPattern(arr) {
  var _screenedSymbols;
  (_screenedSymbols = screenedSymbols) !== null && _screenedSymbols !== void 0 ? _screenedSymbols : screenedSymbols = new Set('.{}[]^()+*?\\/$|'.split(''));
  return arr.map(s => {
    if (s instanceof RegExp) {
      return s.source;
    }
    return s.split('').map(s => screenedSymbols.has(s) ? '\\' + s : s).join('');
  }).join('|');
}

function createSeparatorsSearch(settings) {
  const {
    separators
  } = settings;
  if (typeof separators === 'string' || Array.isArray(separators)) {
    const pattern = settings.arrayToPattern([separators].flat().filter(Boolean));
    settings.separatorSearch = settings.createRegExp(pattern);
  } else if (separators) {
    settings.separatorSearch = separators;
    settings.ignoreCase = separators.ignoreCase;
  } else {
    settings.separatorSearch = /empty/;
  }
  return settings;
}

function createBracketsSearch(settings) {
  const patternParts = Object.entries(settings.bracketsMap)
  // @ts-ignore
  .flatMap(([, {
    close,
    open
  }]) => close !== open ? [open, close] : open).concat(Object.keys(settings.mentions || {})).filter(Boolean);
  const pattern = settings.arrayToPattern(patternParts);
  settings.bracketsSearch = settings.createRegExp(pattern);
  return settings;
}

function normalizeBrackets(brackets, defaultBrackets) {
  var _brackets;
  if (brackets === true) {
    brackets = defaultBrackets.slice();
  } else if (typeof brackets === 'object' && !Array.isArray(brackets)) {
    brackets = Object.entries(brackets);
  } else if (typeof brackets === 'string') {
    brackets = brackets.split(',').map(pairText => {
      let pair = pairText.trim().split(' ');
      if (pair.length !== 2) {
        if (first(pair).length === 2) {
          pair = first(pair).split('');
        } else {
          throw new TypeError(`open and close parts of brackets should be separated by space symbol`);
        }
      }
      return pair;
    });
  }
  return (_brackets = brackets) !== null && _brackets !== void 0 ? _brackets : [];
}
function buildBracketsMap(brackets, searchWithin) {
  return brackets.reduce((map, [open, close, ...args]) => {
    if (args.length === 1 && !searchWithin) {
      args.unshift(undefined);
    }
    let [searchLevels = searchWithin && 1, ignoreMode] = args;
    if (typeof searchLevels === 'number') {
      searchLevels = [searchLevels];
    }
    map[open] = {
      open,
      ignoreMode,
      searchLevels,
      close: close || open
    };
    return map;
  }, {});
}
function handleBracketsMapOptions(brackets, settings) {
  if (settings.ignoreInsideQuotes) {
    brackets.unshift([`'`,,, true], [`"`,,, true]);
  }
  return brackets;
}
function createBracketsMap(settings) {
  let brackets = settings.brackets = normalizeBrackets(settings.brackets, settings.defaultBrackets);
  brackets = handleBracketsMapOptions(brackets, settings);
  settings.bracketsMap = buildBracketsMap(brackets, settings.searchWithin);
  return settings;
}

function mergeSettings(_this, settings) {
  // @ts-ignore
  if (!settings) return _this;
  // @ts-ignore
  settings = {
    ..._this,
    ...settings
  };
  if (['brackets', 'mentions'].some(prop => prop in settings)) {
    settings.init();
  }
  // @ts-ignore
  return settings;
}

function initSettings(settings) {
  if (Array.isArray(settings.mentions) || typeof settings.mentions === 'string') {
    const mentionsMap = [settings.mentions].flat().filter(Boolean).reduce((map, keyword) => {
      const key = settings.ignoreCase ? keyword.toUpperCase() : keyword;
      map[key] = keyword;
      return map;
    }, {});
    settings.mentions = !isEmpty(mentionsMap) && mentionsMap;
  }
  return settings.createBracketsMap().createBracketsSearch().createSeparatorsSearch();
}

function newDefaultSettings() {
  return {
    brackets: [],
    mentions: [],
    ignoreInsideQuotes: true,
    includeSeparatorMode: "NONE" /* EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE */,
    ignoreCase: true,
    trimResult: true,
    trimSeparators: false,
    defaultBrackets: [['(', ')'], ['[', ']'], ['{', '}']]
  };
}

const prepareSearch = (separators, settings) => {
  const splitSettings = {
    ...newDefaultSettings(),
    ...settings,
    separators,
    init() {
      return initSettings(this);
    },
    merge(settings) {
      return mergeSettings(this, settings);
    },
    arrayToPattern(arr) {
      return arrayToPattern(arr);
    },
    createRegExp(pattern) {
      return RegExp(pattern, 'g');
    },
    createBracketsMap() {
      return createBracketsMap(this);
    },
    createBracketsSearch() {
      return createBracketsSearch(this);
    },
    createSeparatorsSearch() {
      return createSeparatorsSearch(this);
    }
  };
  return splitSettings.init();
};

function _splitSmartlyCore(separators, settings) {
  const splitSettings = prepareSearch(separators, settings);
  const splitFn = createSplitFunction(splitSettings);
  return {
    splitSettings,
    splitFn
  };
}
function splitSmartly(...args) {
  let [str, separators, settings] = getSplitSmartlyArgs(args);
  const {
    splitFn
  } = _splitSmartlyCore(separators, settings);
  // @ts-ignore
  return str !== null ? splitFn(str) : splitFn;
}
function searchWithin(...args) {
  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      args.push(null, {});
    } else {
      args.unshift(null);
    }
  }
  // @ts-ignore
  if (typeof args[1] !== 'object' || !args[1].brackets) {
    // @ts-ignore
    args[1] = {
      brackets: args[1]
    };
  }
  args.splice(1, 0, null);
  return splitSmartly(...getSplitSmartlyArgs(args, {
    searchWithin: true
  }));
}
splitSmartly.searchWithin = searchWithin;
function search(...args) {
  return splitSmartly(...getSplitSmartlyArgs(args, {
    includeSeparatorMode: "ONLY" /* EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY */
  }));
}
splitSmartly.search = search;

exports.SearchResults = SearchResults;
exports._splitSmartlyCore = _splitSmartlyCore;
exports.createSplitFunction = createSplitFunction;
exports.default = splitSmartly;
exports.getSplitSmartlyArgs = getSplitSmartlyArgs;
exports.prepareSearch = prepareSearch;
exports.search = search;
exports.searchWithin = searchWithin;
exports.splitSmartly = splitSmartly;
//# sourceMappingURL=index.cjs.development.cjs.map
