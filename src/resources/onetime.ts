import mimicFunction from './mimic-function';

interface OneTimeOptions {
  throw?: boolean;
}

type CustomFunction = Function & {
	displayName?: string;
}

const calledFunctions = new Map<Function, number>();

const onetime = (function_: CustomFunction | undefined, options: OneTimeOptions = {}): CustomFunction => {
	if (typeof function_ !== 'function' || !function_) {
		throw new TypeError('Expected a function');
	}

	let returnValue: any;
	let callCount = 0;
	const functionName = function_.displayName || function_.name || '<anonymous>';

	const onetime = (...arguments_: any[]) => {
		calledFunctions.set(onetime, ++callCount);

		if (callCount === 1) {
			returnValue = function_!.apply(this, arguments_);
			function_ = undefined;
		} else if (options.throw === true) {
			throw new Error(`Function \`${functionName}\` can only be called once`);
		}

		return returnValue;
	};

	// Mimic function is assumed to exist and take Function types
	mimicFunction(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime.callCount = (function_: Function) => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_)!; // Safe to use ! because of the check in the if statement
};

export default onetime;
