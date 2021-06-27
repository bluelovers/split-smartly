import { IBrackets, IBracketsInput, IBracketsMap, IIncludeSeparatorMode, ISplitSettings } from '../types';
import { first } from '../util';

export function normalizeBrackets(brackets: IBracketsInput, defaultBrackets: IBrackets)
{
	if (brackets === true)
	{
		brackets = defaultBrackets.slice()
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

	return brackets ?? []
}

export function buildBracketsMap(brackets: IBrackets, searchWithin?: boolean)
{
	return brackets.reduce((map, [open, close, ...args]) =>
	{
		if (args.length === 1 && !searchWithin)
		{
			args.unshift(undefined)
		}
		let [searchLevels = searchWithin && 1, ignoreMode] = args
		if (typeof searchLevels === 'number')
		{
			searchLevels = [searchLevels]
		}
		map[open] = { open, ignoreMode, searchLevels, close: close || open }
		return map
	}, {} as IBracketsMap)
}

export function handleBracketsMapOptions(brackets: IBrackets, settings: ISplitSettings<IIncludeSeparatorMode>)
{
	if (settings.ignoreInsideQuotes)
	{
		brackets.unshift([`'`, , , true], [`"`, , , true])
	}

	return brackets
}

export function createBracketsMap<T extends ISplitSettings<IIncludeSeparatorMode>>(settings: T): T & {
	brackets: IBrackets,
	bracketsMap: IBracketsMap,
}
{
	let brackets = settings.brackets = normalizeBrackets(settings.brackets, settings.defaultBrackets)

	//let brackets = settings.brackets.slice();

	brackets = handleBracketsMapOptions(brackets, settings);

	settings.bracketsMap = buildBracketsMap(brackets, settings.searchWithin);

	return settings as any
}
