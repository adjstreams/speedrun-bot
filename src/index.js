import dotenv from "dotenv";
import { Client } from "discord.js";
import { ping } from "./ping.js";
import {
  calculateSeconds,
  isValidTimeFormat,
} from "./time-util.js";
import Sequelize from "sequelize";
import { getTable, updateRun, addRun } from "./speedrun.js";
import { runModel } from "./runs.model.js";

dotenv.config();

console.clear();
console.log("\x1Bc");
const client = new Client();

client.login(process.env.BOT_TOKEN).catch(console.error);
const prefix = "!";

var dialectOptions = {
  ssl: false,
};

if (process.env.ENABLE_SSL === "true") {
  dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  ssl: process.env.ENABLE_SSL,
  dialectOptions: dialectOptions,
});

const Runs = runModel(sequelize, Sequelize.DataTypes);

client.once("ready", () => {
  Runs.sync();
  console.log("Speedrun Bot started");
});

client.on("message", async (message) => {

  // Needs further refactoring
  // i.e. 
  // middleware to handle validation of input
  // separating out database interaction from discord message responses
  // pass an object into methods rather than strings
  // Also, consider converting to typescript

  if (message.author.bot) {
    return;
  }
  if (!message.content.startsWith(prefix)) {
    return;
  }

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    ping(message);
  }

  if (command === "speedrun") {
    if (args.length === 0) {
      return await getTable(message, Runs);
    }

    const subcommand = args.shift().toLowerCase();

    if (subcommand === "add") {
      if (args.length > 1) {
        return message.reply(
          "Uh oh, add a speedrun using the format !speedrun add hh:mm:ss."
        );
      }

      const theSubmittedTime = args.join(" ");

      if (!isValidTimeFormat(theSubmittedTime)) {
        return message.reply(
          "Uh oh, that time doesn't look right, needs to be hh:mm:ss, or just mm:ss."
        );
      }

      var seconds = calculateSeconds(theSubmittedTime);

      const run = await Runs.findOne({
        where: { discord_name: message.author.username },
      });
      if (run) {
        updateRun(Runs, run, theSubmittedTime, seconds, message);
      } else {
        addRun(Runs, seconds, message, theSubmittedTime); 
      }
    }
  }
});
