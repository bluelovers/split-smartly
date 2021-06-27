import { IIncludeSeparatorMode, ISplitSettings } from '../types';

export function createSeparatorsSearch<M extends IIncludeSeparatorMode>(settings: ISplitSettings<M>)
{
	const { separators } = settings

	if (typeof separators === 'string' || Array.isArray(separators))
	{
		const pattern = settings.arrayToPattern([separators].flat().filter(Boolean))
		settings.separatorSearch = settings.createRegExp(pattern)
	}
	else if (separators)
	{
		settings.separatorSearch = separators
		settings.ignoreCase = separators.ignoreCase
	}
	else
	{
		settings.separatorSearch = /empty/
	}

	return settings
}
