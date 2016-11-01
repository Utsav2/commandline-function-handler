'use strict';
const assert = require('assert');
const winston = require('winston');

class Parser {
  constructor(emptyInputFn, notFoundFn) {
    assert(emptyInputFn instanceof Function);
    assert(notFoundFn instanceof Function);
    this.handlers = {}
    this.emptyInputFn = emptyInputFn;
    this.notFoundFn = notFoundFn;
  }

  register(keyword, actionFn, transformFn, validateFn) {
    assert(typeof keyword === 'string');
    assert(actionFn instanceof Function);
    assert(transformFn instanceof Function);
    assert((validateFn instanceof Function) || !validateFn);

    this.handlers[keyword] = [actionFn, transformFn, validateFn];
  }
  
  exec(args) {
    if (!args || args.length == 0) {
      winston.silly('No args given');
      return this.emptyInputFn();
    }
    if (!(args[0] in this.handlers)) {
      winston.silly(`${args[0]} is not in handlers`);
      return this.notFoundFn(args);
    }

    const handlerFns = this.handlers[args[0]];
    const actionFn = handlerFns[0];
    const transformFn = handlerFns[1];
    const validateFn = handlerFns[2];

    if (validateFn) {
      const isInvalid = validateFn(args);
      if (isInvalid) {
        winston.silly(`${isInvalid}`);
        return isInvalid;
      }
    }

    winston.silly(`executing ${args}`);
    return actionFn(...(transformFn(args) || []));
  }
}

module.exports.Parser = Parser;
module.exports.exec = function(parser) {
  parser.exec(process.argv.slice(2));
}
