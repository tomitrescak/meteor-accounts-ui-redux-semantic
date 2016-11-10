import i18n from 'es2015-i18n-tag';

export function trimInput(value: string) {
  return value.replace(/^\s*|\s*$/g, '');
};

export function isNotEmpty(dispatch: any, value: string) {
  if (value && value !== '') {
    return true;
  }
  dispatch(i18n`Please specify all required fields`);
  return false;
};

export function isEmail(dispatch: any, value: string) {
  let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (filter.test(value)) {
    return true;
  }
  dispatch(i18n`Specified email has invalid format`);
  return false;
};

export function isValidPassword(dispatch: any, password: string) {
  if (password.length < 7) {
    dispatch(i18n`Password needs to have at least 7 characters`);
    return false;
  }
  return true;
};

export function areValidPasswords(dispatch: Function, password: string, confirm: string) {
  if (!isValidPassword(dispatch, password)) {
    return false;
  }
  if (password !== confirm) {
    dispatch(i18n`Passwords are different!`);
    return false;
  }
  return true;
};
