import ApolloClient from 'apollo-client';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';
import { getAccountState, State } from '../state';
import * as sinon from 'Sinon';
import { createApp } from 'apollo-mantra';

import authSchema from 'apollo-module-authentication/dist/schema';
import { addModules } from 'apollo-modules';
import { User } from '../user_model';
import { create } from '../../components/tests/test_data';
import { registerProfileModel } from '../../tests/tests_shared';

// compile module
const modules = addModules([authSchema as any]);
// add date scalar
const addedSchema = `
  type Profile {
    name: String
    organisation: String
  }

  input ProfileInput {
    name: String
    organisation: String
  }
`;
let typeDefs = (addedSchema + modules.schema).replace(/Date/g, 'Int');

// define schema
const schema = makeExecutableSchema({ typeDefs });
const defaultUser = create.user();
const defaultToken = {
  expires: '1',
  user: {},
  hashedToken: '#hash'
};
function initApollo({ token = defaultToken, user = create.user(), mutation = {} } = {}) {
  // define mocks
  const mocks = {
    Token: () => token,
    User: () => user,
    // Query: () => ({}),
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
      }
    };
  });

  beforeEach(function() {
    state = getAccountState({ cache: false, profileType: registerProfileModel });
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
        await state.signIn('email@email.com', 'password', 'name');
      } catch (ex) {
        /**/
      }

      state.userId.should.equal(user._id);
      state.user._id.should.equal(user._id);
      state.user.profile.name.should.equal(user.profile.name);
      state.loginPassword.value.should.be.empty;

      localStorage.getItem('jwtToken').should.equal(defaultToken.hashedToken);
      localStorage.getItem('jwtTokenExpiration').should.equal(defaultToken.expires);
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
      errorSpy.should.have.been.calledWith('Your email is not verified');

      await testServerMessage('Any other error');
      errorSpy.should.have.been.calledWith('User or password is invalid');
    });
  });

  describe('register', function() {
    it('prohibits registration with invalid date', () => {
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
      errorSpy.should.have.been.calledWith('User with this email already exists!');

      await testServerMessage("Email doesn't match the criteria.");
      errorSpy.should.have.been.calledWith("Email doesn't match the criteria");

      await testServerMessage('Login forbidden');
      errorSpy.should.have.been.calledWith('Login forbidden');

      await testServerMessage('Pikachu');
      errorSpy.should.have.been.calledWith('Pikachu');

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
});

// state.register(
//         create.testName,
//         create.testEmail,
//         create.testPassword,
//         create.testPassword,
//         create.testProfileData,
//         create.testProfile
//       );
