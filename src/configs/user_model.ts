export interface UserEmail {
  address: string;
  verified: boolean;
}

export default class User {
  _id: string;
  profile: any;
  emails: UserEmail[];
  roles: string[];

  constructor(user: User) {
    this._id = user._id;
    this.emails = user.emails;
    this.profile = user.profile;
    this.roles = user.roles;
  }

  isRole(role: string) {
    return this.roles && this.roles.indexOf(role) >= 0;
  }

  isAdmin() {
    return this.roles && this.roles.indexOf('admin') >= 0;
  }
}
