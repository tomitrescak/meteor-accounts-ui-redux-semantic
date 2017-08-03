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
    const userType = {};
    const profileType = {};

    initState(userType, profileType);

    getAccountState.should.have.been.calledWith({userType, profileType})
    state.init.should.have.been.called;
  });
});
