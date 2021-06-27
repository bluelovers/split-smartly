import { ITSValueOrArray } from 'ts-type/lib/type/base';
import { isEmpty } from '../util';

export function buildIndexesObject(indexes: ITSValueOrArray<number>)
{
	const indexesArr = [indexes].flat().filter(Boolean)

	return !isEmpty(indexesArr) && {
		values: new Set(indexesArr),
		max: Math.max(...indexesArr),
		count: 0,

		hasIndex()
		{
			return this.max === -Infinity || this.values.has(this.count++)
		},

		isOverMax()
		{
			return this.max !== -Infinity && this.count > this.max
		},
	}
}
