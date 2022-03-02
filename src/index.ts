import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import Database from "./database";
import SportAlreadyExists from "./errors/SportAlreadyExists";
import UserAlreadyExists from "./errors/UserAlreadyExists";
import NotAnHighScore from "./errors/NotAnHighScore";
import SportDoesNotExist from "./errors/SportDoesNotExist";
import UserDoesNotExist from "./errors/UserDoesNotExist";

interface ErrorResponseI {
  success: boolean;
  error: string;
  code: string;
}
interface SuccessResponseI {
  success: boolean;
}

dotenv.config();

if (!process.env.PORT || !process.env.DB_FILE) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

const db = new Database(process.env.DB_FILE);

app.use(helmet());
app.use(cors());
app.use(express.json());

//
// Add sport
//
app.post("/sport/:sportname", (req, res) => {
  try {
    db.addSport(req.params.sportname);
  } catch (e) {
    if (e instanceof SportAlreadyExists) {
      const error: ErrorResponseI = {
        success: false,
        error: "Sport already exists",
        code: "sport_already_exists",
      };
      res.json(error);
      return;
    } else {
      throw e;
    }
  }

  const success: SuccessResponseI = {
    success: true,
  };
  res.json(success);
});

//
// Remove sport
//
app.delete("/sport/:sportname", (req, res) => {
  try {
    db.removeSport(req.params.sportname);
  } catch (e) {
    if (e instanceof SportDoesNotExist) {
      const error: ErrorResponseI = {
        success: false,
        error: "Sport does not exist",
        code: "sport_does_not",
      };
      res.json(error);
      return;
    } else {
      throw e;
    }
  }

  const success: SuccessResponseI = {
    success: true,
  };
  res.json(success);
});

//
// Add user
//
app.post("/user/:username", (req, res) => {
  try {
    db.addUser(req.params.username);
  } catch (e) {
    if (e instanceof UserAlreadyExists) {
      const error: ErrorResponseI = {
        success: false,
        error: "Username already exists",
        code: "username_already_exists",
      };
      res.json(error);
      return;
    } else {
      throw e;
    }
  }

  const success: SuccessResponseI = {
    success: true,
  };
  res.json(success);
});

//
// Remove user
//
app.delete("/user/:username", (req, res) => {
  try {
    db.removeUser(req.params.username);
  } catch (e) {
    if (e instanceof UserDoesNotExist) {
      const error: ErrorResponseI = {
        success: false,
        error: "User does not exist",
        code: "user_does_not",
      };
      res.json(error);
      return;
    } else {
      throw e;
    }
  }

  const success: SuccessResponseI = {
    success: true,
  };
  res.json(success);
});

//
// Set highscore
//
app.post("/sports/:sportname/users/:username/set/:highscore", (req, res) => {
  if (isNaN(parseFloat(req.params.highscore))) {
    const error: ErrorResponseI = {
      success: false,
      error: "Highscore is not a number!",
      code: "NaN",
    };
    res.json(error);
    return;
  }
  try {
    db.setSportScoreOfUser(
      req.params.sportname,
      req.params.username,
      parseFloat(req.params.highscore),
      false
    );
  } catch (e) {
    if (e instanceof NotAnHighScore) {
      const error: ErrorResponseI = {
        success: false,
        error: "Not a new highscore!",
        code: "not_a_highscore",
      };
      res.json(error);
      return;
    } else {
      throw e;
    }
  }
  const success: SuccessResponseI = {
    success: true,
  };
  res.json(success);
});

//
// Overwrite score
//
app.post(
  "/sports/:sportname/users/:username/overwrite/:highscore",
  (req, res) => {
    if (isNaN(parseFloat(req.params.highscore))) {
      const error: ErrorResponseI = {
        success: false,
        error: "Highscore is not a number!",
        code: "NaN",
      };
      res.json(error);
      return;
    }

    db.setSportScoreOfUser(
      req.params.sportname,
      req.params.username,
      parseFloat(req.params.highscore),
      true
    );
    const success: SuccessResponseI = {
      success: true,
    };
    res.json(success);
  }
);

//
// Get sports
//
app.get("/sports", (req, res) => {
  res.json(db.getSports());
});

//
// Get users
//
app.get("/users", (req, res) => {
  res.json(db.getUsers());
});

//
// Get users
//
app.get("/sport/:sport/scores", (req, res) => {
  try {
    res.json(db.getSportHighScores(req.params.sport));
  } catch (e) {
    if (e instanceof SportDoesNotExist) {
      const error: ErrorResponseI = {
        success: false,
        error: "Sport does not exist",
        code: "sport_does_not",
      };
      res.json(error);
    } else {
      throw e;
    }
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
