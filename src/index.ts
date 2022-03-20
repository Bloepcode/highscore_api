import * as dotenv from "dotenv";
import express from "express";
import { Request } from "express";
import cors from "cors";
import helmet from "helmet";
import log from "./logger";
import Database from "./database";
import errorCodes from "./errors";
import { hashApiKey, generateApiKey, verifyApiKey } from "./verify";
import SportAlreadyExists from "./errors/SportAlreadyExists";
import UserAlreadyExists from "./errors/UserAlreadyExists";
import SportDoesNotExist from "./errors/SportDoesNotExist";
import UserDoesNotExist from "./errors/UserDoesNotExist";

interface ErrorResponseI {
  success: boolean;
  code: string;
}
interface SuccessResponseI {
  success: boolean;
}

async function main() {
  dotenv.config();

  if (!process.env.PORT) {
    log.error("No PORT specified in .env file");
    return;
  }
  if (!process.env.DATABASE_URL) {
    log.error("No DATABASE_URL specified in .env file");
    return;
  }
  if (!process.env.API_HASH) {
    log.error("No API_HASH specified in .env file");
    log.info("Generating an API key");
    const apiKey = generateApiKey();
    const apiHash = hashApiKey(apiKey);
    log.info(`API key: ${apiKey}`);
    log.info("Please update your .env file with the following values:");
    log.info(`API_HASH=${apiHash}`);
    return;
  }
  const API = process.env.API_HASH;

  const PORT: number = parseInt(process.env.PORT as string, 10);

  const app = express();

  const db = new Database();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  //
  // Add sport
  //
  app.post(
    "/sport/:sportname?:api_key",
    async (req: Request<{ sportname: string; api_key: string }>, res) => {
      log.info("POST at: /sport/:sportname");
      if (!verifyApiKey(API, req.params.api_key)) {
        const error: ErrorResponseI = {
          success: false,
          code: errorCodes.incorrectApi,
        };
        res.json(error);
        return;
      }
      try {
        await db.addSport(req.params.sportname);
      } catch (e) {
        if (e instanceof SportAlreadyExists) {
          const error: ErrorResponseI = {
            success: false,
            code: errorCodes.sportAlreadyExists,
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
    }
  );

  //
  // Remove sport
  //
  app.delete("/sport/:sportname", async (req, res) => {
    log.info("DELETE at: /sport/:sportname");
    try {
      await db.removeSport(req.params.sportname);
    } catch (e) {
      if (e instanceof SportDoesNotExist) {
        const error: ErrorResponseI = {
          success: false,
          code: errorCodes.sportDoesNotExist,
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
  app.post("/user/:username", async (req, res) => {
    log.info("POST at: /user/:username");
    try {
      await db.addUser(req.params.username);
    } catch (e) {
      if (e instanceof UserAlreadyExists) {
        const error: ErrorResponseI = {
          success: false,
          code: errorCodes.userAlreadyExists,
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
  app.delete("/user/:username", async (req, res) => {
    log.info("DELETE at: /user/:username");
    try {
      await db.removeUser(req.params.username);
    } catch (e) {
      if (e instanceof UserDoesNotExist) {
        const error: ErrorResponseI = {
          success: false,
          code: errorCodes.userDoesNotExist,
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
  app.post(
    "/sports/:sportname/users/:username/set/:highscore",
    async (req, res) => {
      log.info("POST at: /sports/:sportname/users/:username/set/:highscore");
      if (isNaN(parseFloat(req.params.highscore))) {
        const error: ErrorResponseI = {
          success: false,
          code: errorCodes.highscoreNotAnNumber,
        };
        res.json(error);
        return;
      }
      try {
        await db.setSportScoreOfUser(
          req.params.sportname,
          req.params.username,
          parseFloat(req.params.highscore)
        );
      } catch (e) {
        if (e instanceof SportDoesNotExist) {
          const error: ErrorResponseI = {
            success: false,
            code: errorCodes.sportDoesNotExist,
          };
          res.json(error);
          return;
        } else if (e instanceof UserDoesNotExist) {
          const error: ErrorResponseI = {
            success: false,
            code: errorCodes.userDoesNotExist,
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
    }
  );

  //
  // Get sports
  //
  app.get("/sports", async (req, res) => {
    log.info("GET at: /sports");
    res.json(await db.getSports());
  });

  //
  // Get users
  //
  app.get("/users", async (req, res) => {
    log.info("GET at: /users");
    res.json(await db.getUsers());
  });

  //
  // Get scores
  //
  app.get("/sport/:sport/scores", async (req, res) => {
    log.info("GET at: /sport/:sport/scores");
    try {
      res.json(await db.getSportHighScores(req.params.sport));
    } catch (e) {
      if (e instanceof SportDoesNotExist) {
        const error: ErrorResponseI = {
          success: false,
          code: errorCodes.sportDoesNotExist,
        };
        res.json(error);
      } else {
        throw e;
      }
    }
  });

  app.listen(PORT, () => {
    log.info(`Server listening on port ${PORT}`);
  });
}

main();
