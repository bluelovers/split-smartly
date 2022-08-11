import { ITextNodeOrText } from './types';

export const once = <T extends (...args: any[]) => any>(fn: T) =>
{
	let value: any, hasValue: any
	return function (...args)
	{
		if (!hasValue)
		{
			value = fn(...args)
			hasValue = true
		}
		return value
	} as T
}
export const isEmpty = <T extends ITextNodeOrText | any[] | Record<any, any>>(value: T) =>
{
	if (!value) return true

	if (Array.isArray(value))
	{
		if (value.length === 0) return true
	}

	else if (typeof value === 'object')
	{
		if (Object.keys(value).length === 0) return true
	}

	return false
}
export const first = <T>(value: T[]): T => value[0]
export const last = <T>(value: T[]): T => value[value.length - 1]
