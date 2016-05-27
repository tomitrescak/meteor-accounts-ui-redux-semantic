export default function ({ Meteor }) {
    Meteor.methods({
        sendVerification: function (email) {
            check(email, String);
        },
        addUser: function (data) {
            // do nothing
        }
    });
}
