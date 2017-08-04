// tslint:disable-next-line:no-unused-variable
import { types, ISnapshottable, IModelType, getParent } from 'mobx-state-tree';

export const registerProfileModel = types.model(
  'Profile',
  {
    name: '',
    organisation: '',
    interest: ''
  },
  {
    changeField(key: string, value: any) {
      this[key] = value;
    },
    json(): any {
      return {
        organisation: this.organisation,
        interest: this.interest
      };
    }
  }
);
