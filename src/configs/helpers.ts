import i18n from 'es2015-i18n-tag';
import { User } from './user_model';

export function trimInput(value: string) {
  return value.replace(/^\s*|\s*$/g, '');
};

export function isNotEmpty(state: any, value: string) {
  if (value && value !== '') {
    return true;
  }
  state.error = i18n`Please specify all required fields`;
  return false;
};

export function isEmail(state: any, value: string) {
  let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (filter.test(value)) {
    return true;
  }
  state.error =  i18n`Specified email has invalid format`;
  return false;
};

export function isValidPassword(state: any, password: string) {
  if (password.length < 7) {
    state.error = i18n`Password needs to have at least 7 characters`;
    return false;
  }
  return true;
};

export function areValidPasswords(state: any, password: string, confirm: string) {
  if (!isValidPassword(state, password)) {
    return false;
  }
  if (password !== confirm) {
    state.error = i18n`Passwords are different!`;
    return false;
  }
  return true;
};
