export default class NotAnHighScore extends Error {
  oldScore;
  newScore;
  constructor(newScore: number, oldScore: number) {
    const msg = `New score ${newScore.toString()} is not higher than ${oldScore}`;
    super(msg);

    this.newScore = newScore;
    this.oldScore = oldScore;
  }
}
