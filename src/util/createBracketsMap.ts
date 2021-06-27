import { IBrackets, IBracketsMap, IIncludeSeparatorMode, ISplitSettings } from '../types';
import { first } from '../util';

export function createBracketsMap<M extends IIncludeSeparatorMode>(settings: ISplitSettings<M>)
{
	let { brackets = [] as IBrackets, ignoreInsideQuotes } = settings
	if (brackets === true)
	{
		brackets = settings.defaultBrackets
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
						throw new TypeError(`open and close parts of brackets should be separated by space symbol`)
					}
				}
				return pair as any
			}) as IBrackets
	}

	if (ignoreInsideQuotes)
	{
		brackets.unshift([`'`, , , true], [`"`, , , true])
	}

	settings.bracketsMap = brackets.reduce((map, [open, close, ...args]) =>
	{
		if (args.length === 1 && !settings.searchWithin)
		{
			args.unshift(undefined)
		}
		let [searchLevels = settings.searchWithin && 1, ignoreMode] = args
		if (typeof searchLevels === 'number')
		{
			searchLevels = [searchLevels]
		}
		map[open] = { open, ignoreMode, searchLevels, close: close || open }
		return map
	}, {} as IBracketsMap)

	return settings
}
