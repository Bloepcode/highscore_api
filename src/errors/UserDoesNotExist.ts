export default class UserDoesNotExist extends Error {
  constructor(Username: string) {
    const msg = `User does not exist: ${Username}`;
    super(msg);
  }
}
