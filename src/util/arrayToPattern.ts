
let screenedSymbols: Set<string>;

export function arrayToPattern(arr: (RegExp | string)[])
{
	screenedSymbols ??= new Set('.{}[]^()+*?\\/$|'.split(''))

	return arr
		.map(s => {

			if (s instanceof RegExp)
			{
				return s.source;
			}

			return s.split('').map(s => screenedSymbols.has(s) ? '\\' + s : s).join('')
		})
		.join('|')
}
