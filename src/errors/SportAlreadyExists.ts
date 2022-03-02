export default class SportAlreadyExists extends Error {
  constructor(sportName: string) {
    const msg = `Sport already exists: ${sportName}`;
    super(msg);
  }
}
