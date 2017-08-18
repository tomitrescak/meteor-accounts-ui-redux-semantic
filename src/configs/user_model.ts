// tslint:disable-next-line:no-unused-variable
import { IObservableArray, observable } from 'mobx';
import { FormState, requiredField } from 'semantic-ui-mobx';

export class UserEmail {
  address: string;
  verified: boolean;
}

export class UserProfileModel {
  @observable name = '';

  constructor(data: UserProfileModel) {
    this.name = data.name;
  }
}

export class RegisterProfile extends FormState {
  @requiredField name: string = null;

  json(): {} {
    throw new Error('json() not implemented!');
  }

  clear() {
    throw new Error('clear() not implemented');
  }
}

export class User {
  _id: string;
  profile: UserProfileModel;
  roles: string[];

  constructor(user: User) {
    this._id = user._id;
    this.profile = new UserProfileModel(user.profile);
    this.roles = user.roles;
  }

  isRole(role: string) {
    return this.roles && this.roles.indexOf(role) >= 0;
  }
  isAdmin() {
    return this.roles && this.roles.indexOf('admin') >= 0;
  }
  login(_data: any) {
    /**/
  }
  logout() {
    /**/
  }
  json(): {} {
    throw new Error('Not implemented!');
  }
}
