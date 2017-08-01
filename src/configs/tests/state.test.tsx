import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';
import { getAccountState } from '../state';
import * as sinon from 'Sinon';
import { createApp } from 'apollo-mantra';

import authSchema from 'apollo-module-authentication/dist/schema';
import { addModules } from 'apollo-modules';

// compile module
const modules = addModules([authSchema as any]);
// add date scalar
const addedSchema = `
  scalar Date

  type Profile {
    name: String
  }

  input ProfileInput {
    name: String
  }
`;
let typeDefs = (addedSchema + modules.schema).replace(/Date/g, 'Int');

// define schems
const schema = makeExecutableSchema({ typeDefs });

// define mocks
const mocks = {
  Token: () => ({
    expires: 1,
    user: {},
    hashedToken: ''
  }),
  Query: () => ({
    loginWithPassword: () => {
      console.log('ooo')
    }
  }),
  Mutation: () => ({
    loginWithPassword: () => {
      throw new Error('Problem')
    }
  })
};
addMockFunctionsToSchema({ schema, mocks });

const mockNetworkInterface = mockNetworkInterfaceWithSchema({ schema });

const client = new ApolloClient({
  networkInterface: mockNetworkInterface
});

describe('State', () => {
  it('prohibits sign in with  incorrect email and password', () => {
    // console.log(q.data);

    const state = getAccountState({ cache: false });
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

  it('allows sign in with email, password and profile data', async () => {
    // const q = await client.query({
    //   query: gql`
    //     {
    //       user {
    //         name
    //       }
    //     }
    //   `
    // });

    // console.log(q.data);

    createApp({
      apolloClient: client
    });
    const state = getAccountState({ cache: false });
    const loginStub = sinon.stub(state, 'logIn');
    const errorSpy = sinon.spy(state, 'showError');

    try {
      const result = await state.signIn('email@email.com', 'password', 'name');
      console.log(result);
    } catch (ex) {}

    mocks.Token = () => { throw new Error('Bad boy'); } 
    addMockFunctionsToSchema({ schema, mocks });
    
    
    try {
      const result = await state.signIn('email@email.com', 'password', 'name');
      console.log(result);
    } catch (ex) {}

    state.error.should.be.empty;
    loginStub.should.have.been.called;
  });
});
