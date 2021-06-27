import { IIncludeSeparatorMode, ISplitSettings } from '../types';

export function createBracketsSearch<M extends IIncludeSeparatorMode>(settings: ISplitSettings<M>)
{
	const patternParts = Object.entries(settings.bracketsMap)
		// @ts-ignore
		.flatMap(([, { close, open }]) => close !== open ? [open, close] : open)
		.concat(Object.keys(settings.mentions || {}))
		.filter(Boolean)

	const pattern = settings.arrayToPattern(patternParts)
	settings.bracketsSearch = settings.createRegExp(pattern)

	return settings
}
