import { IIncludeSeparatorMode, ISearchSettingsInput, ISplitSettings } from './types';
import { SearchResults } from './searchResults';

export function split<M extends IIncludeSeparatorMode>(string: string, settings?: ISearchSettingsInput<M>)
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
