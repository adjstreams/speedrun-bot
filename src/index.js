import dotenv from "dotenv";
import { Client } from "discord.js";
import { ping } from "./ping.js";
import {
  calculateSeconds,
  convertToHHMMSS,
  isValidTimeFormat,
} from "./time-util.js";
import Sequelize from "sequelize";

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
      return await getTable(message);
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
        var current_seconds = run.get("run_time");
        var hms = convertToHHMMSS(current_seconds);

        if (seconds >= current_seconds) {
          return message.reply(
            `This time was not faster than your existing PB of ${hms}`
          );
        } else {
          // update the run
          const affectedRows = await Runs.update(
            { run_time: seconds },
            { where: { discord_name: message.author.username } }
          );
          if (affectedRows > 0) {
            message.reply(
              `Run of ${theSubmittedTime} updated for ${message.author.username}. Congratulations on beating your old PB of ${hms}!`
            );
            await getTable(message);
          } else {
            return message.reply(
              "Well, it should have updated your existing PB there but something went wrong..."
            );
          }
        }
      } else {
        try {
          await Runs.create({
            discord_name: message.author.username,
            run_time: seconds,
          });

          message.reply(
            `Run of ${theSubmittedTime} added for ${message.author.username}`
          );
          await getTable(message);
        } catch (e) {
          if (e.name === "SequelizeUniqueConstraintError") {
            return message.reply(
              "That run already exists, but for some reason it didn't update?!"
            );
          }
          return message.reply("Something went wrong with adding a run.");
        }
      }
    }
  }
});

function paddedName(name) {
  //   return name.padEnd(33, '.');
  return `${name} - `;
}

async function getTable(message) {
  const runList = await Runs.findAll({
    attributes: ["discord_name", "run_time"],
    order: [["run_time", "ASC"]],
  });
  var runString = "";
  var i = 1;
  runList.forEach((element) => {
    runString += `${i}\t\t${paddedName(
      element.get("discord_name")
    )}${convertToHHMMSS(element.get("run_time"))}\n`;
    i++;
  });

  return message.channel.send(`\nSpeed Run Leaderboard:\n\n${runString}`);
}
