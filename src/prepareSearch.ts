import {
	IIncludeSeparatorMode,
	ISeparators,
	ISplitSettings,
	ISplitSettingsInput,
} from './types';
import { arrayToPattern } from './util/arrayToPattern';
import { createSeparatorsSearch } from './util/createSeparatorsSearch';
import { createBracketsSearch } from './util/createBracketsSearch';
import { createBracketsMap } from './util/createBracketsMap';
import { mergeSettings } from './util/mergeSettings';
import { initSettings } from './util/initSettings';
import { newDefaultSettings } from './util/newDefaultSettings';

export function prepareSearch<M extends IIncludeSeparatorMode>(separators: ISeparators,
	settings: ISplitSettingsInput<M>,
)
{
	const splitSettings: ISplitSettings<M> = {
		...newDefaultSettings() as ISplitSettings<M>,
		...settings,

		separators,

		init()
		{
			return initSettings(this)
		},

		merge<M2 extends IIncludeSeparatorMode = M>(this, settings: ISplitSettingsInput<M2>): ISplitSettings<M2>
		{
			return mergeSettings(this, settings)
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
			return createBracketsMap(this)
		},

		createBracketsSearch()
		{
			return createBracketsSearch(this)
		},

		createSeparatorsSearch()
		{
			return createSeparatorsSearch(this)
		},
	}

	return splitSettings.init()
}
