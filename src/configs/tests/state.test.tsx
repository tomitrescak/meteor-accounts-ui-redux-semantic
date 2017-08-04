import ApolloClient from 'apollo-client';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';
import { getAccountState, State } from '../state';
import * as sinon from 'Sinon';
import * as chai from 'chai';

import { createApp } from 'apollo-mantra';

import authSchema from 'apollo-module-authentication/dist/schema';
import { addModules } from 'apollo-modules';
import { User } from '../user_model';
import { create } from '../../components/tests/test_data';
import { registerProfileModel } from '../../tests/tests_shared';

// compile module
const modules = addModules([authSchema as any]);
const should = chai.should();

// add date scalar
const addedSchema = `
  scalar Date
  type Profile {
    name: String
    organisation: String
  }

  input ProfileInput {
    name: String
    organisation: String
  }
`;
let typeDefs = addedSchema + modules.schema; // .replace(/Date/g, 'Int');

const resolvers = {
  Date: {
    __parseValue(value: string) {
      return value != null ? new Date(value) : undefined;
    },
    __parseLiteral(ast: any) {
      return parseInt(ast.value, 10);
    },
    __serialize(value: Date) {
      return value instanceof Date ? value.getTime() : value;
    }
  }
};

// define schema
const schema = makeExecutableSchema({ typeDefs, resolvers });
const defaultUser = create.user();
const defaultToken = {
  expires: new Date(),
  user: {},
  hashedToken: '#hash'
};

function initApollo({ token = defaultToken, user = create.user(), mutation = {} } = {}) {
  // define mocks
  const mocks = {
    Token: () => token,
    User: () => user,
    Mutation: () => mutation
  };

  addMockFunctionsToSchema({ schema, mocks });
  const mockNetworkInterface = mockNetworkInterfaceWithSchema({ schema });
  const client = new ApolloClient({
    networkInterface: mockNetworkInterface
  });

  createApp({
    apolloClient: client
  });
}

describe('State', () => {
  let state: State<User>;

  before(function() {
    global.localStorage = {
      setItem(key: string, value: string) {
        global.localStorage[key] = value;
      },
      getItem(key: string) {
        return global.localStorage[key];
      },
      removeItem(key: string) {
        delete global.localStorage[key];
      }
    };
  });

  beforeEach(function() {
    state = getAccountState({ cache: false, profileType: registerProfileModel });
  });

  describe('init', function() {
    it('reads url and put component in required state', function() {
      const clock = sinon.useFakeTimers();
      const coldStartStub = sinon.stub(state, 'coldStart');

      let location = {
        search: ''
      };
      const locationStub = sinon.stub(global, 'location').get(() => location);
      state.setProfileData(create.testProfileData);
      // reset password
      global.location.search = 'http://test?resetPassword=pwd';

      state.init();

      state.token.should.equal('pwd');
      state.view.should.equal('resetPassword');

      // verify email
      global.location.search = 'http://test?verifyEmail=verify';

      state.init();

      state.view.should.equal('signIn');
      clock.tick(2);

      coldStartStub.should.have.been.calledWith('verify', create.testProfileData);

      locationStub.restore();
      clock.restore();
    });
  });

  describe('coldStart', function() {
    it('shows error if localStorage is not available', function() {
      const l = global.localStorage;
      global.localStorage = null;

      state.coldStart('', '');
      state.error.should.equal('You cannot log in in private mode. Please turn it off and try again.');

      global.localStorage = l;
    });

    it('verifies token from url', function() {
      const verifyStub = sinon.stub(state, 'verify');
      state.coldStart(create.testToken, create.testProfileData);
      verifyStub.should.have.been.calledWith(create.testToken, create.testProfileData);
    });

    it('recuperates last session from localStorage', function() {
      const resumeStub = sinon.stub(state, 'resume');

      localStorage.setItem('jwtToken', create.testToken);
      localStorage.setItem('jwtTokenExpiration', '10');

      state.coldStart(null, create.testProfileData);

      state.token.should.equal(create.testToken);
      resumeStub.should.have.been.calledWith(create.testToken, 10, create.testProfileData);
    });
  });

  describe('signIn', function() {
    it('prohibits sign in with incorrect email and password', () => {
      // console.log(q.data);

      const spy = sinon.stub(state, 'mutate');

      state.signIn('', 'password', '');
      state.error.should.equal('Please specify all required fields');

      state.signIn('email', 'password', '');
      state.error.should.equal('Specified email has invalid format');

      state.signIn('email@email.com', '', '');
      state.error.should.equal('Please specify all required fields');

      state.signIn('email@email.com', '123', '');
      state.error.should.equal('Password needs to have at least 7 characters');

      spy.should.not.have.been.called;

      (() => state.signIn('email@email.com', 'password', '')).should.throw('GraphQLError');
    });

    it('allows sign in with email, password and profile data, removes password and stores result in localStorage', async function() {
      const user = create.user();

      initApollo();

      state.loginPassword.onChange('MyPassword');

      try {
        const result = await state.signIn('email@email.com', 'password', 'name');
      } catch (ex) {
        /**/
      }
      state.userId.should.equal(user._id);
      state.user._id.should.equal(user._id);
      state.user.profile.name.should.equal(user.profile.name);
      state.loginPassword.value.should.be.empty;

      localStorage.getItem('jwtToken').should.equal(defaultToken.hashedToken);
      localStorage.getItem('jwtTokenExpiration').should.equal(defaultToken.expires.getTime().toString());
    });

    it('shows server error messages', async () => {
      const errorSpy = sinon.spy(state, 'showError');

      async function testServerMessage(message: string) {
        errorSpy.reset();

        initApollo({
          mutation: {
            loginWithPassword: () => {
              throw new Error(message);
            }
          }
        });

        try {
          await state.signIn('email@email.com', 'password', 'name');
        } catch (ex) {
          /**/
        }
      }

      await testServerMessage('Email not verified');
      state.error.should.equal('Your email is not verified');

      await testServerMessage('Any other error');
      state.error.should.equal('User or password is invalid');
    });
  });

  describe('register', function() {
    it('prohibits registration with invalid data', () => {
      const spy = sinon.stub(state, 'mutate');

      state.register(
        '',
        create.testEmail,
        create.testPassword,
        create.testPassword,
        create.testProfileData,
        create.testProfile
      );
      state.error.should.equal('Please specify all required fields');

      state.register(
        create.testName,
        '',
        create.testPassword,
        create.testPassword,
        create.testProfileData,
        create.testProfile
      );
      state.error.should.equal('Please specify all required fields');

      state.register(
        create.testName,
        create.testEmail,
        '',
        create.testPassword,
        create.testProfileData,
        create.testProfile
      );
      state.error.should.equal('Please specify all required fields');

      state.register(
        create.testName,
        'wrong',
        create.testPassword,
        create.testPassword,
        create.testProfileData,
        create.testProfile
      );

      state.error.should.equal('Specified email has invalid format');

      state.register(create.testName, create.testEmail, '123', '123', create.testProfileData, create.testProfile);

      state.error.should.equal('Password needs to have at least 7 characters');

      state.register(
        create.testName,
        create.testEmail,
        create.testPassword,
        create.testPassword + '2',
        create.testProfileData,
        create.testProfile
      );

      state.error.should.equal('Passwords are different!');

      spy.should.not.have.been.called;

      (() => state.signIn('email@email.com', 'password', '')).should.throw('GraphQLError');
    });

    it('displays server messages', async function() {
      const errorSpy = sinon.spy(state, 'showError');
      const infoSpy = sinon.spy(state, 'showInfo');

      async function testServerMessage(message: string) {
        errorSpy.reset();
        infoSpy.reset();

        initApollo({
          mutation: {
            createAccountAndLogin: () => {
              throw new Error(message);
            }
          }
        });

        try {
          await state.register(
            create.testName,
            create.testEmail,
            create.testPassword,
            create.testPassword,
            create.testProfileData,
            create.testProfile
          );
        } catch (ex) {
          /**/
        }
      }

      state.loginPassword.onChange('MyPassword');
      state.registerName.onChange(create.testName);
      state.registerPassword1.onChange(create.testPassword);
      state.registerPassword2.onChange(create.testPassword);
      state.registerProfile.organisation.onChange('WSU');

      await testServerMessage('Email not verified!');
      infoSpy.should.have.been.called;
      infoSpy.should.have.been.calledWith(
        'Account successfully created! We sent you an email with instructions on how to activate your account.'
      );

      await testServerMessage('User with this email already exists!');
      state.error.should.equal('User with this email already exists!');

      await testServerMessage("Email doesn't match the criteria.");
      state.error.should.equal("Email doesn't match the criteria");

      await testServerMessage('Login forbidden');
      state.error.should.equal('Login forbidden');

      await testServerMessage('Pikachu');
      state.error.should.equal('Pikachu');

      state.loginPassword.value.should.not.be.empty;
      state.loginPassword.value.should.not.be.empty;
      state.registerName.value.should.not.be.empty;
      state.registerPassword1.value.should.not.be.empty;
      state.registerPassword2.value.should.not.be.empty;
      state.registerProfile.organisation.value.should.not.be.empty;
    });

    it('logs in after successful registration, remove password and remove registration data', async function() {
      const errorSpy = sinon.spy(state, 'showError');

      initApollo();

      state.loginPassword.onChange('MyPassword');
      state.registerName.onChange(create.testName);
      state.registerPassword1.onChange(create.testPassword);
      state.registerPassword2.onChange(create.testPassword);
      state.registerProfile.organisation.onChange('WSU');

      await state.register(
        create.testName,
        create.testEmail,
        create.testPassword,
        create.testPassword,
        create.testProfileData,
        create.testProfile
      );

      // check if user is logged in
      state.userId.should.equal(defaultUser._id);
      state.user.profile.name.should.equal(defaultUser.profile.name);

      // check if component has reset its values
      state.error.should.be.empty;
      state.loginPassword.value.should.be.empty;
      state.registerName.value.should.be.empty;
      state.registerPassword1.value.should.be.empty;
      state.registerPassword2.value.should.be.empty;
      state.registerProfile.organisation.value.should.be.empty;
      state.loggingIn.should.be.false;
      errorSpy.should.not.have.been.called;
    });
  });

  async function checkMutationAndLogin(func: () => void) {
    let location = {
      href: ''
    };

    const locationStub = sinon.stub(global, 'location').get(() => location);
    const originalPushState = global.history.pushState;
    const pushStateStub = sinon.stub(global.history, 'pushState');

    try {
      const logInSpy = sinon.spy(state, 'logIn');
      initApollo();

      global.location.href = 'http://test?token';

      // check that user is not logged in
      should.not.exist(state.userId);

      await func();

      // check that user is logged in
      logInSpy.should.have.been.called;
      state.userId.should.equal(defaultUser._id);

      // if history is available push state is called
      global.history.pushState.should.have.been.calledWith(null, '', 'http://test');

      // otherwise reload page

      global.history.pushState = null;

      await func();

      global.location.href.should.equal('http://test');
    } catch (ex) {
      throw ex;
    } finally {
      global.history.pushState = originalPushState;
      pushStateStub.restore();
      locationStub.restore();
    }
  }

  describe('verify', function() {
    it('displays server messages', async function() {
      const errorSpy = sinon.spy(state, 'showError');

      async function testServerMessage(message: string) {
        errorSpy.reset();

        initApollo({
          mutation: {
            verify: () => {
              throw new Error(message);
            }
          }
        });

        try {
          await state.verify(create.testToken, create.testProfileData);
        } catch (ex) {
          /**/
        }
      }

      await testServerMessage('jwt expired');
      state.error.should.equal('Session Expired');

      await testServerMessage('invalid token');
      state.error.should.equal('Login prohibited with malformed token');

      await testServerMessage('jwt malformed');
      state.error.should.equal('Login prohibited with malformed token');

      await testServerMessage('Pikachu');
      state.error.should.equal('Pikachu');
    });

    it('Logs user in after successful verification and changes url', async function() {
      await checkMutationAndLogin(() => state.verify(create.testToken, create.testProfileData));
    });
  });

  describe('resetPassword', function() {
    it('prohibits registration with invalid data', () => {
      const spy = sinon.stub(state, 'mutate');

      state.resetPassword(create.testToken, '', create.testPassword, create.testProfileData);
      state.error.should.equal('Please specify all required fields');

      state.resetPassword(create.testToken, '123', create.testPassword, create.testProfileData);
      state.error.should.equal('Password needs to have at least 7 characters');

      state.resetPassword(create.testToken, create.testPassword + '1', create.testPassword, create.testProfileData);
      state.error.should.equal('Passwords are different!');
    });

    it('displays server messages', async function() {
      const errorSpy = sinon.spy(state, 'showError');

      async function testServerMessage(message: string) {
        errorSpy.reset();

        initApollo({
          mutation: {
            resetPassword: () => {
              throw new Error(message);
            }
          }
        });

        try {
          await state.resetPassword(create.testToken, create.testPassword, create.testPassword, create.testProfileData);
        } catch (ex) {
          /**/
        }
      }

      await testServerMessage('jwt expired');
      state.error.should.equal('Session Expired');

      await testServerMessage('invalid token');
      state.error.should.equal('Login prohibited with malformed token');

      await testServerMessage('jwt malformed');
      state.error.should.equal('Login prohibited with malformed token');

      await testServerMessage('Pikachu');
      state.error.should.equal('Pikachu');
    });

    it('Logs user in after successful verification and changes url', async function() {
      await checkMutationAndLogin(() =>
        state.resetPassword(create.testToken, create.testPassword, create.testPassword, create.testProfileData)
      );
    });
  });

  describe('emailResetLink', function() {
    it('prohibits email reset with invalid data', () => {
      sinon.stub(state, 'mutate');

      state.emailResetLink('');
      state.error.should.equal('Please specify all required fields');

      state.resendVerification('qwerty');
      state.error.should.equal('Specified email has invalid format');
    });

    it('displays server messages', async function() {
      const errorSpy = sinon.spy(state, 'showError');

      async function testServerMessage(message: string) {
        errorSpy.reset();

        initApollo({
          mutation: {
            requestResetPassword: () => {
              throw new Error(message);
            }
          }
        });

        try {
          await state.emailResetLink(create.testEmail);
        } catch (ex) {
          /**/
        }
      }

      await testServerMessage('User email does not exist');
      state.error.should.equal('User with this email does not exist!');

      await testServerMessage('Pikachu');
      state.error.should.equal('Server error');
    });

    it('Shows notification when password reset instructions were sent', async function() {
      const mutateSpy = sinon.spy(state, 'mutate');
      const showInfoSpy = sinon.spy(state, 'showInfo');

      initApollo();

      await state.emailResetLink(create.testEmail);

      mutateSpy.getCall(0).args[0].variables.should.deep.equal({
        email: create.testEmail
      });

      showInfoSpy.should.have.been.calledWith('We sent you an email with password reset instructions');
    });
  });

  describe('resendVerification', function() {
    it('prohibits email reset with invalid data', () => {
      sinon.stub(state, 'mutate');

      state.resendVerification('');
      state.error.should.equal('Please specify all required fields');

      state.resendVerification('qwerty');
      state.error.should.equal('Specified email has invalid format');
    });

    it('displays server messages', async function() {
      async function testServerMessage(message: string) {
        initApollo({
          mutation: {
            requestResendVerification: () => {
              throw new Error(message);
            }
          }
        });

        try {
          await state.resendVerification(create.testEmail);
        } catch (ex) {
          /**/
        }
      }

      await testServerMessage('User not found');
      state.error.should.equal('User with this email does not exist');

      await testServerMessage('User already verified');
      state.error.should.equal('This user is already verified');

      await testServerMessage('Pikachu');
      state.error.should.equal('Server error');
    });

    it('Shows notification when verification was sent', async function() {
      const mutateSpy = sinon.spy(state, 'mutate');
      const showInfoSpy = sinon.spy(state, 'showInfo');

      initApollo();

      await state.resendVerification(create.testEmail);

      mutateSpy.getCall(0).args[0].variables.should.deep.equal({
        email: create.testEmail
      });

      showInfoSpy.should.have.been.calledWith('We sent you instructions on how to verify your email');
    });
  });

  describe('resume', function() {
    it('Logs user out after token expiration', function() {
      const logOutSpy = sinon.stub(state, 'logOut');

      state.resume(create.testToken, 1, create.testProfileData);
      logOutSpy.should.have.been.called;
    });

    it('Logs user out after server failure in production', async function() {
      const logOutStub = sinon.stub(state, 'logOut');

      initApollo({
        mutation: {
          resume: () => {
            throw new Error('Some error');
          }
        }
      });

      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      try {
        await state.resume(create.testToken, new Date().getTime() + 1000, create.testProfileData);
      } catch (ex) {
        /**/
      }
      logOutStub.should.not.have.been.called;

      process.env.NODE_ENV = 'production';
      try {
        await state.resume(create.testToken, new Date().getTime() + 1000, create.testProfileData);
      } catch (ex) {
        /**/
      }

      logOutStub.should.have.been.called;
      process.env.NODE_ENV = original;
    });

    it('Logs user in after successful resume', async function() {
      const logInStub = sinon.stub(state, 'logIn');

      initApollo();

      await state.resume(create.testToken, new Date().getTime() + 1000, create.testProfileData);

      logInStub.should.have.been.called;
    });
  });

  describe('logOut', function() {
    it('clears state of any trace of user and updates local storage', function() {
      localStorage.setItem('jwtToken', 'Foo');
      localStorage.setItem('jwtTokenExpiration', 'Bar');

      state.setUserId('123');
      state.setUser({ roles: [] });
      state.setView('register');

      const logoutSpy = sinon.spy(state.user, 'logout');

      state.logOut();

      should.not.exist(localStorage.getItem('jwtToken'));
      should.not.exist(localStorage.getItem('jwtTokenExpiration'));
      should.not.exist(state.userId);
      should.not.exist(state.user);
      state.view.should.equal('signIn');
      logoutSpy.should.have.been.called;
    });
  });

  describe ('setProfile', function() {
    it('replaces current users profile', function() {
       state.setUser({ roles: [] });
       state.setProfile({ name: create.testName, error: 1 });
       state.user.profile.name.should.equal(create.testName);
    });
  });
});

// state.register(
//         create.testName,
//         create.testEmail,
//         create.testPassword,
//         create.testPassword,
//         create.testProfileData,
//         create.testProfile
//       );
