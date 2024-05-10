import {
	IGetIncludeSeparatorModeBySettings,
	IGetPipeItemBySettings,
	IIncludeSeparatorMode,
	ISearchSettingsInput,
	ISplitFunction,
	ISplitFunctionCore,
	ISplitSettings,
} from './types';
import { split } from './split';
import { SearchResults } from './searchResults';

export function createSplitFunction<M extends IIncludeSeparatorMode>(settings: ISearchSettingsInput<M>): ISplitFunction<M>
{
	const splitFn = split.bind(settings as ISplitSettings<M>) as unknown as ISplitFunctionCore<M> & ThisType<ISplitSettings<M>>

	return Object.assign(splitFn, {
		getOne<T extends ISearchSettingsInput<IIncludeSeparatorMode> = ISearchSettingsInput<M>>(string: string,
			index: number,
			settings = {} as T,
		): IGetPipeItemBySettings<T>
		{
			if (isNaN(index))
			{
				throw new TypeError('second parameter of `getOne` function should be index')
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
				throw new TypeError('second parameter of `getOne` function should be array of indexes')
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
