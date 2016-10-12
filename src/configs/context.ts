import { __, i18n } from 'i18n-client';
import i18nConfig from './i18n';

// import '../stylesheets/main';

declare global {
  namespace AccountsUI {
    export interface Context {
      i18n: typeof i18n;
      __: typeof __;
    }

    export interface AsyncCallback {
      (error: any, result: any): void;
    }
  }
}

let context: AccountsUI.Context = {
  i18n,
  __
};

// init package
i18nConfig(context);

export default context;
