require('dotenv').config()
const Discord = require('discord.js')
//const config = require('./config.json')
const ping = require('./ping.js')
const Sequelize = require('sequelize');

console.clear()
console.log('\x1Bc')
const client = new Discord.Client()

client.login(process.env.BOT_TOKEN).catch(console.error)
const prefix = '!'

const sequelize = new Sequelize(process.env.DATABASE_URL, 
{
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: true
    }
});

const Runs = sequelize.define('runs', {
	discord_name: {
		type: Sequelize.STRING,
		unique: true
	},
	run_time: Sequelize.INTEGER
});

client.once('ready', () => {
    Runs.sync();
    console.log('Speedrun Bot started');
});

client.on('message', async message => {
    if (message.author.bot) {
        return
    }
    if (!message.content.startsWith(prefix)) {
        return
    }

    const commandBody = message.content.slice(prefix.length)
    const args = commandBody.split(' ')
    const command = args.shift().toLowerCase()

    if (command === 'ping') {
        ping(message)
    }

    if (command === 'speedrun') {
        if (args.length === 0) {
            const runList = await Runs.findAll({ attributes: ['discord_name', 'run_time'], order: [
                ['run_time', 'ASC']
            ] });
            var runString = '';
            var i = 1;
            runList.forEach(element => {
                runString = `${i}\t\t${element.get('discord_name')}\t\t\t${convertToHHMMSS(element.get('run_time'))}\n`
            }) 

            return message.channel.send(`\nSpeed Run Leaderboard:\n\n ${runString}`);
        }

        const subcommand = args.shift().toLowerCase();

        if (subcommand === 'add') {
            var re = new RegExp("^([a-z0-9]{5,})$");

            if (re.test(args)) {
                return message.reply('Uh oh, that time doesn\'t look right, needs to be hh:mm:ss, or just mm:ss.');
            }

            var seconds = calculateSeconds(args.join(' '))
 
            const run = await Runs.findOne({ where: { discord_name: message.author.username } });
            if (run) {
                var current_seconds = run.get('run_time');
                var hms = convertToHHMMSS(current_seconds)

                if (seconds >= current_seconds) {
                    return message.reply(`This time was not faster than your existing PB of ${hms}`);
                } else {
                    // update the run
                    const affectedRows = await Runs.update({ run_time: seconds }, { where: { discord_name: message.author.username } });
                    if (affectedRows > 0) {
                        return message.reply(`Run of ${args} updated for ${message.author.username}. Congratulations on beating your old PB of ${hms}!`);
                    } else {
                        return message.reply('Well, it should have updated your existing PB there but something went wrong...');
                    }
                }
            } else {
                try {
                    const run = await Runs.create({
                        discord_name: message.author.username,
                        run_time: seconds
                    });
        
                    return message.reply(`Run of ${args} added for ${message.author.username}`);
                }
                catch (e) {
                    if (e.name === 'SequelizeUniqueConstraintError') {
                        return message.reply('That run already exists, but for some reason it didn\'t update?!');
                    }
                    return message.reply('Something went wrong with adding a run.');
                }
    
            }

        }
    }
})

function calculateSeconds(hms) {
    var a = hms.split(':'); 

    if (a.length === 3) {
        return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
    }
    else if (a.length === 2) {
        return ((+a[0] * 60) + (+a[1])); 
    }
    else if (a.length === 1) {
        return (+a[0]); 
    }
}

function convertToHHMMSS(seconds) {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}