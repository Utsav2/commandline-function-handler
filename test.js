const chai = require('chai');
const spies = require('chai-spies');
const expect = chai.expect;
const should = chai.should();
const parser = require('./index.js');
const noop = () => {}
chai.use(spies);

describe('Parser', function() {

  it('should call empty fn on empty input', function() {
    const emptySpy = chai.spy();
    const p = new parser.Parser(emptySpy, noop);
    p.exec([]);
    expect(emptySpy).to.have.been.called();
  });

  it('should call empty fn on falsy input', function() {
    const emptySpy = chai.spy();
    const p = new parser.Parser(emptySpy, noop);
    p.exec();
    expect(emptySpy).to.have.been.called();
  });

  it('should not call empty fn in any other scenario', function() {
    const emptySpy = chai.spy();
    const p = new parser.Parser(emptySpy, noop);
    p.exec('hi');
    expect(emptySpy).to.not.have.been.called();
  });

  it('should call notFoundFn with no handlers registered', function() {
    const notFoundFn = chai.spy();
    const p = new parser.Parser(noop, notFoundFn);
    p.exec('hi');
    expect(notFoundFn).to.have.been.called.with('hi');
  });

  it('should fail if we try registering non functions', function() {
    expect(() => { new parser.Parser('hi', noop) }).to.throw();
  });

  it('should fail if we try registering non functions', function() {
    expect(() => { new parser.Parser(noop, 'hi') }).to.throw();
  });

  it('should call action fn on valid keyword', function() {
    const p = new parser.Parser(noop, noop);
    var done = false;
    p.register('hi', () => { done = true; }, noop, noop);
    p.exec(['hi']);
    expect(done).to.be.equal(true);
  });

  it('should return validation error and not call actionFn on error', function() {
    const p = new parser.Parser(noop, noop);
    var done = false;
    const err = 'sup';
    p.register('hi', () => { done = true; }, noop, () => { return err });
    expect(p.exec(['hi'])).to.be.equal(err);
    expect(done).to.be.equal(false);
  });

  it('should call transformFn to transform a function', function() {
    const p = new parser.Parser(noop, noop);
    var done = false;
    const outerArgs = ['hi', 'f', 's'];

    p.register('hi', (first, second) => {
      done = true;
      expect(first).to.be.equal('f');
      expect(second).to.be.equal('s');
    }, (args) => {
      return [args[1], args[2]];
    }, noop);

    p.exec(outerArgs);
  });
});
