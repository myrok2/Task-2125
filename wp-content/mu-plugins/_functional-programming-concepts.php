<?php
namespace Paradigm\Concepts\Functional;

/**
 * array_filter_either
 *
 * @param $input
 * @param $callback
 *
 * @return array
 */
function array_filter_either($input, $callback) {
	$left = [];
	$right = [];
	foreach($input as $key => $value) {
		$callback($value) ? array_push($right, $value) : array_push($left, $value);
	}
	return ['left' => $left, 'right' => $right];
}

/**
 * Memoize
 *
 * In computing, memoization is an optimization technique used primarily to
 * speed up computer programs by storing the results of expensive function
 * calls and returning the cached result when the same inputs occur again.
 *
 * @param $func
 *
 * @return \Closure
 *
 * @see http://eddmann.com/posts/implementing-and-using-memoization-in-php/
 */

function memoize($func)  {
	return function() use ($func) {
		static $cache = [];
		$args = func_get_args();
		$key = md5(serialize($args));
		if ( ! isset($cache[$key])) {
			$cache[$key] = call_user_func_array($func, $args);
		}
		return $cache[$key];
	};
};

/**
 * Curry N
 *
 * Currying is very similar to Partial Application. The difference is that
 * currying takes a Unary arity, i.e., when using curry you are only passing
 * 1 argument at a time, until the curried function has fullfilled all of its
 * arguments. Very useful when binding/chaining functions in monad identity
 * pattern
 *
 * @param $fun
 * @param $num_of_args
 *
 * @return \Closure
 *
 * @see https://github.com/timoxley/functional-javascript-workshop/blob/master/exercises/currying/solution/solution.js
 * @see https://en.wikipedia.org/wiki/Currying
 */
function curry($fun, $num_of_args) {
	$count = $num_of_args;
	return function ($arg) use($fun, $count) {
		if( $count <= 1) return $fun($arg);
		return curry( partial($fun, $arg), --$count);
	};
}

/**
 * Javascript reduce based function
 *
 *
 * @param $array
 * @param $callback
 * @param null $inital
 *
 * @return null
 *
 * @todo need to 'trigger_error' @see http://php.net/manual/en/function.trigger-error.php
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 */
function reduce($array, $callback, $inital = null) {

	$k          = 0;
	$len        = count( $array );
	$array_keys = array_keys( $array );
	$value      = null;

	if ( is_callable( $callback ) ) {

		if ( ! is_null( $inital ) ) {
			$value = $inital;
		}

		for ( ; $k < $len; $k ++ ) {
			$value = $callback( $value, $array[ $array_keys[ $k ] ], $array_keys[ $k ], $array );
		}

		return $value;
	}
}

/**
 * Partial Function Application
 *
 * Fixing a number of arguments to a function, producing another function of
 * smaller arity.
 *
 * @param $fun string or closure Function
 * @param $args1 mixed
 *
 * @return \Closure
 *
 * @see https://en.wikipedia.org/wiki/Partial_application
 * @see https://en.wikipedia.org/wiki/Arity
 */
function partial($fun, $args1) {
	$fun_args = func_get_args();
	$args = array_slice($fun_args, 1);
	return function() use ($fun, $args){
		$full_args = array_merge($args, func_get_args());
		return call_user_func_array($fun, $full_args);
	};
}

/**
 * Build more complex functions
 *
 * This can be seen as function chaining.
 * compose will allow you to build more
 * complex functions using simple functions.
 *
 * @param $f string or closure Pass in a functions string, or closure
 *
 * The function passed in through the param $f can take only the result
 * of the $g function, so only one parameter
 *
 * @param $g string or clouser Pass in a functions string, or closure
 *
 * The function passed in through the param $g can take as
 * many allowed parameters as the function passed in.
 *
 * @return \Closure
 *
 * @see https://en.wikipedia.org/wiki/Function_composition_(computer_science)
 */

function compose($f, $g) {
	return function() use($f,$g) {
		$x = func_get_args();
		
		if($f){
		    return call_user_func($f, call_user_func_array($g,$x) );
		}else{
		    return call_user_func_array($g,$x);
		}
		
	};
}

function compose_new($f, $g){
    	return function() use($f,$g) {
		$x = func_get_args();
		
		return call_user_func(call_user_func_array($g,$x) );
	};
}

/**
 * Flatten arrays into a single array
 *
 * Stolen from:
 * https://github.com/ihor/Nspl#flattensequence-depth--null
 */

function flatten($sequence, $depth = null){
	if (null === $depth) {
		$result = array();
		array_walk_recursive($sequence, function($item, $key) use (&$result) {
			$result[] = $item;
		});
		return $result;
	}
	$result = array();
	foreach ($sequence as $value) {
		$result[] = $value;
	}
	return $result;
}

/**
 * Class Monad
 *
 * Currently only used to chain functions, while passing it's current value
 * to the chained function.
 *
 * @package Paradigm\Concepts\Functional
 *
 * @see http://blog.ircmaxell.com/2013/07/taking-monads-to-oop-php.html
 * @see https://github.com/ircmaxell/monad-php
 */
abstract class Monad {
	protected $value;
	public function __construct($value) {
		$this->value = $value;
	}
	public static function unit($value) {
		if ($value instanceof static) {
			return $value;
		}
		return new static($value);
	}
	public function bind($function, array $args = array()) {
		return $this::unit($this->runCallback($function, $this->value, $args));
	}
	public function extract() {
		if ($this->value instanceof self) {
			return $this->value->extract();
		}
		return $this->value;
	}
	protected function runCallback($function, $value, array $args = array()) {
		if ($value instanceof self) {
			return $value->bind($function, $args);
		}
		array_unshift($args, $value);
		return call_user_func_array($function, $args);
	}
}

/**
 * Class Identity
 *
 *
 * @package Paradigm\Concepts\Functional
 */
class Identity extends Monad {
	const unit = 'Paradigm\Concepts\Functional\Identity::unit';
}

/**
 * Class Maybe
 * @package Paradigm\Concepts\Functional
 */
class Maybe extends Monad {

	const unit = 'Paradigm\Concepts\Functional\Maybe::unit';

	public function bind($function, array $args = []){
		if( ! is_null($this->value) ){
			return parent::bind($function, $args);
		}
		return $this::unit(null);
	}

}

/**
 * Class MaybeEmpty
 * @package Paradigm\Concepts\Functional
 */
class MaybeEmpty extends Monad {

	const unit = 'Paradigm\Concepts\Functional\MaybeEmpty::unit';

	public function bind($function, array $args = []) {
		if (!empty($this->value)) {
			return parent::bind($function, $args);
		}
		return $this::unit(null);
	}

}

/**
 * Class ListMonad
 * @package Paradigm\Concepts\Functional
 */
class ListMonad extends Monad {
	const unit = 'Paradigm\Concepts\Functional\ListMonad::unit';
	public function __construct($value) {
		if (!is_array($value) && !$value instanceof \Traversable) {
			throw new \InvalidArgumentException('Must be traversable');
		}
		return parent::__construct($value);
	}
	public function bind($function, array $args = array()) {
		$result = array();
		foreach ($this->value as $value) {
			$result[] = $this->runCallback($function, $value, $args);
		}
		return $this::unit($result);
	}
	public function extract() {
		$ret = array();
		foreach ($this->value as $value) {
			if ($value instanceof Monad) {
				$ret[] = $value->extract();
			} else {
				$ret[] = $value;
			}
		}
		return $ret;
	}
}
