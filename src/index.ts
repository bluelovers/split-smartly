import {
	EnumIncludeSeparatorMode,
	IBracketsInput,
	IGetPipeItemByIncludeSeparatorMode,
	IIncludeSeparatorMode,
	IParametersSplitSmartly,
	IParametersSplitSmartlyReturnQuery,
	IParametersSplitSmartlyReturnResult,
	ISplitFunction,
} from "./types"
import { getSplitSmartlyArgs } from './util/getSplitSmartlyArgs';
import { prepareSearch } from './util/prepareSearch';
import { SearchResults } from './searchResults';
import { createSplitFunction } from './createSplitFunction';

export { SearchResults, createSplitFunction }
export { EnumIncludeSeparatorMode } from "./types"

export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnQuery<M>): ISplitFunction<M>
export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartlyReturnResult<M>): IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[]
export function splitSmartly<M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M>): ISplitFunction<M> | IGetPipeItemByIncludeSeparatorMode<M> | IGetPipeItemByIncludeSeparatorMode<M>[]
{
	let [string, separators, settings] = getSplitSmartlyArgs(args as any)

	const splitSettings = prepareSearch(separators, settings)
	const splitFn = createSplitFunction(splitSettings)

	// @ts-ignore
	return string !== null ? splitFn(string) : splitFn
}

splitSmartly.searchWithin = <M extends IIncludeSeparatorMode>(...args: IParametersSplitSmartly<M> | [string, IBracketsInput]) =>
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

splitSmartly.search = (...args: IParametersSplitSmartly<EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY>) =>
{
	return splitSmartly(...getSplitSmartlyArgs(args, { includeSeparatorMode: EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY }))
}

/*
export const INCLUDE_SEPARATOR_NONE = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE
export const INCLUDE_SEPARATOR_SEPARATELY = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_SEPARATELY
export const INCLUDE_SEPARATOR_LEFT = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_LEFT
export const INCLUDE_SEPARATOR_RIGHT = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_RIGHT
export const INCLUDE_SEPARATOR_ONLY = EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_ONLY
*
 */

export default splitSmartly
