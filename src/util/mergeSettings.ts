import { IIncludeSeparatorMode, ISplitSettings, ISplitSettingsInput } from '../types';

export function mergeSettings<M extends IIncludeSeparatorMode, M2 extends IIncludeSeparatorMode = M>(_this: ISplitSettingsInput<M>, settings: ISplitSettingsInput<M2>): ISplitSettings<M2>
{
	// @ts-ignore
	if (!settings) return _this

	// @ts-ignore
	settings = { ..._this, ...settings }
	if (['brackets', 'mentions'].some(prop => prop in settings))
	{
		settings.init()
	}

	// @ts-ignore
	return settings
}
