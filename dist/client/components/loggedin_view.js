import React from "react";
const View = ({ signOut, context }) => {
    const mf = context.i18n.initTranslator("accounts");
    return (React.createElement("div", {className: "ui primary button", onClick: signOut}, mf("signOut")));
};
export default View;
