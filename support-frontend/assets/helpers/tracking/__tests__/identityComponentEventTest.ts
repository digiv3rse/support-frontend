import { createAuthenticationEventParams } from "../identityComponentEvent";
describe('createAuthenticationEventParams', () => {
  it('creates authentication event params given a component Id', () => {
    expect(createAuthenticationEventParams('signin_to_contribute')).toBe('componentEventParams=componentType%3Didentityauthentication%26componentId%3Dsignin_to_contribute');
  });
});