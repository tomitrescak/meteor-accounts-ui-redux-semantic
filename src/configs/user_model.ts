import { types, IModelType, ISnapshottable } from 'mobx-state-tree';
import { IObservableArray } from 'mobx';

export const UserEmail = types.model('UserEmail', {
  address: types.string,
  verified: types.boolean
});

export const ProfileModel = types.model(
  'Profile',
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
    profile: types.optional(ProfileModel, {}),
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

export type Profile = typeof ProfileModel.Type;
export type User = typeof UserModel.Type;
