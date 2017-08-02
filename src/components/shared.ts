import { User } from '../configs/user_model';

export interface ISimpleComponent {
  state?: App.Accounts.State<User>;
  inverted?: boolean;
}

export interface IRegistrationComponent extends ISimpleComponent {
  extraFields: (profile: object) => JSX.Element | JSX.Element[];
}

export interface NameValuePair {
  name: string;
  value: string;
}
