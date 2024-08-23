export const TOKENS: Record<string, RegExp> = {
	attribute:
		/\[\s*(?:(?<namespace>\*|[-\w\P{ASCII}]*)\|)?(?<name>[-\w\P{ASCII}]+)\s*(?:(?<operator>\W?=)\s*(?<value>.+?)\s*(\s(?<caseSensitive>[iIsS]))?\s*)?\]/gu,
	id: /#(?<name>[-\w\P{ASCII}]+)/gu,
	class: /\.(?<name>[-\w\P{ASCII}]+)/gu,
	comma: /\s*,\s*/g, // must be before combinator
	combinator: /\s*[\s>+~]\s*/g, // this must be after attribute
	'pseudo-element': /::(?<name>[-\w\P{ASCII}]+)(?:\((?<argument>¶*)\))?/gu, // this must be before pseudo-class
	'pseudo-class': /:(?<name>[-\w\P{ASCII}]+)(?:\((?<argument>¶*)\))?/gu,
	universal: /(?:(?<namespace>\*|[-\w\P{ASCII}]*)\|)?\*/gu,
	type: /(?:(?<namespace>\*|[-\w\P{ASCII}]*)\|)?(?<name>[-\w\P{ASCII}]+)/gu, // this must be last
};

export const TRIM_TOKENS = new Set<string>(['combinator', 'comma']);

export const RECURSIVE_PSEUDO_CLASSES = new Set<string>([
	'not',
	'is',
	'where',
	'has',
	'matches',
	'-moz-any',
	'-webkit-any',
	'nth-child',
	'nth-last-child',
]);

const nthChildRegExp = /(?<index>[\dn+-]+)\s+of\s+(?<subtree>.+)/;
export const RECURSIVE_PSEUDO_CLASSES_ARGS: Record<string, RegExp> = {
	'nth-child': nthChildRegExp,
	'nth-last-child': nthChildRegExp,
};

const getArgumentPatternByType = (type: string) => {
	switch (type) {
		case 'pseudo-element':
		case 'pseudo-class':
			return new RegExp(
				TOKENS[type]!.source.replace(
					'(?<argument>¶*)',
					'(?<argument>.*)'
				),
				'gu'
			);
		default:
			return TOKENS[type];
	}
};

export function gobbleParens(text: string, offset: number): string {
	let nesting = 0;
	let result = '';
	for (; offset < text.length; offset++) {
		const char = text[offset];
		switch (char) {
			case '(':
				++nesting;
				break;
			case ')':
				--nesting;
				break;
		}
		result += char;
		if (nesting === 0) {
			return result;
		}
	}
	return result;
}

export function tokenizeBy(text: string, grammar = TOKENS): Token[] {
	if (!text) {
		return [];
	}

	const tokens: (Token | string)[] = [text];
	for (const [type, pattern] of Object.entries(grammar)) {
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (typeof token !== 'string') {
				continue;
			}

			pattern.lastIndex = 0;
			const match = pattern.exec(token);
			if (!match) {
				continue;
			}

			const from = match.index - 1;
			const args: typeof tokens = [];
			const content = match[0];

			const before = token.slice(0, from + 1);
			if (before) {
				args.push(before);
			}

			args.push({
				...match.groups,
				type,
				content,
			} as unknown as Token);

			const after = token.slice(from + content.length + 1);
			if (after) {
				args.push(after);
			}

			tokens.splice(i, 1, ...args);
		}
	}

	let offset = 0;
	for (const token of tokens) {
		switch (typeof token) {
			case 'string':
				throw new Error(
					`Unexpected sequence ${token} found at index ${offset}`
				);
			case 'object':
				offset += token.content.length;
				token.pos = [offset - token.content.length, offset];
				if (TRIM_TOKENS.has(token.type)) {
					token.content = token.content.trim() || ' ';
				}
				break;
		}
	}

	return tokens as Token[];
}

const STRING_PATTERN = /(['"])([^\\\n]+?)\1/g;
const ESCAPE_PATTERN = /\\./g;
export function tokenize(selector: string, grammar = TOKENS): Token[] {
	// Prevent leading/trailing whitespaces from being interpreted as combinators
	selector = selector.trim();
	if (selector === '') {
		return [];
	}

	type Replacement = { value: string; offset: number };
	const replacements: Replacement[] = [];

	// Replace escapes with placeholders.
	selector = selector.replace(
		ESCAPE_PATTERN,
		(value: string, offset: number) => {
			replacements.push({ value, offset });
			return '\uE000'.repeat(value.length);
		}
	);

	// Replace strings with placeholders.
	selector = selector.replace(
		STRING_PATTERN,
		(value: string, quote: string, content: string, offset: number) => {
			replacements.push({ value, offset });
			return `${quote}${'\uE001'.repeat(content.length)}${quote}`;
		}
	);

	// Replace parentheses with placeholders.
	{
		let pos = 0;
		let offset: number;
		while ((offset = selector.indexOf('(', pos)) > -1) {
			const value = gobbleParens(selector, offset);
			replacements.push({ value, offset });
			selector = `${selector.substring(0, offset)}(${'¶'.repeat(
				value.length - 2
			)})${selector.substring(offset + value.length)}`;
			pos = offset + value.length;
		}
	}

	// Now we have no nested structures and we can parse with regexes
	const tokens = tokenizeBy(selector, grammar);

	// Replace placeholders in reverse order.
	const changedTokens = new Set<Token>();
	for (const replacement of replacements.reverse()) {
		for (const token of tokens) {
			const { offset, value } = replacement;
			if (
				!(
					token.pos[0] <= offset &&
					offset + value.length <= token.pos[1]
				)
			) {
				continue;
			}

			const { content } = token;
			const tokenOffset = offset - token.pos[0];
			token.content =
				content.slice(0, tokenOffset) +
				value +
				content.slice(tokenOffset + value.length);
			if (token.content !== content) {
				changedTokens.add(token);
			}
		}
	}

	// Update changed tokens.
	for (const token of changedTokens) {
		const pattern = getArgumentPatternByType(token.type);
		if (!pattern) {
			throw new Error(`Unknown token type: ${token.type}`);
		}
		pattern.lastIndex = 0;
		const match = pattern.exec(token.content);
		if (!match) {
			throw new Error(
				`Unable to parse content for ${token.type}: ${token.content}`
			);
		}
		Object.assign(token, match.groups);
	}

	return tokens;
}

/**
 *  Convert a flat list of tokens into a tree of complex & compound selectors
 */
function nestTokens(tokens: Token[], { list = true } = {}): AST {
	if (list && tokens.find((t: { type: string }) => t.type === 'comma')) {
		const selectors: AST[] = [];
		const temp: Token[] = [];

		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type === 'comma') {
				if (temp.length === 0) {
					throw new Error('Incorrect comma at ' + i);
				}

				selectors.push(nestTokens(temp, { list: false }));
				temp.length = 0;
			} else {
				temp.push(tokens[i]);
			}
		}

		if (temp.length === 0) {
			throw new Error('Trailing comma');
		} else {
			selectors.push(nestTokens(temp, { list: false }));
		}

		return { type: 'list', list: selectors };
	}

	for (let i = tokens.length - 1; i >= 0; i--) {
		let token = tokens[i];

		if (token.type === 'combinator') {
			let left = tokens.slice(0, i);
			let right = tokens.slice(i + 1);

			return {
				type: 'complex',
				combinator: token.content,
				left: nestTokens(left),
				right: nestTokens(right),
			};
		}
	}

	switch (tokens.length) {
		case 0:
			throw new Error('Could not build AST.');
		case 1:
			// If we're here, there are no combinators, so it's just a list.
			return tokens[0];
		default:
			return {
				type: 'compound',
				list: [...tokens], // clone to avoid pointers messing up the AST
			};
	}
}

/**
 * Traverse an AST in depth-first order
 */
export function* flatten(
	node: AST,
	/**
	 * @internal
	 */
	parent?: AST
): IterableIterator<[Token, AST | undefined]> {
	switch (node.type) {
		case 'list':
			for (let child of node.list) {
				yield* flatten(child, node);
			}
			break;
		case 'complex':
			yield* flatten(node.left, node);
			yield* flatten(node.right, node);
			break;
		case 'compound':
			yield* node.list.map((token): [Token, Compound] => [token, node]);
			break;
		default:
			yield [node, parent];
	}
}

/**
 * Traverse an AST (or part thereof), in depth-first order
 */
export function walk(
	node: AST | undefined,
	visit: (node: AST, parentNode?: AST) => void,
	/**
	 * @internal
	 */
	parent?: AST
) {
	if (!node) {
		return;
	}
	for (const [token, ast] of flatten(node, parent)) {
		visit(token, ast);
	}
}

export interface ParserOptions {
	recursive?: boolean;
	list?: boolean;
}

/**
 * Parse a CSS selector
 *
 * @param selector - The selector to parse
 * @param options.recursive - Whether to parse the arguments of pseudo-classes like :is(), :has() etc. Defaults to true.
 * @param options.list - Whether this can be a selector list (A, B, C etc). Defaults to true.
 */
export function parse(
	selector: string,
	{ recursive = true, list = true }: ParserOptions = {}
): AST | undefined {
	const tokens = tokenize(selector);
	if (!tokens) {
		return;
	}

	const ast = nestTokens(tokens, { list });

	if (!recursive) {
		return ast;
	}

	for (const [token] of flatten(ast)) {
		if (token.type !== 'pseudo-class' || !token.argument) {
			continue;
		}
		if (!RECURSIVE_PSEUDO_CLASSES.has(token.name)) {
			continue;
		}
		let argument = token.argument;
		const childArg = RECURSIVE_PSEUDO_CLASSES_ARGS[token.name];
		if (childArg) {
			const match = childArg.exec(argument);
			if (!match) {
				continue;
			}

			Object.assign(token, match.groups);
			argument = match.groups!['subtree'];
		}
		if (!argument) {
			continue;
		}
		Object.assign(token, {
			subtree: parse(argument, {
				recursive: true,
				list: true,
			}),
		});
	}

	return ast;
}

/**
 * Converts the given list or (sub)tree to a string.
 */
export function stringify(listOrNode: Token[] | AST): string {
	let tokens: Token[];
	if (Array.isArray(listOrNode)) {
		tokens = listOrNode;
	} else {
		tokens = [...flatten(listOrNode)].map(([token]) => token);
	}
	return tokens.map(token => token.content).join('')
}

/**
 * To convert the specificity array to a number
 */
export function specificityToNumber(
	specificity: number[],
	base: number
): number {
	base = base || Math.max(...specificity) + 1;
	return (
		specificity[0] * (base << 1) + specificity[1] * base + specificity[2]
	);
}

/**
 * Calculate specificity of a selector.
 *
 * If the selector is a list, the max specificity is returned.
 */
export function specificity(selector: string | AST): number[] {
	let ast: string | AST | undefined = selector;
	if (typeof ast === 'string') {
		ast = parse(ast, { recursive: true });
	}
	if (!ast) {
		return [];
	}

	if (ast.type === 'list' && 'list' in ast) {
		let base = 10;
		const specificities = ast.list.map((ast) => {
			const sp = specificity(ast);
			base = Math.max(base, ...specificity(ast));
			return sp;
		});
		const numbers = specificities.map((ast) =>
			specificityToNumber(ast, base)
		);
		return specificities[numbers.indexOf(Math.max(...numbers))];
	}

	const ret = [0, 0, 0];
	for (const [token] of flatten(ast)) {
		switch (token.type) {
			case 'id':
				ret[0]++;
				break;
			case 'class':
			case 'attribute':
				ret[1]++;
				break;
			case 'pseudo-element':
			case 'type':
				ret[2]++;
				break;
			case 'pseudo-class':
				if (token.name === 'where') {
					break;
				}
				if (
					!RECURSIVE_PSEUDO_CLASSES.has(token.name) ||
					!token.subtree
				) {
					ret[1]++;
					break;
				}
				const sub = specificity(token.subtree);
				sub.forEach((s, i) => (ret[i] += s));
				// :nth-child() & :nth-last-child() add (0, 1, 0) to the specificity of their most complex selector
				if (
					token.name === 'nth-child' ||
					token.name === 'nth-last-child'
				) {
					ret[1]++;
				}
		}
	}

	return ret;
}

export interface BaseToken {
	type: string;
	content: string;
	pos: [number, number];
}

export interface CommaToken extends BaseToken {
	type: 'comma';
}

export interface CombinatorToken extends BaseToken {
	type: 'combinator';
}

export interface NamedToken extends BaseToken {
	name: string;
}

export interface IdToken extends NamedToken {
	type: 'id';
}

export interface ClassToken extends NamedToken {
	type: 'class';
}

export interface PseudoElementToken extends NamedToken {
	type: 'pseudo-element';
	argument?: string;
}

export interface PseudoClassToken extends NamedToken {
	type: 'pseudo-class';
	argument?: string;
	subtree?: AST;
}

export interface NamespacedToken extends BaseToken {
	namespace?: string;
}

export interface UniversalToken extends NamespacedToken {
	type: 'universal';
}

export interface AttributeToken extends NamespacedToken, NamedToken {
	type: 'attribute';
	operator?: string;
	value?: string;
	caseSensitive?: 'i' | 'I' | 's' | 'S';
}

export interface TypeToken extends NamespacedToken, NamedToken {
	type: 'type';
}

export interface UnknownToken extends BaseToken {
	type: never;
}

export type Token =
	| AttributeToken
	| IdToken
	| ClassToken
	| CommaToken
	| CombinatorToken
	| PseudoElementToken
	| PseudoClassToken
	| UniversalToken
	| TypeToken
	| UnknownToken;

export interface Complex {
	type: 'complex';
	combinator: string;
	right: AST;
	left: AST;
}

export interface Compound {
	type: 'compound';
	list: Token[];
}

export interface List {
	type: 'list';
	list: AST[];
}

export type AST = Complex | Compound | List | Token;
