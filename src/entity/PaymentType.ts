import { registerEnumType } from 'type-graphql';

enum PaymentType {
	Cash = 'Cash',
	Paypal = 'PayPal',
	Venmo = 'Venmo',
	Zelle = 'Zelle',
}

registerEnumType(PaymentType, {
	description: 'The chosen payment type for the user',
	name: 'PaymentType',
});

export default PaymentType;
