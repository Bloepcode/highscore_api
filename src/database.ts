import { PrismaClient } from "@prisma/client";

import log from "./logger";
import SportAlreadyExists from "./errors/SportAlreadyExists";
import UserAlreadyExists from "./errors/UserAlreadyExists";
import SportDoesNotExist from "./errors/SportDoesNotExist";
import UserDoesNotExist from "./errors/UserDoesNotExist";

interface scoreI {
  score: number;
  username: string;
}

class Database {
  prisma;

  constructor() {
    this.prisma = new PrismaClient();
    log.info("Database connected");
  }

  async disconnect() {
    this.prisma.$disconnect();
    log.info("Database disconnected");
  }

  // Add user
  async addUser(username: string): Promise<boolean> {
    const usernames = await this.prisma.user.count({
      where: {
        name: username,
      },
    });
    if (usernames > 0) {
      throw new UserAlreadyExists(username);
    }
    await this.prisma.user.create({
      data: {
        name: username,
      },
    });
    return true;
  }

  // Remove a user
  async removeUser(username: string): Promise<boolean> {
    await this.prisma.score.deleteMany({
      where: {
        user: {
          name: username,
        },
      },
    });

    const user = await this.prisma.user.findFirst({
      where: {
        name: username,
      },
    });
    if (!user) {
      throw new UserDoesNotExist(username);
    }

    await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    return true;
  }

  // Add sport
  async addSport(sportName: string): Promise<boolean> {
    const sports = await this.prisma.sport.count({
      where: {
        name: sportName,
      },
    });
    if (sports > 0) {
      throw new SportAlreadyExists(sportName);
    }
    await this.prisma.sport.create({
      data: {
        name: sportName,
      },
    });
    return true;
  }

  // Remove sport
  async removeSport(sportName: string): Promise<boolean> {
    await this.prisma.score.deleteMany({
      where: {
        sport: {
          name: sportName,
        },
      },
    });

    const sport = await this.prisma.sport.findFirst({
      where: {
        name: sportName,
      },
    });
    if (!sport) {
      throw new SportDoesNotExist(sportName);
    }

    await this.prisma.sport.delete({
      where: {
        id: sport.id,
      },
    });
    return true;
  }

  // Get sports
  async getSports() {
    return await this.prisma.sport.findMany({ select: { name: true } });
  }

  // Get users
  async getUsers() {
    return await this.prisma.user.findMany({ select: { name: true } });
  }

  // Get sport scores
  async getSportHighScores(sportName: string) {
    const sport = await this.prisma.sport.findFirst({
      where: {
        name: sportName,
      },
    });
    if (!sport) {
      throw new SportDoesNotExist(sportName);
    }

    const scores = await this.prisma.score.findMany({
      where: {
        sportId: sport.id,
      },
      select: {
        user: true,
        score: true,
      },
    });

    const returnScores: scoreI[] = [];

    scores.forEach((score) => {
      returnScores.push({ score: score.score, username: score.user.name });
    });
    returnScores.sort((a, b) => a.score - b.score);
    return returnScores;
  }

  // Set sport high score of user
  async setSportScoreOfUser(
    sportName: string,
    username: string,
    highscore: number
  ): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        name: username,
      },
    });
    if (!user) {
      throw new UserDoesNotExist(username);
    }
    const sport = await this.prisma.sport.findFirst({
      where: {
        name: sportName,
      },
    });
    if (!sport) {
      throw new SportDoesNotExist(sportName);
    }
    const score = await this.prisma.score.findFirst({
      where: {
        user: {
          name: username,
        },
        sport: {
          name: sportName,
        },
      },
    });
    if (score) {
      await this.prisma.score.update({
        where: {
          id: score.id,
        },
        data: {
          score: highscore,
        },
      });
    } else {
      await this.prisma.score.create({
        data: {
          score: highscore,
          userId: user.id,
          sportId: sport.id,
        },
      });
    }
    return true;
  }
}

export default Database;
