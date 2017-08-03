import { User, UserModel, RegisterProfileModel } from '../user_model';

describe('User Model', function() {
  let user: User;

  beforeEach(function() {
    user = UserModel.create({
      roles: ['admin']
    });
  });

  it('isRole: checks for a role', function() {
    user.isRole('user').should.be.false;
    user.isRole('admin').should.be.true;
  });

  it('isAdmin: checks if user is admin', function() {
    user.isAdmin().should.be.true;
  });

  it('json asnd pars: default implementation throws error', function() {
    (() => user.json()).should.throw('Not implemented!');
    (() => user.parse(null)).should.throw('Not implemented!');
  });
});

describe('User Profile', () => {
  it('json asnd pars: default implementation throws error', function() {
    const profile = RegisterProfileModel.create();
    (() => profile.json()).should.throw('Not implemented!');
    (() => profile.parse(null)).should.throw('Not implemented!');
  });
});
