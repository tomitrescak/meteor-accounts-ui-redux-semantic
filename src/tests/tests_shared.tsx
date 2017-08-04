import * as Form from 'semantic-ui-mobx';
// tslint:disable-next-line:no-unused-variable
import { types, ISnapshottable, IModelType, getParent } from 'mobx-state-tree';

export const registerProfileModel = types.model('Profile', {
  name: Form.requiredField(''),
  organisation: Form.requiredField(''),
  interest: Form.simpleField('')
}, {
  json(): any {
    return {
      organisation: this.organisation.value,
      interest: this.interest.value
    }
  }
});
