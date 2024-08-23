import * as parsel from './dist/parsel.js';
import testCases from './test.json' assert { type: "json" };
import {writeFileSync} from 'node:fs';

for (const testCase of testCases) {
	switch (testCase.type) {
		case 'tokenize':
            testCase.expected = parsel.tokenize(testCase.input);
			break;
		case 'parse':
            testCase.expected = parsel.parse(testCase.input);
			break;
		case 'stringify':
            testCase.expected = parsel.stringify(parsel.tokenize(testCase.input));
			break;
		case 'specificity':
            testCase.expected = parsel.specificity(testCase.input);
			break;
	}
}

writeFileSync('./test.json', JSON.stringify(testCases, null, '\t'));