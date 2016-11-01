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
    const p = new parser.Parser({
      emptyInputFn: emptySpy,
      notFoundFn: noop
    });
    p.exec([]);
    expect(emptySpy).to.have.been.called();
  });

  it('should call empty fn on falsy input', function() {
    const emptySpy = chai.spy();
    const p = new parser.Parser({
      emptyInputFn: emptySpy,
      notFoundFn: noop
    });
    p.exec();
    expect(emptySpy).to.have.been.called();
  });

  it('should not call empty fn in any other scenario', function() {
    const emptySpy = chai.spy();
    const p = new parser.Parser({
      emptyInputFn: emptySpy,
      notFoundFn: noop
    });
    p.exec('hi');
    expect(emptySpy).to.not.have.been.called();
  });

  it('should call notFoundFn with no handlers registered', function() {
    const notFoundFn = chai.spy();
    const p = new parser.Parser({
      emptyInputFn: noop,
      notFoundFn: notFoundFn 
    });
    p.exec('hi');
    expect(notFoundFn).to.have.been.called.with('hi');
  });

  it('should fail if we try registering non functions', function() {
    expect(() => { 
      new parser.Parser({
        emptyInputFn: 'hi',
        notFoundFn: noop
      })
    }).to.throw();
  });

  it('should fail if we try registering non functions', function() {
    expect(() => { 
      new parser.Parser({
        emptyInputFn: noop,
        notFoundFn: 'hi' 
      })
    }).to.throw();
  });

  it('should call action fn on valid keyword', function() {
    const p = new parser.Parser({
      emptyInputFn: noop,
      notFoundFn: noop
    });
    var done = false;
    p.register('hi', {
      actionFn: () => { done = true; },
      transformFn: noop,
      validateFn: noop
    });
    p.exec(['hi']);
    expect(done).to.be.equal(true);
  });

  it('should return validation error and not call actionFn on error', function() {
    const p = new parser.Parser({
      emptyInputFn: noop,
      notFoundFn: noop
    });
    var done = false;
    const err = 'sup';
    p.register('hi', {
      actionFn: () => { done = true; },
      transformFn: noop,
      validateFn: () => { return err }
    });
    expect(p.exec(['hi'])).to.be.equal(err);
    expect(done).to.be.equal(false);
  });

  it('should call transformFn to transform a function', function() {
    const p = new parser.Parser({
      emptyInputFn: noop,
      notFoundFn: noop
    });

    var done = false;
    const outerArgs = ['hi', 'f', 's'];

    p.register('hi', {
      actionFn: (f, s) => { 
        done = true;
        expect(f).to.be.equal('f');
        expect(s).to.be.equal('s');
      },
      transformFn: (args) => {
        return [args[1], args[2]];
      },
      validateFn: noop
    });
    p.exec(outerArgs);
    expect(done).to.be.equal(true);
  });
});
