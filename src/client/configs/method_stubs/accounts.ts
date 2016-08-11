export default function({Meteor}: IAccountsUiContext) {
  Meteor.methods({
    sendVerification: function(email: string) {
      check(email, String);
    },
    addUser: function(data: any) {
      // do nothing
    }
  });
}
