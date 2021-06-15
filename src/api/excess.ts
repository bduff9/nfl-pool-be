/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
import { either, Either, isRight, left, right, Right } from 'fp-ts/lib/Either';
import * as t from 'io-ts';

const getIsCodec = <T extends t.Any>(tag: string) => (codec: t.Any): codec is T =>
	(codec as any)._tag === tag;
const isInterfaceCodec = getIsCodec<t.InterfaceType<t.Props>>('InterfaceType');
const isPartialCodec = getIsCodec<t.PartialType<t.Props>>('PartialType');

const getProps = (codec: t.HasProps): t.Props => {
	switch (codec._tag) {
		case 'RefinementType':
		case 'ReadonlyType':
			return getProps(codec.type);
		case 'InterfaceType':
		case 'StrictType':
		case 'PartialType':
			return codec.props;
		case 'IntersectionType':
			return codec.types.reduce<t.Props>(
				(props, type) => Object.assign(props, getProps(type)),
				{},
			);
	}
};

const getNameFromProps = (props: t.Props): string =>
	Object.keys(props)
		.map(k => `${k}: ${props[k].name}`)
		.join(', ');

const getPartialTypeName = (inner: string): string => `Partial<${inner}>`;

const getExcessTypeName = (codec: t.Any): string => {
	if (isInterfaceCodec(codec)) {
		return `{| ${getNameFromProps(codec.props)} |}`;
	}

	if (isPartialCodec(codec)) {
		return getPartialTypeName(`{| ${getNameFromProps(codec.props)} |}`);
	}

	return `Excess<${codec.name}>`;
};

const stripKeys = <T = any>(o: T, props: t.Props): Either<Array<string>, T> => {
	const keys = Object.getOwnPropertyNames(o);
	const propsKeys = Object.getOwnPropertyNames(props);

	propsKeys.forEach(pk => {
		const index = keys.indexOf(pk);

		if (index !== -1) {
			keys.splice(index, 1);
		}
	});

	return keys.length ? left(keys) : right(o);
};

export const excess = <C extends t.HasProps>(
	codec: C,
	name: string = getExcessTypeName(codec),
): ExcessType<C> => {
	const props: t.Props = getProps(codec);

	return new ExcessType<C>(
		name,
		(u): u is C => isRight(stripKeys(u, props)) && codec.is(u),
		(u, c) =>
			either.chain(t.UnknownRecord.validate(u, c), () =>
				either.chain(codec.validate(u, c), a =>
					either.mapLeft(stripKeys<C>(a, props), keys =>
						keys.map(k => ({
							value: a[k],
							context: c,
							message: `excess key "${k}" found`,
						})),
					),
				),
			),
		a => codec.encode((stripKeys(a, props) as Right<any>).right),
		codec,
	);
};

class ExcessType<C extends t.Any, A = C['_A'], O = A, I = unknown> extends t.Type<A, O, I> {
	public readonly _tag: 'ExcessType' = 'ExcessType';
	public constructor (
		name: string,
		is: ExcessType<C, A, O, I>['is'],
		validate: ExcessType<C, A, O, I>['validate'],
		encode: ExcessType<C, A, O, I>['encode'],
		public readonly type: C,
	) {
		super(name, is, validate, encode);
	}
}
