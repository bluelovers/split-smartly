import splitSmartly from '../src/index';
import { EnumIncludeSeparatorMode } from '../src/types';

const reDoubleVerticalBar = /\s*\|\|\s*/g;

describe(`forever`, () =>
{
	jest.setTimeout(3000);

	test(`*`, () =>
	{
		const splitDoubleVerticalBar = splitSmartly(reDoubleVerticalBar, {
			includeSeparatorMode: EnumIncludeSeparatorMode.INCLUDE_SEPARATOR_NONE,
			brackets: true,
		}) as (str: string) => string[];

		let actual = splitDoubleVerticalBar('*');
		let expected = ['*'];

		expect(actual).toStrictEqual(expected);

	});

})
