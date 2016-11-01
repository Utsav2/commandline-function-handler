'use strict';
const assert = require('assert');
const winston = require('winston');

const default_handler_fn = {
  transformFn: () => {
    return Array.prototype.slice.call(arguments);
  },
  validateFn: () => {},
}

class Parser {
  constructor(args) {
    assert(args.emptyInputFn instanceof Function, 'emptyInputFn is not a function');
    assert(args.notFoundFn instanceof Function, 'notFoundFn is not a function');
    this.defaultFns = args;
    this.handlers = {};
  }

  register(keyword, args) {
    assert(typeof keyword === 'string');
    assert(args.actionFn instanceof Function, 'actionFn is not a function');
    assert((args.transformFn instanceof Function) || !args.transformFn, 'transformFn is not a function');
    assert((args.validateFn instanceof Function) || !args.validateFn, 'validateFn is not a function');
    this.handlers[keyword] = Object.assign({}, default_handler_fn, args);
  }
  
  exec(args) {
    if (!args || args.length == 0) {
      winston.silly('No args given');
      return this.defaultFns.emptyInputFn();
    }

    if (!(args[0] in this.handlers)) {
      winston.silly(`${args[0]} is not in handlers`);
      return this.defaultFns.notFoundFn(args);
    }

    const fns = this.handlers[args[0]];

    const isInvalid = fns.validateFn(args);
    if (isInvalid) {
      winston.silly(`${isInvalid}`);
      return isInvalid;
    }

    winston.silly(`executing ${args}`);
    return fns.actionFn(...(fns.transformFn(args) || []));
  }
}

module.exports.Parser = Parser;
module.exports.exec = function(parser) {
  parser.exec(process.argv.slice(2));
}
