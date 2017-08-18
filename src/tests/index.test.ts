import * as proxy from 'proxyquire';
import * as sinon from 'sinon';

const state = {
  init: sinon.stub()
};

const getAccountState = sinon.stub().callsFake(() => state);
const initState = proxy('../index', {
  './configs/state': {
    getAccountState
  }
}).initState;

describe ('Index', function() {
  it('initState: creates state with user and profile model', function() {
    const createUser = {};
    const profileType = {};

    initState(createUser, profileType);

    getAccountState.should.have.been.calledWith({cache: undefined, createUser, profileType})
    state.init.should.have.been.called;
  });
});
