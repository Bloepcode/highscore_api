import Database from "../database";
import SportAlreadyExists from "../errors/SportAlreadyExists";
import SportDoesNotExist from "../errors/SportDoesNotExist";
import UserAlreadyExists from "../errors/UserAlreadyExists";
import UserDoesNotExist from "../errors/UserDoesNotExist";

const testUsername = "user1";
const testSportname = "sport1";
const testHighscore = 12;

test("Create database", () => {
  const db = new Database();
  expect(db).toBeDefined();
  db.disconnect();
});

test("Add sport", async () => {
  const db = new Database();
  expect(await db.addSport(testSportname)).toBe(true);
  db.disconnect();
});

test("Get sports", async () => {
  const db = new Database();
  const sports = await db.getSports();
  expect(sports[sports.length - 1]).toEqual({ name: testSportname });
  db.disconnect();
});

test("Add sport that already exists", () => {
  const db = new Database();
  expect(db.addSport(testSportname)).rejects.toThrow(SportAlreadyExists);
  db.disconnect();
});

test("Add user", async () => {
  const db = new Database();
  expect(await db.addUser(testUsername)).toBe(true);
  db.disconnect();
});

test("Get users", async () => {
  const db = new Database();
  const users = await db.getUsers();
  expect(users[users.length - 1]).toEqual({ name: testUsername });
  db.disconnect();
});

test("Add user that already exists", () => {
  const db = new Database();
  expect(db.addUser(testUsername)).rejects.toThrow(UserAlreadyExists);
  db.disconnect();
});

test("Set highscore of non-existing sport", async () => {
  const db = new Database();
  expect(db.setSportScoreOfUser("sport2", testUsername, 12)).rejects.toThrow(
    SportDoesNotExist
  );
  db.disconnect();
});

test("Set highscore of non-existing user", async () => {
  const db = new Database();
  expect(db.setSportScoreOfUser(testSportname, "user2", 12)).rejects.toThrow(
    UserDoesNotExist
  );
  db.disconnect();
});

test("Set highscore", async () => {
  const db = new Database();
  expect(
    await db.setSportScoreOfUser(testSportname, testUsername, testHighscore)
  );
  db.disconnect();
});

test("Get highscores of non-existing sport", async () => {
  const db = new Database();
  expect(db.getSportHighScores("sport2")).rejects.toThrow(SportDoesNotExist);
  db.disconnect();
});

test("Get highscores", async () => {
  const db = new Database();
  const scores = await db.getSportHighScores(testSportname);
  expect(scores[0]).toEqual({ username: testUsername, score: testHighscore });
  db.disconnect();
});

test("Delete user that does not exist", async () => {
  const db = new Database();
  expect(db.removeUser("user2")).rejects.toThrow(UserDoesNotExist);
  db.disconnect();
});

test("Delete user", async () => {
  const db = new Database();
  expect(await db.removeUser(testUsername)).toBe(true);
  db.disconnect();
});

test("Get users that are deleted", async () => {
  const db = new Database();
  const users = await db.getUsers();
  expect(users.length).toEqual(0);
  db.disconnect();
});

test("Delete sport that does not exist", async () => {
  const db = new Database();
  expect(db.removeSport("sport2")).rejects.toThrow(SportDoesNotExist);
  db.disconnect();
});

test("Delete sport", async () => {
  const db = new Database();
  expect(await db.removeSport(testSportname)).toBe(true);
  db.disconnect();
});

test("Get sports that are deleted", async () => {
  const db = new Database();
  const sports = await db.getSports();
  expect(sports.length).toEqual(0);
  db.disconnect();
});
