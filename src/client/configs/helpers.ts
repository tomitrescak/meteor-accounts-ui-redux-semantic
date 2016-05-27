export function trimInput(value: string) {
  return value.replace(/^\s*|\s*$/g, "");
};

export function isNotEmpty(dispatch: any, value: string) {
  if (value && value !== "") {
    return true;
  }
  dispatch("accounts.error.requiredFields");
  return false;
};

export function isEmail(dispatch: any, value: string) {
  let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (filter.test(value)) {
    return true;
  }
  dispatch("accounts.error.invalidEmail");
  return false;
};

export function isValidPassword(dispatch: any, password: string) {
  if (password.length < 7) {
    return false;
  }
  return true;
};

export function areValidPasswords(dispatch: IDispatch, password: string, confirm: string) {
  if (!isValidPassword(dispatch, password)) {
    dispatch("accounts.error.differentPasswords");
    return false;
  }
  if (password !== confirm) {
    return false;
  }
  return true;
};
