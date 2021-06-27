import { IIncludeSeparatorMode, IParametersSplitSmartly } from './types';
import splitSmartly from './index';
import { inspect } from 'util';
// @ts-ignore
import { fixtureDemo } from '../test/fixture/demo';

describe(`demos`, () =>
{

	fixtureDemo
		.forEach((argv) => {

			test(inspect(argv), () =>
			{
				let actual = splitSmartly(...argv as any);

				expect(actual).toMatchSnapshot();
			});

		})
	;

})
