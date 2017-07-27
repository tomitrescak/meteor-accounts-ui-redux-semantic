export interface ISimpleComponent {
  state?: App.Accounts.State;
  inverted?: boolean;
}

export interface IRegistrationComponent extends ISimpleComponent {
  extraFields: (profile: object) => JSX.Element | JSX.Element[];
}
