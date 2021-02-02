import { AuthChecker } from 'type-graphql';

import { TCustomContext /* , TUserType */ } from '../../api/graphql';

export const customAuthChecker: AuthChecker<TCustomContext> = () =>
	// { context },
	// roles,
	// ) =>
	{
		// const groups = context.claims?.['cognito:groups'] || [];
		// const isAuthed = roles.some((role): boolean =>
		// 	groups.includes(role as TUserType),
		// );

		// return isAuthed;
		return true;
	};
