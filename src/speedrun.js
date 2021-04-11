import {
    convertToHHMMSS,
  } from "./time-util.js";

export async function getTable(message, Runs) {
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
  

  export async function updateRun(Runs, run, theSubmittedTime, seconds, message) {
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
        await getTable(message, Runs);
      } else {
        return message.reply(
          "Well, it should have updated your existing PB there but something went wrong..."
        );
      }
    }
  }

  export async function addRun(Runs, seconds, message, theSubmittedTime) {
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

  function paddedName(name) {
    //   return name.padEnd(33, '.');
    return `${name} - `;
  }
  