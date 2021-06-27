import { fixtureDemo } from '../../test/fixture/demo';
import { inspect } from 'util';
import { getSplitSmartlyArgs } from './getSplitSmartlyArgs';

describe(`demos`, () =>
{

	fixtureDemo
		.forEach((argv) => {

			test(inspect(argv), () =>
			{
				let actual = getSplitSmartlyArgs(argv);

				expect(actual).toHaveLength(3);

				expect(actual.filter(v => typeof v !== 'undefined')).toHaveLength(3);

				expect(actual).toMatchSnapshot();
			});

		})
	;

})

describe(`arguments.length`, () =>
{

	test(`> 3`, () =>
	{
		expect(() => getSplitSmartlyArgs([null, null, null, null] as any)).toThrowErrorMatchingSnapshot();
	});

	test(`0`, () =>
	{
		expect(() => getSplitSmartlyArgs([] as any)).toThrowErrorMatchingSnapshot();
	});

})

