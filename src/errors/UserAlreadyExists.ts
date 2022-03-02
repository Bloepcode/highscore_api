export default class UserAlreadyExists extends Error {
  constructor(username: string) {
    const msg = `User already exists: ${username}`;
    super(msg);
  }
}
