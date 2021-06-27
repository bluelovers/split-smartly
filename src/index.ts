import {
	EnumFindBracketsAction,
	IBracketsInput,
	IBracketsObject,
	ICheckParams,
	IGetIncludeSeparatorModeBySettings,
	IGetPipeItemByIncludeSeparatorMode,
	IGetPipeItemBySettings,
	IIncludeSeparatorMode,
	IMention,
	IParameterSeparator,
	IParametersSplitSmartly,
	IParametersSplitSmartlyReturnQuery,
	IParametersSplitSmartlyReturnResult,
	IReturnTypeCheckSeparator,
	ISearchSettings,
	ISearchSettingsInput,
	ISeparatorsNode,
	ISplitFunction,
	ISplitFunctionCore,
	ISplitSettings,
	ITextNodeOrText,
} from "./types"
import { isEmpty, last, once } from './util';
import { getSplitSmartlyArgs } from './util/getSplitSmartlyArgs';
import { prepareSearch } from './util/prepareSearch';

export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnQuery<M>): ISplitFunction<M>
export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnResult<M>): IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[]
export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M>): ReturnType<typeof split> | ReturnType<typeof createSplitFunction>
{
	let [string, separators, settings] = getSplitSmartlyArgs(args as any)

	const splitSettings = prepareSearch(separators, settings)
	const splitFn = createSplitFunction(splitSettings)

	// @ts-ignore
	return string !== null ? splitFn(string) : splitFn
}

splitSmartly.searchWithin = <M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M> | [string, IBracketsInput]) =>
{
	if (args.length === 1)
	{
		if (typeof args[0] === 'string')
		{
			args.push(null, {})
		}
		else
		{
			args.unshift(null)
		}
	}

	// @ts-ignore
	if (typeof args[1] !== 'object' || !args[1].brackets)
	{
		// @ts-ignore
		args[1] = { brackets: args[1] }
	}

	args.splice(1, 0, null)

	return splitSmartly(...getSplitSmartlyArgs<M>(args as any, { searchWithin: true })) as string[]
}

splitSmartly.search = (...args: IParametersSplitSmartly<EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY>) =>
{
	return splitSmartly(...getSplitSmartlyArgs(args, { includeSeparatorMode: EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY }))
}

function split<M extends IIncludeSeparatorMode>(string: string, settings?: ISearchSettingsInput<M>)
{
	// @ts-ignore
	const splitSettings = (this as ISplitSettings).merge(settings)
	let res = new SearchResults(string, splitSettings)

	if (typeof splitSettings.indexes === 'number')
	{
		return res.getNext()
	}
	else if (!splitSettings.returnIterator)
	{
		return res.getAll()
	}

	return res
}

export const createSplitFunction = <M extends IIncludeSeparatorMode>(settings: ISearchSettingsInput<M>): ISplitFunction<M> =>
{
	const splitFn = split.bind(settings as ISplitSettings<M>) as ISplitFunctionCore<M> & ThisType<ISplitSettings<M>>

	return Object.assign(splitFn, {
		getOne<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string,
			index: number,
			settings = {} as T,
		): IGetPipeItemBySettings<T>
		{
			if (isNaN(index))
			{
				throw new Error('second parameter of `getOne` function should be index')
			}

			// @ts-ignore
			return splitFn(string, { ...settings, indexes: index })
		},

		getFirst<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string,
			settings = {} as T,
		): IGetPipeItemBySettings<T>
		{
			// @ts-ignore
			return splitFn(string, { ...settings, indexes: 0 })
		},

		getIndexes<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string,
			indexes: number[],
			settings = {} as T,
		): IGetPipeItemBySettings<T>
		{
			if (!Array.isArray(indexes))
			{
				throw new Error('second parameter of `getOne` function should be array of indexes')
			}

			// @ts-ignore
			return splitFn(string, { ...settings, indexes })
		},

		getIterator<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string,
			settings = {} as T,
		): SearchResults<IGetIncludeSeparatorModeBySettings<T>>
		{
			// @ts-ignore
			return splitFn(string, { ...settings, returnIterator: true })
		},
	} as ISplitFunction<M>)
}

export class SearchResults<M extends IIncludeSeparatorMode, T extends IGetPipeItemByIncludeSeparatorMode<IIncludeSeparatorMode> = IGetPipeItemBySettings<ISearchSettingsInput<M>>>
{

	brackets: IBracketsObject[]
	pipe: T[]
	currentMentions: IMention[]
	position: number
	isDone: boolean
	freeArea: { start: number, end: number }
	lastSeparator: ISeparatorsNode
	searchString: string
	indexes: {
		values: Set<any[]>,
		max: number,
		count: number,
		hasIndex(): boolean,
		isOverMax(): boolean,
	}

	protected tempPosition: number

	constructor(public string: string, public searchSettings: ISearchSettings<M>)
	{
		this.prepareSearch()
	}

	prepareSearch()
	{
		const { separatorSearch, bracketsSearch, indexes } = this.searchSettings
		const indexesArr = [indexes].flat().filter(Boolean)

		for (const regExp of [separatorSearch, bracketsSearch]) regExp.lastIndex = 0

		Object.assign(this, {
			brackets: [],
			pipe: [],
			currentMentions: [],
			position: 0,
			isDone: false,
			freeArea: { start: 0, end: undefined },
			lastSeparator: undefined,
			searchString: (this.searchSettings.ignoreCase &&
				!this.searchSettings.separatorSearch.ignoreCase)
				? this.string.toUpperCase()
				: this.string,

			indexes: !isEmpty(indexesArr) && {
				values: new Set(indexesArr),
				max: Math.max(...indexesArr),
				count: 0,

				hasIndex()
				{
					return this.max === -Infinity || this.values.has(this.count++)
				},

				isOverMax()
				{
					return this.max !== -Infinity && this.count > this.max
				},
			},
		})
	}

	get pipeIsEmpty()
	{
		return isEmpty(this.pipe)
	}

	getMentions(indexFrom: number, indexTo: number): [string[], IMention[]]
	{
		const properMentions = [] as string[], restMentions = [] as IMention[]

		for (const item of this.currentMentions)
		{
			if (item.index >= indexFrom && item.index < indexTo)
			{
				properMentions.push(item.mention)
			}
			else
			{
				restMentions.push(item)
			}
		}

		return [properMentions.length && properMentions, restMentions]
	}

	trimResultText(text: string)
	{
		return this.searchSettings.trimResult ? text.trim() : text
	}

	trimSeparatorText(text: string)
	{
		return this.searchSettings.trimSeparators ? text.trim() : text
	}

	checkSeparator(pSeparator: IParameterSeparator): IReturnTypeCheckSeparator
	{
		const { string } = this
		const { check, includePositions, mentions } = this.searchSettings

		let {
			0: separatorText = '',
			index: separatorPosition = string.length,
			searchWithinData,
		} = pSeparator ?? {} as IParameterSeparator

		const separatorLength = separatorText.length

		const lastPosition = searchWithinData
			? searchWithinData.openPosition
			: this.position

		let text: ITextNodeOrText = string.substring(lastPosition, separatorPosition)
		if (!separatorText) this.isDone = true

		text = this.trimResultText(text)
		separatorText = this.trimSeparatorText(separatorText)

		let separator: any = searchWithinData
			? [searchWithinData.open, searchWithinData.close]
			: separatorText

		if (includePositions)
		{
			text = { text, position: lastPosition }
			separator = { text: separator as any, position: separatorPosition, isSeparator: true }
		}

		let restMentions: IMention[]
		if (mentions)
		{
			text = typeof text === 'string' ? { text } : text
			const [properMentions, restItems] = this.getMentions(lastPosition, separatorPosition)

			if (properMentions)
			{
				text.mentions = properMentions
				restMentions = restItems
			}
		}

		if (check && separatorText)
		{
			const position = isNaN(this.tempPosition) ? lastPosition : this.tempPosition
			this.tempPosition = separatorPosition + separatorText.length

			const self = this
			const checkParams: ICheckParams = {
				getString: once(() => self.trimResultText(string.substring(position, separatorPosition))),
				getTextAfter: once(() => string.substring(separatorPosition + separatorText.length)),
				getMentions: once(() => self.getMentions(position, separatorPosition)[0]),
				getSeparator: once(() => separatorText),

				get string() { return this.getString() },
				get textAfter() { return this.getTextAfter() },
				get mentions() { return this.getMentions() },
				get separator() { return this.getSeparator() },
			}

			if (!check(checkParams)) return [] as any
			delete this.tempPosition
		}

		if (restMentions) this.currentMentions = restMentions

		this.position = separatorPosition + separatorLength
		return [text, separator, true]
	}

	pushToPipe(value: T)
	{
		if (this.indexes)
		{
			if (!this.indexes.hasIndex())
			{
				return
			}

			if (this.indexes.isOverMax())
			{
				this.isDone = true
			}
		}

		this.pipe.push(value)
	}

	addToPipe(pSeparator?: IParameterSeparator)
	{
		let [text, separator, checked] = this.checkSeparator(pSeparator)
		if (!checked) return false

		switch (this.searchSettings.includeSeparatorMode)
		{
			case EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY:
				this.pushToPipe(text as any)
				if (separator)
				{
					this.pushToPipe(separator as any)
				}
				break

			case EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT:
				this.pushToPipe([text, separator] as any)
				break

			case EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT:
				const textIsEmpty = !(typeof text === 'object' ? text.text : text)
				if (!textIsEmpty || this.lastSeparator)
				{
					this.pushToPipe([this.lastSeparator, text] as any)
				}
				this.lastSeparator = separator
				break

			case EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY:
				if (separator) this.pushToPipe(separator as any)
				break

			default:
				this.pushToPipe(text as any)
		}

		return !this.pipeIsEmpty
	}

	findBrackets()
	{
		const { searchString: string, brackets, freeArea, searchSettings } = this
		const { bracketsSearch, separatorSearch, searchWithin } = searchSettings

		const condition = searchWithin ? () => this.pipeIsEmpty : () => !freeArea.end

		while (condition())
		{
			const match = bracketsSearch.exec(string)
			if (!match)
			{
				if (searchWithin || isNaN(freeArea.start)) return false

				freeArea.end = string.length - 1
				continue
			}

			const fragment = match[0]
			const { close, ignoreMode, searchLevels } = last(brackets) || {}

			let block
			//const ACTION_CLOSE = 1, ACTION_OPEN = 2, ACTION_ADD_FRAGMENT = 3, ACTION_NULL = 4

			const action: EnumFindBracketsAction =
				(fragment === close && EnumFindBracketsAction.ACTION_CLOSE) ||
				(ignoreMode && EnumFindBracketsAction.ACTION_NULL) ||
				((block = searchSettings.bracketsMap[fragment]) && EnumFindBracketsAction.ACTION_OPEN) ||
				(searchSettings.mentions?.[fragment] && EnumFindBracketsAction.ACTION_ADD_FRAGMENT)

			switch (action)
			{
				case EnumFindBracketsAction.ACTION_CLOSE:
					const bracketData = brackets.pop()
					if (searchWithin)
					{
						if (searchLevels === true || searchLevels.includes(brackets.length + 1))
						{
							this.addToPipe(Object.assign(match, { searchWithinData: bracketData }))
						}
					}
					else if (isEmpty(brackets))
					{
						freeArea.start = match.index
						if (separatorSearch && separatorSearch.lastIndex < freeArea.start)
						{
							separatorSearch.lastIndex = freeArea.start
						}
					}
					break

				case EnumFindBracketsAction.ACTION_OPEN:
					brackets.push({ ...block, openPosition: match.index + fragment.length })
					if (brackets.length === 1 && !searchWithin)
					{
						freeArea.end = match.index
					}
					break

				case EnumFindBracketsAction.ACTION_ADD_FRAGMENT:
					const mention = searchSettings.mentions[fragment]
					this.currentMentions.push({ mention, index: match.index })
					break
			}
		}

		return true
	}

	findSeparator(separator: IParameterSeparator)
	{
		const { searchString: string, freeArea } = this
		const { separatorSearch } = this.searchSettings

		let stopSearching: boolean
		while (!stopSearching)
		{
			separator = separator || separatorSearch.exec(string)
			if (!separator)
			{
				this.addToPipe()
			}

			else if (separator.index <= freeArea.end)
			{
				const isAdded =
					separator.index >= freeArea.start &&
					this.addToPipe(separator)

				separator = null

				if (!isAdded) continue
			}

			else
			{
				freeArea.start = freeArea.end = undefined
			}

			stopSearching = true
		}

		return separator
	}

	getNext(): T
	{
		let separator: IParameterSeparator
		while (this.pipeIsEmpty && !this.isDone)
		{
			if (!this.findBrackets())
			{
				this.isDone = true
			}
			else if (!this.searchSettings.searchWithin)
			{
				separator = this.findSeparator(separator)
			}
		}
		return this.pipeIsEmpty ? null : this.pipe.shift()
	}

	getAll() { return [...this] }

	getRest()
	{
		const res: T[] = []
		let value: T
		while (null !== (value = this.getNext()))
		{
			res.push(value)
		}
		return res
	}

	// @ts-ignore
	* [Symbol.iterator]()
	{
		this.prepareSearch()
		const object = this

		let value: T;

		do
		{
			value = object.getNext()
			if (value !== null)
			{
				yield value
			}
		}
		while (value !== null)

		/*
		return {
			//object,

			next () {
				const value = object.getNext()
				if (value === null) return { done: true }

				return { value, done: false }
			}
		}
		 */
	}
}

export const enum EnumIncludeSeparatorMode
{
	INCLUDE_SEPARATOR_NONE = 'NONE',
	INCLUDE_SEPARATOR_SEPARATELY = 'SEPARATELY',
	INCLUDE_SEPARATOR_LEFT = 'LEFT',
	INCLUDE_SEPARATOR_RIGHT = 'RIGHT',
	INCLUDE_SEPARATOR_ONLY = 'ONLY',
}

export const INCLUDE_SEPARATOR_NONE = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE
export const INCLUDE_SEPARATOR_SEPARATELY = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY
export const INCLUDE_SEPARATOR_LEFT = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT
export const INCLUDE_SEPARATOR_RIGHT = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT
export const INCLUDE_SEPARATOR_ONLY = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY

export default splitSmartly
