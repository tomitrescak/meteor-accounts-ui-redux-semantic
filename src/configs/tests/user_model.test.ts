import { User } from '../user_model';
import { create } from '../../components/tests/test_data';

describe('User Model', function() {
  let user: User;

  beforeEach(function() {
    user = new User(create.userModel({
      roles: ['admin']
    }));
  });

  it('isRole: checks for a role', function() {
    user.isRole('user').should.be.false;
    user.isRole('admin').should.be.true;
  });

  it('isAdmin: checks if user is admin', function() {
    user.isAdmin().should.be.true;
  });

  it('json: default implementation throws error', function() {
    (() => user.json()).should.throw('Not implemented!');
    // (() => user.parse(null)).should.throw('Not implemented!');
  });
});

