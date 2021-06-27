import { IIncludeSeparatorMode, IParametersSplitSmartly } from '../../src/types';

export const fixtureDemo = [

	['one _ two _ "three _ four" _ five _ six', '_'],
	['one _ two _ "three _ four" _ five _ six', '_', { brackets: true }],

	['(one / two) / "three / four" / <<five / six>>', '/', { brackets: [['(', ')'], ['<<', '>>']] }],
	['(one / two) / "three / four" / <<five / six>>', '/', { brackets: { '(': ')', '<<': '>>' } }],
	['(one / two) / "three / four" / <<five / six>>', '/', { brackets: '(), << >>' }],

	['SELECT best FROM life', ['SELECT ', 'FROM ']],

	// 5 - call with regular expression as separator parameter
	['p1: point first p2: point second',  /p\d:/gi],

	['SELECT best FROM life', ['SELECT ', 'FROM '], { includeSeparatorMode: 'SEPARATELY'}],
	['SELECT best FROM life', ['SELECT ', 'FROM '], { includeSeparatorMode: 'RIGHT' }],
	['SELECT best FROM life', ['SELECT ', 'FROM '], { includeSeparatorMode: 'ONLY' }],

	['select best FROM life', ['SELECT ', 'FROM '], { includeSeparatorMode: 'RIGHT' }],
	['select best FROM life', ['SELECT ', 'FROM '], { includeSeparatorMode: 'RIGHT', ignoreCase: false }],

	['Peter loves Mary and Mary loves Johnny and Jonny loves Steve', 'AND', { mentions: ['STEVE', 'PETER'] }],

	['One | Two | Three | Four', '|', { indexes: [1, 3] }],
	['One | Two | Three | Four', '|', { indexes: 2 }],

	['one , two , "three , four" , five , six'],
	[['SELECT ', 'FROM ']],
	[{ includeSeparatorMode: 'RIGHT', ignoreCase: false }],
	[{}],

] as IParametersSplitSmartly<IIncludeSeparatorMode>[]
