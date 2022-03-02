import { readFileSync, writeFileSync } from "fs";
import dbI from "./interfaces/db.interface";
import sportI from "./interfaces/sport.interface";
import userI from "./interfaces/user.interface";
import SportAlreadyExists from "./errors/SportAlreadyExists";
import UserAlreadyExists from "./errors/UserAlreadyExists";
import SportDoesNotExist from "./errors/SportDoesNotExist";
import NotAnHighScore from "./errors/NotAnHighScore";
import UserDoesNotExist from "./errors/UserDoesNotExist";

class Database {
  dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    try {
      let rawData = readFileSync(dbPath, "utf8");
    } catch (e) {
      this.initalizeDatabase();
    }
  }

  // Initalize an empty database
  initalizeDatabase() {
    var db: dbI = {
      users: [],
      sportList: [],
      sports: [],
    };

    this.setDatabase(db);
  }

  getDatabase(): dbI {
    let rawData = readFileSync(this.dbPath, "utf8");
    var db: dbI = JSON.parse(rawData);
    return db;
  }

  setDatabase(db: dbI) {
    const rawData = JSON.stringify(db);
    writeFileSync(this.dbPath, rawData, "utf8");
  }

  // Create empty users list
  emptyUsers(db: dbI): userI[] {
    var users: userI[] = [];
    for (let i = 0; i < db.users.length; i++) {
      const userName = db.users[i];
      const user: userI = {
        name: userName,
        highScore: 0,
      };
      users.push(user);
    }
    return users;
  }

  // Add user
  addUser(username: string) {
    var db = this.getDatabase();

    db.users.forEach((user) => {
      if (user == username) {
        throw new UserAlreadyExists(username);
      }
    });
    db.users.push(username);

    var emptyUser: userI = {
      name: username,
      highScore: 0,
    };

    db.sports.forEach((sport) => {
      sport.users.push(emptyUser);
    });

    this.setDatabase(db);
  }

  // Remove a user
  removeUser(username: string) {
    var db = this.getDatabase();

    for (let i = 0; i < db.users.length; i++) {
      if (db.users[i] == username) {
        db.users.splice(i, 1);
        db.sports.forEach((sport) => {
          for (let j = 0; j < sport.users.length; j++) {
            const user = sport.users[j];
            if (user.name == username) {
              sport.users.splice(j, 1);
              break;
            }
          }
        });
        this.setDatabase(db);
        return;
      }
    }
    throw new UserDoesNotExist(username);
  }

  // Add sport
  addSport(sportName: string) {
    var db = this.getDatabase();

    // Check if sport already exists
    db.sports.forEach((sport) => {
      if (sport.name == sportName) {
        // Throw error if sport already exists
        throw new SportAlreadyExists(sportName);
      }
    });

    db.sportList.push(sportName);

    // Create the sport with empty valuas for each user
    var sport: sportI = {
      name: sportName,
      users: this.emptyUsers(db),
    };
    db.sports.push(sport);
    this.setDatabase(db);
  }

  // Remove sport
  removeSport(sportName: string) {
    var db = this.getDatabase();

    // Check if the sport exists
    for (let i = 0; i < db.sports.length; i++) {
      if (db.sports[i].name == sportName) {
        db.sports.splice(i, 1);
        for (let j = 0; j < db.sportList.length; j++) {
          if (db.sportList[j] == sportName) {
            db.sportList.splice(j, 1);
            this.setDatabase(db);
            return;
          }
        }
      }
    }

    throw new SportDoesNotExist(sportName);
  }

  // Get sports
  getSports() {
    var db = this.getDatabase();
    return db.sportList;
  }

  // Get users
  getUsers() {
    var db = this.getDatabase();
    return db.users;
  }

  // Get sport scores
  getSportHighScores(sportName: string) {
    var db = this.getDatabase();
    for (let i = 0; i < db.sports.length; i++) {
      const sport = db.sports[i];
      if (sport.name == sportName) {
        var users = sport.users;

        users.sort((a, b) =>
          a.highScore > b.highScore ? 1 : b.highScore > a.highScore ? -1 : 0
        );

        return users;
      }
    }

    throw new SportDoesNotExist(sportName);
  }

  // Set sport high score of user
  setSportScoreOfUser(
    sportName: string,
    username: string,
    highscore: number,
    overwrite: boolean
  ) {
    var db = this.getDatabase();

    db.sports.forEach((sport) => {
      if (sport.name == sportName) {
        sport.users.forEach((user) => {
          if (user.name == username) {
            if (user.highScore < highscore) {
              user.highScore = highscore;
              this.setDatabase(db);
              return;
            } else {
              if (overwrite) {
                user.highScore = highscore;
                this.setDatabase(db);
                return;
              } else {
                throw new NotAnHighScore(highscore, user.highScore);
              }
            }
          }
        });
      }
    });
  }
}

export default Database;
