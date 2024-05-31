interface MimicFunctionOptions {
  ignoreNonConfigurable?: boolean;
}

function canCopyProperty(
	toDescriptor?: PropertyDescriptor,
	fromDescriptor?: PropertyDescriptor
): boolean {
	return (
		toDescriptor === undefined ||
    toDescriptor.configurable ||
    (toDescriptor.writable === fromDescriptor?.writable &&
      toDescriptor.enumerable === fromDescriptor?.enumerable &&
      toDescriptor.configurable === fromDescriptor?.configurable &&
      (toDescriptor.writable || toDescriptor?.value === fromDescriptor?.value))
	);
}

function copyProperty(
	to: object,
	from: object,
	property: string,
	ignoreNonConfigurable: boolean = false
) {
	// `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
	// `Function#prototype` is non-writable and non-configurable so can never be modified.
	if (property === 'length' || property === 'prototype') return;

	// `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
	if (property === 'arguments' || property === 'caller') return;

	const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
	const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

	if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
		return;
	}

	Object.defineProperty(to, property, fromDescriptor!);
}

function changePrototype(to: object, from: object) {
	const fromPrototype = Object.getPrototypeOf(from);
	if (fromPrototype === Object.getPrototypeOf(to)) return;

	Object.setPrototypeOf(to, fromPrototype);
}

const wrappedToString = (withName: string, fromBody: string) =>
	`/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(
	Function.prototype,
	'toString'
);
const toStringName = Object.getOwnPropertyDescriptor(
	Function.prototype.toString,
	'name'
);

function changeToString(to: Function, from: Function, name: string) {
	const withName = name === '' ? '' : `with ${name.trim()}() `;
	const newToString = wrappedToString.bind(null, withName, from.toString());
	// Ensure `to.toString.toString` is non-enumerable and has the same `same`
	Object.defineProperty(newToString, 'name', toStringName!);
	const { writable, enumerable, configurable } = toStringDescriptor!; // We use ! because we know the descriptor exists from initial check
	Object.defineProperty(to, 'toString', {
		value: newToString,
		writable,
		enumerable,
		configurable,
	});
}

export default function mimicFunction(
	to: Function,
	from: Function,
	options: MimicFunctionOptions = {}
): Function {
	const { name } = to;

	for (const property of Reflect.ownKeys(from)) {
		copyProperty(to, from, property as string, options.ignoreNonConfigurable);
	}

	changePrototype(to, from);
	changeToString(to, from, name);

	return to;
}
