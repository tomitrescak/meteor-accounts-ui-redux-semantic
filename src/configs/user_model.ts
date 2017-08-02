// tslint:disable-next-line:no-unused-variable
import { types, ISnapshottable, IModelType } from 'mobx-state-tree';
import { IObservableArray } from 'mobx';

export const UserEmail = types.model('UserEmail', {
  address: types.string,
  verified: types.boolean
});

export const UserProfileModel = types.model(
  'Profile',
  {
    name: ''
  }
);

export const RegisterProfileModel = types.model(
  'RegisterProfile',
  {
    name: ''
  },
  {
    json(): {} {
      throw new Error('Not implemented!');
    },
    parse(model: any) {
      /**/
      throw new Error('Not implemented!');
    }
  }
);

export const UserModel = types.model(
  'User',
  {
    _id: '',
    profile: types.optional(UserProfileModel, {}),
    emails: types.array(UserEmail),
    roles: types.array(types.string)
  },
  {
    isRole(role: string) {
      return this.roles && this.roles.indexOf(role) >= 0;
    },

    isAdmin() {
      return this.roles && this.roles.indexOf('admin') >= 0;
    },
    login(_data: any) {
      /**/
    },
    logout() {
      /**/
    },
    json(): {} {
      throw new Error('Not implemented!');
    },
    parse(model: any) {
      /**/
      throw new Error('Not implemented!');
    }
  }
);

export type UserProfile = typeof UserProfileModel.Type;
export type RegisterProfile = typeof RegisterProfileModel.Type;
export type User = typeof UserModel.Type;


