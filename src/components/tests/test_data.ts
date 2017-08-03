export const create = {
  testName: 'Luke Skywalker',
  testEmail: 'luke@skywalker.com',
  testPassword: 'password',
  testProfileData: `name\norganisation`,
  testProfile: {
    organisation: 'WSU'
  },
  testToken: '#token',
  user: () => ({
    _id: '1',
    roles: ['role'],
    emails: [{ address: 'luke@skywalker.com', verified: true}],
    profile: {
      name: 'Luke Skywalker',
      organisation: 'WSU'
    }
  })
};
