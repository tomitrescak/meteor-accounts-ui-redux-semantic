import actions from "./actions/index";
import methodStubs from "./configs/method_stubs/accounts";
import accountsConfig from "./configs/accounts_config";
import i18n from "./configs/i18n";
export default {
    actions,
    load(context) {
        methodStubs(context);
        accountsConfig();
        i18n(context);
    }
};
