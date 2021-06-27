import { IIncludeSeparatorMode, IParametersSplitSmartly } from '../types';
import { inspect } from 'util';
import splitSmartly from '../index';
import { arrayToPattern } from './arrayToPattern';

describe(`describe`, () =>
{
	([

		'_',

		'/',
		/p\d:/gi,
		['SELECT ', 'FROM '],

		'AND',

		'|',

	] as (string | RegExp | (string | RegExp)[])[])
		.forEach((argv) =>
		{

			test(inspect(argv), () =>
			{
				let actual = arrayToPattern([argv].flat() as string[]);

				expect(actual).toMatchSnapshot();
			});

		})
	;

})
