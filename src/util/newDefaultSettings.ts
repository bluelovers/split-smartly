import {
	EnumIncludeSeparatorMode,
	IBrackets,
	ISplitSettingsInput,
} from '../types';

export function newDefaultBrackets()
{
	return [['(', ')'], ['[', ']'], ['{', '}']] as const satisfies IBrackets
}

export function newDefaultSettings()
{
	return {
		brackets: [] as IBrackets,
		mentions: [] as string[],
		ignoreInsideQuotes: true as const,
		includeSeparatorMode: EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE as const,
		ignoreCase: true as const,
		trimResult: true as const,
		trimSeparators: false as const,
		//check: undefined,
		defaultBrackets: newDefaultBrackets() as IBrackets,
	} satisfies ISplitSettingsInput<EnumIncludeSeparatorMode>
}
