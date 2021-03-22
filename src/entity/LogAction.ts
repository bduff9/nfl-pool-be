import { registerEnumType } from 'type-graphql';

enum LogAction {
	Error404 = '404',
	AuthenticationError = 'AUTH_ERROR',
	CreatedAccount = 'CREATE_ACCOUNT',
	LinkedAccount = 'LINK_ACCOUNT',
	Login = 'LOGIN',
	Logout = 'LOGOUT',
	Message = 'MESSAGE',
	Paid = 'PAID',
	Register = 'REGISTER',
	Slack = 'SLACK',
	SubmitPicks = 'SUBMIT_PICKS',
	SurvivorPick = 'SURVIVOR_PICK',
}

registerEnumType(LogAction, {
	description: 'The logged action type',
	name: 'LogAction',
});

export default LogAction;
