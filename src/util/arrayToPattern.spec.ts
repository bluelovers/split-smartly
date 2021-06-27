import { inspect } from 'util';
import { arrayToPattern } from './arrayToPattern';
import { ITSValueOrArray } from 'ts-type/lib/type/base';

describe(`describe`, () =>
{
	([

		'_',

		'/',
		/p\d:/gi,
		['SELECT ', 'FROM '],

		'AND',

		'|',

	] as (ITSValueOrArray<string | RegExp>)[])
		.forEach((argv) =>
		{

			test(inspect(argv), () =>
			{
				let actual = arrayToPattern([argv].flat() as string[]);

				expect(actual).toMatchSnapshot();
			});

		})
	;

	test('||', () =>
	{
		let actual = arrayToPattern([/\|\|/g]);
		let actual2 = arrayToPattern(['||']);

		expect(actual).toStrictEqual(actual2);
	});

})
