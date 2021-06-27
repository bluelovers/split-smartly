import { IIncludeSeparatorMode, ISplitSettings } from '../types';
import { isEmpty } from '../util';

export function initSettings<M extends IIncludeSeparatorMode>(settings: ISplitSettings<M>)
{
	if (Array.isArray(settings.mentions) || typeof settings.mentions === 'string')
	{
		const mentionsMap =
			[settings.mentions].flat().filter(Boolean).reduce((map, keyword: string) =>
			{
				const key = settings.ignoreCase ? keyword.toUpperCase() : keyword
				map[key] = keyword
				return map
			}, {} as Record<string, string>)

		settings.mentions = !isEmpty(mentionsMap) && mentionsMap
	}

	return settings
		.createBracketsMap()
		.createBracketsSearch()
		.createSeparatorsSearch()
}
