import {
	EnumIncludeSeparatorMode,
	IBracketsInput,
	IGetPipeItemByIncludeSeparatorMode,
	IIncludeSeparatorMode,
	IParametersSplitSmartly,
	IParametersSplitSmartlyReturnQuery,
	IParametersSplitSmartlyReturnResult,
	ISeparators,
	ISplitFunction,
	ISplitSettings,
} from "./types"
import { createSplitFunction } from './createSplitFunction';
import { getSplitSmartlyArgs } from './util/getSplitSmartlyArgs';
import { prepareSearch } from './prepareSearch';

export { SearchResults } from './searchResults';
export { newDefaultSettings, newDefaultBrackets } from './util/newDefaultSettings';

export { createSplitFunction, getSplitSmartlyArgs, prepareSearch }
export { EnumIncludeSeparatorMode }
export type *  from "./types"

export function _splitSmartlyCore<M extends IIncludeSeparatorMode>(separators: ISeparators, settings: ISplitSettings<M>)
{
	const splitSettings = prepareSearch(separators, settings)
	const splitFn = createSplitFunction(splitSettings)

	return {
		splitSettings,
		splitFn,
	}
}

export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnQuery<M>): ISplitFunction<M>
export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnResult<M>): IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[]
export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M>): ISplitFunction<M> | IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[]
{
	let [str, separators, settings] = getSplitSmartlyArgs<M, M>(args as any)

	const {
		splitFn,
	} = _splitSmartlyCore(separators, settings);

	// @ts-ignore
	return str !== null ? splitFn(str) : splitFn
}

export function searchWithin<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M> | [string, IBracketsInput])
{
	if (args.length === 1)
	{
		if (typeof args[0] === 'string')
		{
			args.push(null, {})
		}
		else
		{
			args.unshift(null)
		}
	}

	// @ts-ignore
	if (typeof args[1] !== 'object' || !args[1].brackets)
	{
		// @ts-ignore
		args[1] = { brackets: args[1] }
	}

	args.splice(1, 0, null)

	return splitSmartly(...getSplitSmartlyArgs<M>(args as any, { searchWithin: true })) as string[]
}

//splitSmartly.searchWithin = searchWithin;

export function search(...args: IParametersSplitSmartly<EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY>)
{
	return splitSmartly(...getSplitSmartlyArgs(args, { includeSeparatorMode: EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY }))
}

//splitSmartly.search = search;

/*
export const INCLUDE_SEPARATOR_NONE = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE
export const INCLUDE_SEPARATOR_SEPARATELY = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY
export const INCLUDE_SEPARATOR_LEFT = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT
export const INCLUDE_SEPARATOR_RIGHT = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT
export const INCLUDE_SEPARATOR_ONLY = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY
*
 */

export default splitSmartly
