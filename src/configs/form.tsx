import * as React from 'react';
import * as moment from 'moment';
import { observer } from 'mobx-react';
import { style } from 'typestyle';
import i18n from 'es2015-i18n-tag';
import { types, IType, getParent } from 'mobx-state-tree';
import {
  FormComponent,
  FormGroupProps,
  Form as SUIForm,
  Label as SUILabel,
  Input as SuiInput,
  FormInputProps,
  FormSelectProps,
  FormRadioProps,
  FormTextAreaProps,
  FormFieldProps
} from 'semantic-ui-react';

import DatePickerView from 'react-datepicker';

import { ISnapshottable } from 'mobx-state-tree/dist/types/type';
import { IModelType } from 'mobx-state-tree/dist/types/complex-types/object';
import { observable } from 'mobx';

export { Form as SUIForm } from 'semantic-ui-react';

export const Form = SUIForm;
export const Field = SUIForm.Field;
export const Group = SUIForm.Group;

let g: IModelType;

const errorStyle = style({
  marginTop: '3px!important'
});

export interface FormEvent {
  checked?: boolean;
  label: string;
  name: string;
  required: boolean;
  type: string;
  value: any;
}

export type Validator = (value: string | number) => string;

const baseModel = types.model(
  'BaseModel',
  {},
  {
    changeField(key: string, value: any) {
      this[key] = value;
    },
    validate() {
      let valid = true;
      let fields = this['fields'] as FieldModel[];
      let message = '';
      for (let key of Object.getOwnPropertyNames(fields)) {
        let field = fields[key];
        valid = valid && field.isValid();
      }
      return valid;
    }
  }
);

export function createFormStateFromModel<T, U>(
  name: string,
  model: IModelType<T, U>
): IModelType<T & { fields: FieldModel[] }, U & { changeField: (key: string, value: any) => void }> {
  return types.compose(name, model, baseModel) as  any;
}

export function createStore<T, U>(
  name: string,
  fields: T,
  functions: U
): IModelType<T & { fields: FieldModel[] }, U & { changeField: (key: string, value: any) => void }> {
  // return types.model(name, fields, functions) as any;
  return types.compose(name, types.model(name, fields, functions), baseModel) as any;
}

export class FieldModel {
  @observable message = '';
  hasError: boolean = false;
  validators: Validator[] = [];
  store: Owner;
  key = '';

  constructor(owner: Owner, key: string, validators: Validator[] = []) {
    this.store = owner;
    this.key = key;
    this.validators = validators;

    if (!owner) {
      throw new Error(`Field '${key}' has no owner`);
    }
  }

  get value() {
    return this.store[this.key] as any;
  }

  set value(value: any) {
    this.store.changeField(this.key, value);
  }

  validate(): string {
    if (!this.validators) {
      return null;
    }
    if (this.message) {
      this.message = '';
    }
    for (let validator of this.validators) {
      let message = validator(this.value);
      if (message) {
        this.hasError = true;
        this.message = message;
        return message;
      }
    }
    if (this.hasError) {
      this.hasError = false;
    }
    return null;
  }

  onChange(value: string | number | boolean) {
    this.value = value != null ? value.toString() : '';
    this.validate();
  }

  isValid() {
    return this.validate() === null;
  }
}

export interface FieldMap {
  [key: string]: FieldModel;
}

function validateField(field: any) {
  if (field && field.validate) {
    let message = field.validate();
    if (message) {
      return message;
    }
  }
  return null;
}

export function validate(model: any): string {
  for (let name of Object.getOwnPropertyNames(model)) {
    if (Array.isArray(model[name])) {
      for (let i in model[name]) {
        let message = validateField(model[name][i]);
        if (message) {
          return message;
        }
      }
    }
    let message = validateField(model[name]);
    if (message) {
      return message;
    }
  }
  return null;
}

export function hasError(model: any) {
  return validate(model) !== null;
}

// export type IndexType = {
//   [index: string]: FieldType;
// }

// export const FormModel = types.model("Form", {
//   message: types.string,
//   hasError: types.boolean,
//   fields: types.frozen as IType<IndexType, IndexType>
// }, {
//   validate(): string {
//     for (let name in this.fields) {
//       let field = this.fields[name];
//       let message = field.validate();
//       if (message) {
//         this.hasError = true;
//         return message;
//       }
//     }
//     this.hasError = false;
//     return null;
//   },
//   isValid() {
//     return this.validate() === null;
//   }
// })

export interface Owner {
  // [key: string]: any;
  changeField(key: string, value: any): void;
}

export function isValid<T extends Owner>(store: T, key?: keyof T) {
  if (!key) {
    return validate(store);
  }
  return store['fields'][key].isValid();
}

export function bind<T extends Owner>(store: T, bind: keyof T, ...validators: Validator[]) {
  const typed = store as any;
  if (!typed.fields) {
    typed.fields = {};
  }
  if (!typed.changeField) {
    throw new Error(`Incorrect owner, it needs to define 'changeField' method`);
  }
  if (!typed.fields[bind]) {
    typed.fields[bind] = new FieldModel(store, bind, validators);
  }
  return typed.fields[bind];
}

export interface FormElement {
  owner: FieldModel;
}

export class FormControl<P, T> extends React.PureComponent<P & FormElement, {}> {
  constructor(props: FormElement) {
    super();

    if (!props.owner) {
      console.error(`Component with following props needs to define owner`);
      console.error(props);
      throw new Error(`Component '${props['name']}' needs to define owner`);
    }
  }

  update: any = (_e: React.SyntheticEvent<any>, formEvent: FormEvent) => {
    // this.props.owner.value = formEvent.value;
    this.props.owner.onChange(formEvent.value);
  };

  get value() {
    return this.props.owner.value;
  }
}

interface ErrorProps {
  owner: FieldModel;
}
const ErrorLabel = ({ owner }: ErrorProps) =>
  <SUILabel color="red" className={errorStyle}>
    {owner.message}
  </SUILabel>;

@observer
export class Input extends FormControl<FormInputProps, any> {
  render() {
    // console.log('Rendering: ' + this.value);
    let { owner, label, className, ...rest } = this.props;
    return (
      <Form.Field error={owner.hasError} width={this.props.width} className={this.props.className}>
        {label &&
          <label>
            {label}
          </label>}
        <SuiInput onChange={this.update} value={this.value} placeholder={this.props.placeholder || label} {...rest} />
        {owner.hasError && <ErrorLabel owner={this.props.owner} />}
      </Form.Field>
    );
  }
}

Input.displayName = 'BoundInput';

@observer
export class TextArea extends FormControl<FormTextAreaProps, {}> {
  render() {
    let { owner, label, className, ...rest } = this.props;
    return (
      <Form.Field error={owner.hasError} width={this.props.width} className={className}>
        {label &&
          <label>
            {label}
          </label>}
        <Form.TextArea
          onChange={this.update}
          value={this.value}
          placeholder={this.props.placeholder || label}
          {...rest}
        />
        {owner.hasError && <ErrorLabel owner={owner} />}
      </Form.Field>
    );
  }
}

TextArea.displayName = 'BoundTextArea';

export interface Props {
  format?: string;
  onChange?(date: Date): void;
}

let id_helper = 0;
function randomID() {
  return (Date.now() + id_helper++).toString();
}

class DateControl extends React.Component<any, any> {
  focus() {
    /**/
  }
  clear = (e: React.KeyboardEvent<any>) => {
    if (e.keyCode === 8 || e.keyCode === 46) {
      this.props.clear();
    }
  };
  render() {
    const { clear, ...rest } = this.props;
    return <SuiInput {...rest} icon="calendar" readOnly={true} onKeyDown={this.clear} />;
  }
}

export interface DateProps {
  [param: string]: any;
  format?: string;
}

interface State {
  val: Date;
}

@observer
export class DatePicker extends FormControl<FormInputProps & DateProps, {}> {
  static defaultProps = {
    format: 'DD MMM YYYY'
  };
  prohibit() {
    return false;
  }
  clear() {
    this.props.owner.value = null;
  }
  updateDate = (moment: any) => {
    this.update(null, { value: moment.toDate() });
  };
  render() {
    const { format, placeholder, owner, ...rest } = this.props as any;
    return (
      <div className="three wide field">
        {this.props.label &&
          <label>
            {this.props.label}
          </label>}
        <DatePickerView
          {...rest}
          customInput={<DateControl clear={this.clear.bind(this)} />}
          onChange={this.updateDate}
          dateFormat={format}
          placeholderText={placeholder}
          selected={this.value ? moment(this.value) : null}
        />
      </div>
    );
  }
}

DatePicker.displayName = 'DatePicker';

export interface LabelProps {
  label: string;
}
export const Label = (props: FormFieldProps & LabelProps) => {
  const { children, ...rest } = props;
  return (
    <Form.Field {...rest}>
      <label>
        {props.label}
      </label>
    </Form.Field>
  );
};

Label.displayName = 'BoundLabel';

@observer
export class Select extends FormControl<FormSelectProps, {}> {
  updateSelect = (_e: any, selectValue: { name: string; value: any }) => {
    // this.props.owner.value = selectValue.value;
    this.props.owner.onChange(selectValue.value);
  };

  render() {
    let { owner, label, className, ...rest } = this.props;
    return (
      <Form.Field error={owner.hasError} width={this.props.width} className={this.props.className}>
        {label &&
          <label>
            {label}
          </label>}
        <Form.Select onChange={this.updateSelect as any} value={this.value} {...rest} />
        {owner.hasError && <ErrorLabel owner={this.props.owner} />}
      </Form.Field>
    );
  }
}

Select.displayName = 'BoundSelect';

@observer
export class Radio extends FormControl<FormRadioProps, {}> {
  update = (e: React.SyntheticEvent<HTMLInputElement>) => {
    // this.props.owner.value = formEvent.checked;
    this.props.owner.onChange(e.currentTarget.checked);
  };

  render() {
    let { owner, label, className, ...rest } = this.props;
    return <Form.Radio onChange={this.update} value={'radio'} {...rest} />;
  }
}

Radio.displayName = 'BoundRadio';

@observer
export class Checkbox extends FormControl<FormRadioProps, {}> {
  update = (e: React.SyntheticEvent<HTMLInputElement>) => {
    // this.props.owner.value = formEvent.checked;
    this.props.owner.onChange(e.currentTarget.checked);
  };

  render() {
    let { owner, ...rest } = this.props;
    let checked = this.props.owner.value === 'true';
    return <Form.Checkbox onChange={this.update} value={'checkbox'} checked={checked} {...rest} />;
  }
}

Checkbox.displayName = 'BoundCheckbox';

// Fields and validators

export function requiredValidator(value: string | number) {
  return value === '' || value == null ? i18n`This field is required` : '';
}

export function regExValidator(reg: RegExp, format?: string) {
  return (value: string) => {
    if (reg.exec(value)) {
      return '';
    }
    if (format) {
      return i18n`Expecting format: ${format}`;
    }
    return i18n`Unexpected format`;
  };
}

const intReg = /^(\+|\-)?\d+$/;
function isInt(n: string) {
  return intReg.test(n);
}

const positiveIntReg = /^(\+)?\d+$/;
function isPositiveInt(n: string) {
  return positiveIntReg.test(n);
}

const nonZeroIntReg = /^(\+)?[1-9]\d*$/;
function isNonZeroInt(n: string) {
  return nonZeroIntReg.test(n);
}

const floatReg = /^(\+|\-)?\d*\.?\d+$/;
function isFloat(n: string) {
  return floatReg.test(n);
}

const positiveFloatReg = /^(\+)?\d*\.?\d+$/;
function isPositiveFloat(n: string) {
  return floatReg.test(n);
}

const nonZeroFloatReg = /^(\+)?[1-9]\d*\.?\d+$/;
function isNonZeroFloat(n: string) {
  return nonZeroFloatReg.test(n);
}

const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
function isEmail(n: string) {
  return emailReg.test(n);
}

export function emailValidator(value: string) {
  return value == null || value === '' || isEmail(value) ? '' : i18n`Email has incorrect format!`;
}

export function intPositiveValidator(value: number | string) {
  return value == null || value === '' || isPositiveInt(value.toString()) ? '' : i18n`Expected positive integer value`;
}

export function intValidator(value: number | string) {
  return value == null || value === '' || isInt(value.toString()) ? '' : i18n`Expected integer value`;
}

export function intNonZeroValidator(value: number | string) {
  return value == null || value === '' || isNonZeroInt(value.toString()) ? '' : i18n`Expected non-zero integer value`;
}

export function floatValidator(value: number | string) {
  return value == null || value === '' || isFloat(value.toString()) ? '' : i18n`Expected float value`;
}

export function floatPositiveValidator(value: number | string) {
  return value == null || value === '' || isPositiveFloat(value.toString()) ? '' : i18n`Expected positive float value`;
}

export function floatNonZeroValidator(value: number | string) {
  return value == null || value === '' || isNonZeroFloat(value.toString()) ? '' : i18n`Expected non-zero float value`;
}

export function lengthValidator(length: number, message?: string) {
  return (value: number | string) => {
    return value == null || value === '' || value.toString().length >= length
      ? ''
      : message || i18n`Too short! Minimum ${length} characters`;
  };
}

export function equalityValidator(comparer: () => string | string, message?: string) {
  return (value: string) => {
    let val1 = value ? value.toString() : value.toString();
    let val2 = typeof comparer === 'function' ? comparer() : comparer;

    return val1 === val2 ? '' : message || i18n`Value ${val1} does not match ${val2}`;
  };
}

// field constructors

export function requiredField<T extends Owner>(owner: T, key: keyof T, ...validators: Validator[]) {
  validators = [requiredValidator].concat(validators || []);
  return bind(owner, key, ...validators);
}

export function simpleField<T extends Owner>(owner: T, key: keyof T, ...validators: Validator[]) {
  validators = [].concat(validators || []);
  return bind(owner, key, ...validators);
}
