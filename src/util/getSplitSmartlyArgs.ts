import {
	IIncludeSeparatorMode,
	IParametersSplitSmartly,
	ISeparators,
	ISplitSettings,
	ISplitSettingsInput,
} from '../types';
import { first } from '../util';

export const getSplitSmartlyArgs = <M extends IIncludeSeparatorMode, M2 extends IIncludeSeparatorMode = M>(args: IParametersSplitSmartly<M>,
	extraSettings?: ISplitSettingsInput<M2>,
): [string, ISeparators, ISplitSettings<M2>] =>
{

	if (!args?.length)
	{
		throw new RangeError('empty arguments')
	}
	else if (args.length === 3)
	{
		if (!extraSettings) return args as any
	}
	else if (args.length === 1)
	{
		const arg = first(args)
		if (typeof arg === 'string')
		{
			// @ts-ignore
			args.push(',', {})
		}
		else if (Array.isArray(arg))
		{
			args.unshift(null)
			args.push({})
		}
		else if (typeof arg === 'object')
		{
			// @ts-ignore
			args.unshift(null, ',')
		}
	}
	else if (args.length === 2)
	{
		if (typeof args[0] === 'string' && args[1] instanceof RegExp)
		{
			args.push({})
		}
		else if (typeof args[1] === 'string' || Array.isArray(args[1]))
		{
			args.push({})
		}
		else
		{
			args.unshift(null)
		}
	}
	else if (args.length > 3)
	{
		throw new RangeError('Too much arguments passed to splitSmartly function!!!')
	}

	// @ts-ignore
	if (extraSettings) args[2] = { ...args[2], ...extraSettings }

	return args as any
}
