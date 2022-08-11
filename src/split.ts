import { IIncludeSeparatorMode, ISearchSettingsInput, ISplitSettings } from './types';
import { SearchResults } from './searchResults';

export function split<M extends IIncludeSeparatorMode, M2 extends IIncludeSeparatorMode = M>(this: ISplitSettings<any>, string: string, settings?: ISearchSettingsInput<M2>)
{
	const splitSettings = (this as ISplitSettings<M>).merge(settings)
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
