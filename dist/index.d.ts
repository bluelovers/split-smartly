import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { ITSValueOrArray } from 'ts-type/lib/type/base';

export declare class SearchResults<M extends IIncludeSeparatorMode, T extends IGetPipeItemByIncludeSeparatorMode<IIncludeSeparatorMode> = IGetPipeItemBySettings<ISearchSettingsInput<M>>> {
	string: string;
	searchSettings: ISearchSettings<M>;
	brackets: IBracketsObject[];
	pipe: T[];
	currentMentions: IMention[];
	position: number;
	isDone: boolean;
	freeArea: {
		start: number;
		end: number;
	};
	lastSeparator: ISeparatorsNode;
	searchString: string;
	indexes: {
		values: Set<any[]>;
		max: number;
		count: number;
		hasIndex(): boolean;
		isOverMax(): boolean;
	};
	protected tempPosition: number;
	constructor(string: string, searchSettings: ISearchSettings<M>);
	protected prepareSearch(): void;
	get pipeIsEmpty(): boolean;
	getMentions(indexFrom: number, indexTo: number): [
		string[],
		IMention[]
	];
	trimResultText(text: string): string;
	trimSeparatorText(text: string): string;
	checkSeparator(pSeparator: IParameterSeparator): IReturnTypeCheckSeparator;
	pushToPipe(value: T): void;
	addToPipe(pSeparator?: IParameterSeparator): boolean;
	findBrackets(): boolean;
	findSeparator(separator: IParameterSeparator): IParameterSeparator;
	getNext(): T;
	getAll(): T[];
	getRest(): T[];
	[Symbol.iterator](): Generator<T, void, unknown>;
}
export type IBracketsItem = [
	open: IBracketsObject["open"],
	close: IBracketsObject["close"],
	searchLevels?: IBracketsObject["searchLevels"],
	ignoreMode?: IBracketsObject["ignoreMode"]
];
export type IBrackets = IBracketsItem[];
export type IBracketsInput = true | string | IBrackets | Record<string, string>;
export interface IBracketsObject {
	open: string;
	close: string;
	searchLevels: true | number[];
	ignoreMode: boolean;
	openPosition?: number;
}
export interface IBracketsMap {
	[k: string]: IBracketsObject;
}
export type IMentionsRecord = Record<string, string>;
export type IMentionsInput = string | boolean | string[] | IMentionsRecord;
export interface ISplitSettings<M extends IIncludeSeparatorMode> {
	brackets: IBracketsInput;
	mentions: IMentionsInput;
	ignoreInsideQuotes: boolean;
	includeSeparatorMode: M;
	ignoreCase: boolean;
	trimResult: boolean;
	trimSeparators: boolean;
	check(checkParams: ICheckParams): boolean;
	defaultBrackets: IBrackets;
	separators: ISeparators;
	init(): ISplitSettings<M>;
	merge<M2 extends IIncludeSeparatorMode = M>(settings: ISplitSettingsInput<M2>): ISplitSettings<M2>;
	arrayToPattern(arr: (string | RegExp)[]): string;
	createRegExp(pattern: string): RegExp;
	createBracketsMap(): ISplitSettings<M>;
	createBracketsSearch(): ISplitSettings<M>;
	createSeparatorsSearch(): ISplitSettings<M>;
	bracketsMap: IBracketsMap;
	bracketsSearch: RegExp;
	separatorSearch: RegExp;
	searchWithin: boolean;
	indexes: ITSValueOrArray<number>;
	returnIterator: boolean;
	includePositions: boolean;
}
export interface ISplitSettingsInput<M extends IIncludeSeparatorMode> extends Partial<ISplitSettings<M>> {
}
export declare const enum EnumIncludeSeparatorMode {
	INCLUDE_SEPARATOR_NONE = "NONE",
	INCLUDE_SEPARATOR_SEPARATELY = "SEPARATELY",
	INCLUDE_SEPARATOR_LEFT = "LEFT",
	INCLUDE_SEPARATOR_RIGHT = "RIGHT",
	INCLUDE_SEPARATOR_ONLY = "ONLY"
}
export interface ISearchSettings<M extends IIncludeSeparatorMode = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY> extends ISplitSettings<M> {
}
export interface ISearchSettingsInput<M extends IIncludeSeparatorMode = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY> extends Partial<ISearchSettings<M>> {
}
export interface ICheckParams {
	getString(): string;
	getTextAfter(): string;
	getMentions(): string[];
	getSeparator(): string;
	readonly string: string;
	readonly textAfter: string;
	readonly mentions: string[];
	readonly separator: string;
}
export interface IMention {
	index: number;
	mention: string;
}
export type IPipeItem = string | [
	string,
	ISeparators
] | [
	ISeparators,
	string
] | ISeparators;
export interface IPipeItemMap {
	[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY]: string;
	[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT]: [
		string,
		ISeparators
	];
	[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT]: [
		ISeparators,
		string
	];
	[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY]: ISeparators;
}
export type IGetPipeItemByIncludeSeparatorMode<M extends IIncludeSeparatorMode> = M extends EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY ? IPipeItemMap[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY] : M extends EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT ? IPipeItemMap[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT] : M extends EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT ? IPipeItemMap[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT] : IPipeItemMap[EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY];
export type IGetIncludeSeparatorModeBySettings<T extends ISearchSettingsInput<IIncludeSeparatorMode>> = T extends ISearchSettingsInput<infer M> ? M : IIncludeSeparatorMode;
export type IGetPipeItemBySettings<T extends ISearchSettingsInput<IIncludeSeparatorMode>> = IGetPipeItemByIncludeSeparatorMode<IGetIncludeSeparatorModeBySettings<T>>;
export type IIncludeSeparatorMode = ITSTypeAndStringLiteral<EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE | EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY | EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT | EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT | EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY>;
export type ISeparators = ITSValueOrArray<string | RegExp>;
export type ISeparatorsNode = ISeparators | ITextNodeSeparator;
export interface ITextNodeBase {
	text: string;
	position?: number;
	isSeparator?: never;
	mentions?: string[];
}
export interface ITextNodeSeparator extends Omit<ITextNodeBase, "isSeparator" | "text"> {
	text: ISeparators;
	position: number;
	isSeparator: true;
}
export type ITextNodeOrText = string | ITextNodeBase | ITextNodeSeparator;
export declare const enum EnumFindBracketsAction {
	ACTION_CLOSE = 1,
	ACTION_OPEN = 2,
	ACTION_ADD_FRAGMENT = 3,
	ACTION_NULL = 4
}
export type IParametersSplitSmartlyReturnQuery<M extends IIncludeSeparatorMode> = [
	Exclude<ISeparators, string>,
	ISplitSettingsInput<M>?
];
export type IParametersSplitSmartlyReturnResult<M extends IIncludeSeparatorMode> = [
	...([
		string,
		ISeparators?
	] | [
		string
	]),
	ISplitSettingsInput<M>?
];
export type IParametersSplitSmartly<M extends IIncludeSeparatorMode> = IParametersSplitSmartlyReturnQuery<M> | IParametersSplitSmartlyReturnResult<M>;
export interface ISplitFunctionCore<M extends IIncludeSeparatorMode> {
	(string: string, settings: ISearchSettingsInput<M> & {
		returnIterator: true;
	}): SearchResults<M>;
	(string: string, settings: ISearchSettingsInput<M> & {
		indexes: number[];
	}): IGetPipeItemByIncludeSeparatorMode<M>[];
	(string: string, settings: ISearchSettingsInput<M> & {
		returnIterator?: false | void;
	}): IGetPipeItemByIncludeSeparatorMode<M>[];
	(string: string, settings: ISearchSettingsInput<M> & {
		indexes: number;
	}): IGetPipeItemByIncludeSeparatorMode<M>;
	(string: string, settings?: ISearchSettingsInput<M>): SearchResults<M> | IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[];
}
export interface ISplitFunction<M extends IIncludeSeparatorMode> extends ISplitFunctionCore<M>, ThisType<ISplitSettings<M>> {
	getOne<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string, index: number, settings?: T): IGetPipeItemBySettings<T>;
	getFirst<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string, settings?: T): IGetPipeItemBySettings<T>;
	getIndexes<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string, indexes: number[], settings?: T): IGetPipeItemBySettings<T>[];
	getIndexes<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string, indexes: number, settings?: T): IGetPipeItemBySettings<T>;
	getIterator<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string, settings?: T): SearchResults<IGetIncludeSeparatorModeBySettings<T>>;
}
export interface IParameterSeparator extends RegExpExecArray {
	searchWithinData?: IBracketsObject;
}
export type IReturnTypeCheckSeparator = [
	text: string | ITextNodeBase,
	separator: ISeparatorsNode,
	checked: boolean
];
export declare function createSplitFunction<M extends IIncludeSeparatorMode>(settings: ISearchSettingsInput<M>): ISplitFunction<M>;
export declare function getSplitSmartlyArgs<M extends IIncludeSeparatorMode, M2 extends IIncludeSeparatorMode = M>(args: IParametersSplitSmartly<M>, extraSettings?: ISplitSettingsInput<M2>): [
	string,
	ISeparators,
	ISplitSettings<M2>
];
export declare function prepareSearch<M extends IIncludeSeparatorMode>(separators: ISeparators, settings: ISplitSettingsInput<M>): ISplitSettings<M>;
export declare function newDefaultBrackets(): [
	[
		"(",
		")"
	],
	[
		"[",
		"]"
	],
	[
		"{",
		"}"
	]
];
export declare function newDefaultSettings(): {
	brackets: IBrackets;
	mentions: string[];
	ignoreInsideQuotes: true;
	includeSeparatorMode: EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE;
	ignoreCase: true;
	trimResult: true;
	trimSeparators: false;
	defaultBrackets: IBrackets;
};
export declare function _splitSmartlyCore<M extends IIncludeSeparatorMode>(separators: ISeparators, settings: ISplitSettings<M>): {
	splitSettings: ISplitSettings<M>;
	splitFn: ISplitFunction<M>;
};
export declare function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnQuery<M>): ISplitFunction<M>;
export declare function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnResult<M>): IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[];
export declare function searchWithin<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M> | [
	string,
	IBracketsInput
]): string[];
export declare function search(...args: IParametersSplitSmartly<EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY>): ISeparators | ISeparators[];

export {
	splitSmartly as default,
};

export {};
