export interface UserEmail {
  address: string;
  verified: boolean;
}

export default class User {
  profile: any;
  emails: UserEmail[];
  roles: string[];

  constructor(user: User) {
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
