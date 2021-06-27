import {
	IBrackets,
	IBracketsMap,
	IIncludeSeparatorMode,
	ISeparators,
	ISplitSettings,
	ISplitSettingsInput,
} from '../types';
import { first, isEmpty } from '../util';
import { arrayToPattern } from './arrayToPattern';

export const prepareSearch = <M extends IIncludeSeparatorMode>(separators: ISeparators,
	settings: ISplitSettingsInput<M>,
) =>
{
	const defaultSettings = {
		brackets: [],
		mentions: [],
		ignoreInsideQuotes: true,
		includeSeparatorMode: 'NONE',
		ignoreCase: true,
		trimResult: true,
		trimSeparators: false,
		check: undefined,
		defaultBrackets: [['(', ')'], ['[', ']'], ['{', '}']],
	} as any as ISplitSettings<M>

	const splitSettings: ISplitSettings<M> = {
		...defaultSettings,
		...settings,

		separators,

		init()
		{
			if (Array.isArray(this.mentions) || typeof this.mentions === 'string')
			{
				const mentionsMap =
					[this.mentions].flat().filter(Boolean).reduce((map, keyword) =>
					{
						const key = this.ignoreCase ? keyword.toUpperCase() : keyword
						map[key] = keyword
						return map
					}, {} as Record<string, string>)

				this.mentions = !isEmpty(mentionsMap) && mentionsMap
			}

			return this
				.createBracketsMap()
				.createBracketsSearch()
				.createSeparatorsSearch()
		},

		merge<M2 extends IIncludeSeparatorMode = M>(this, settings: ISplitSettingsInput<M2>): ISplitSettings<M2>
		{
			// @ts-ignore
			if (!settings) return this

			// @ts-ignore
			settings = { ...this, ...settings }
			if (['brackets', 'mentions'].some(prop => prop in settings))
			{
				settings.init()
			}

			// @ts-ignore
			return settings
		},

		arrayToPattern(arr)
		{
			return arrayToPattern(arr)
		},

		createRegExp(pattern)
		{
			return RegExp(pattern, 'g')
		},

		createBracketsMap()
		{
			let { brackets = [] as IBrackets, ignoreInsideQuotes } = this
			if (brackets === true)
			{
				brackets = this.defaultBrackets
			}
			else if (typeof brackets === 'object' && !Array.isArray(brackets))
			{
				brackets = Object.entries(brackets) as IBrackets
			}
			else if (typeof brackets === 'string')
			{
				brackets = brackets
					.split(',')
					.map(pairText =>
					{
						let pair = pairText.trim().split(' ')
						if (pair.length !== 2)
						{
							if (first(pair).length === 2)
							{
								pair = first(pair).split('')
							}
							else
							{
								throw new Error(`open and close parts of brackets should be separated by space symbol`)
							}
						}
						return pair as any
					}) as IBrackets
			}

			if (ignoreInsideQuotes)
			{
				brackets.unshift([`'`, , , true], [`"`, , , true])
			}

			this.bracketsMap = brackets.reduce((map, [open, close, ...args]) =>
			{
				if (args.length === 1 && !this.searchWithin)
				{
					args.unshift(undefined)
				}
				let [searchLevels = this.searchWithin && 1, ignoreMode] = args
				if (typeof searchLevels === 'number')
				{
					searchLevels = [searchLevels]
				}
				map[open] = { open, ignoreMode, searchLevels, close: close || open }
				return map
			}, {} as IBracketsMap)

			return this
		},

		createBracketsSearch()
		{
			const patternParts = Object.entries(this.bracketsMap)
				// @ts-ignore
				.flatMap(([, { close, open }]) => close !== open ? [open, close] : open)
				.concat(Object.keys(this.mentions || {}))
				.filter(Boolean)

			const pattern = this.arrayToPattern(patternParts)
			this.bracketsSearch = this.createRegExp(pattern)

			return this
		},

		createSeparatorsSearch()
		{
			const { separators } = this

			if (typeof separators === 'string' || Array.isArray(separators))
			{
				const pattern = this.arrayToPattern([separators].flat().filter(Boolean))
				this.separatorSearch = this.createRegExp(pattern)
			}
			else if (separators)
			{
				this.separatorSearch = separators
				this.ignoreCase = separators.ignoreCase
			}
			else
			{
				this.separatorSearch = /empty/
			}

			return this
		},
	}

	return splitSettings.init()
}
