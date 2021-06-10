module.exports = {
	root: true,
	env: {
		es2021: true,
		jest: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
		},
		warnOnUnsupportedTypeScriptVersion: false,
		ecmaVersion: 7,
		projects: ['./tsconfig.json', './azure/tsconfig.json'],
		sourceType: 'module',
	},
	plugins: ['graphql', 'import', 'prettierx', '@typescript-eslint'],
	settings: {
		prettierx: {
			usePrettierrc: false,
		},
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/errors',
		'plugin:import/typescript',
		'plugin:import/warnings',
		'plugin:prettierx/standardize',
		'plugin:you-dont-need-momentjs/recommended',
	],
	rules: {
		'prettierx/options': [
			2,
			{
				alignObjectProperties: false,
				endOfLine: 'auto',
				semi: true,
				singleQuote: true,
				spaceBeforeFunctionParen: true,
				trailingComma: 'all',
				useTabs: true,
			},
		],
		'linebreak-style': 'off',
		'no-console': 'off',
		'no-constant-condition': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				varsIgnorePattern: 'UU',
				args: 'none',
			},
		],
		quotes: 'off',
		'import/named': 2,
		'import/order': [
			'error',
			{
				alphabetize: {
					caseInsensitive: true,
					order: 'asc',
				},
				'newlines-between': 'always',
			},
		],
		'one-var': ['error', 'never'],
		'no-var': 'error',
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: '*',
				next: 'return',
			},
			{
				blankLine: 'always',
				prev: ['const', 'let', 'var'],
				next: '*',
			},
			{
				blankLine: 'any',
				prev: ['const', 'let', 'var'],
				next: ['const', 'let', 'var'],
			},
			{
				blankLine: 'always',
				prev: ['block', 'block-like', 'if'],
				next: '*',
			},
			{
				blankLine: 'always',
				prev: '*',
				next: ['block', 'block-like', 'if'],
			},
			{
				blankLine: 'any',
				prev: 'export',
				next: '*',
			},
			{
				blankLine: 'any',
				prev: '*',
				next: 'export',
			},
		],
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/prefer-interface': 'off',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/ban-ts-comment': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'error',
		'prefer-template': 'error',
	},
};
