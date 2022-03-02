export default class SportDoesNotExist extends Error {
  constructor(sportName: string) {
    const msg = `Sport does not exist: ${sportName}`;
    super(msg);
  }
}
