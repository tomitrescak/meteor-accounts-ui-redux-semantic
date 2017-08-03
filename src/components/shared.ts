import { User } from '../configs/user_model';
import { State } from '../index';

export interface ISimpleComponent {
  state: State<User>;
  inverted?: boolean;
}

export interface IRegistrationComponent extends ISimpleComponent {
  extraFields: (profile: object) => JSX.Element | JSX.Element[];
}

export interface NameValuePair {
  name: string;
  value: string;
}
