import { customAuthChecker } from '../../src/util/auth';
import { TCustomContext } from '../../src/util/types';

describe('customAuthChecker', () => {
	it('allows read access to all', () => {
		const context = { user: {} } as TCustomContext;
		const result = customAuthChecker(
			{ args: {}, context, info: {} as any, root: {} },
			['anonymous'],
		);

		expect(result).toBe(true);
	});

	it('allows editor access to signed in users', () => {
		const context = ({ user: { userID: 1 } } as unknown) as TCustomContext;
		const result = customAuthChecker(
			{ args: {}, context, info: {} as any, root: {} },
			['user'],
		);

		expect(result).toBe(true);
	});

	it('denies editor access to unknown users', () => {
		const context = { user: {} } as TCustomContext;
		const result = customAuthChecker(
			{ args: {}, context, info: {} as any, root: {} },
			['user'],
		);

		expect(result).toBe(false);
	});

	it('allows access to registered users', () => {
		const context = ({
			user: { userID: 1, userDoneRegistering: true },
		} as unknown) as TCustomContext;
		const result = customAuthChecker(
			{ args: {}, context, info: {} as any, root: {} },
			['registered'],
		);

		expect(result).toBe(true);
	});

	it('allows access to survivor players', () => {
		const context = ({
			user: { userID: 1, userPlaysSurvivor: true },
		} as unknown) as TCustomContext;
		const result = customAuthChecker(
			{ args: {}, context, info: {} as any, root: {} },
			['survivorPlayer'],
		);

		expect(result).toBe(true);
	});

	it('allows admin access to signed in users', () => {
		const context = ({
			user: { userID: 1, userIsAdmin: true },
		} as unknown) as TCustomContext;
		const result = customAuthChecker(
			{ args: {}, context, info: {} as any, root: {} },
			['admin'],
		);

		expect(result).toBe(true);
	});
});
