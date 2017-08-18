// // tslint:disable-next-line:no-unused-variable
// import { types, ISnapshottable, IModelType, getParent } from 'mobx-state-tree';

// export class registerProfileModel = types.model(
//   'Profile',
//   {
//     name: '',
//     organisation: '',
//     interest: ''
//   },
//   {
//     changeField(key: string, value: any) {
//       this[key] = value;
//     },
//     json(): any {
//       return {
//         organisation: this.organisation,
//         interest: this.interest
//       };
//     }
//   }
// );

import { RegisterProfile } from '../index';
import { action } from 'mobx';
import { requiredField, field } from 'semantic-ui-mobx';

export class CustomRegisterProfile extends RegisterProfile {
  @requiredField organisation: string;
  @field interest: string;

  json(): any {
    return {
      organisation: this.organisation,
      interest: this.interest
    };
  }

  @action clear() {
    this.organisation = '';
    this.interest = '';
  }
}