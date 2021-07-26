const Discord = require('discord.js');
const client = new Discord.Client();
const { quoteList } = require('./data/quotes.js');

client.on('ready', () => {
	console.log('Ready!');
	client.user.setPresence({ activity: { name: `type help to get help with starting a game`}, status: 'online' });
});


let roundCounter, quote, input, date, time1, time2;
let inFight = false;

let users = {};
let healthPlayers = {};
healthPlayers[0] = 100;
healthPlayers[1] = 100;

client.on(`message`, message => {
	if (message.author.bot) return;
	
	if ((message.content.startsWith(`end`))&&(message.author.username==users[0]||message.author.username==users[1])) {
		inFight=false
		healthPlayers[0] = 100;
		healthPlayers[1] = 100;
		users[0] = "";
		users[1] = "";
		roundCounter = 0;
		message.channel.send(`Game ended`);
		return;
	}

	if (message.content.startsWith(`help`)) {
		message.channel.send(`Hi! This is Bobo. I run a typing game. Start a game by typing "fite @player". \nType "example" to see an example command to start a fite. \nType "end" to end an in-progress game (Only executed if it's sent by players in game).`)
	}

	if (message.content.startsWith(`example`)) {
		message.channel.send(`Example fite start command on line below: \nfite @bob`);
	}

	if (message.content.startsWith(`fite`)) {
		if (inFight) {
			message.reply(`Already in a fight.`);
			return;
		}
		if (message.mentions.users.first().bot) {
			message.reply(`you can't fight bots, mate. It's against PETB (People for the Ethical Treatment of Bots).`);
			return;
		}
		users[0] = message.author.username;
		users[1] = message.mentions.users.first().username;
		
		roundCounter = 0;
		message.channel.send(`${users[0]} is fighting ${users[1]}.`);
		inFight = true;

		message.channel.send(`${users[0]}, it's your turn!`);
		message.channel.send(`Type in the quote below as fast as you can`);
		date = new Date;
		time1 = date.getTime();
		setTimeout(function() {
			quote = quoteList[Math.floor(Math.random()*quoteList.length)];
			message.channel.send(quote);
		}, 4700);
		
		
		return;
	}
	


	if (inFight) {
		if (message.author.username == users[roundCounter%2]) {
			date = new Date;
			time2 = date.getTime();
			let accuracy = 0;
			input = message.content;
			accuracy = accuracyCheck(input, quote);
			accuracy = Math.round(accuracy*100)/100;
			message.channel.send(`Your typing accuracy is: ` + String(accuracy) + `%.`);
			let wpm = typingSpeed(time1, time2, quote);
			message.channel.send(`Your typing speed is: ` + String(wpm) + `WPM.`);
			let damage = damageCalculator(accuracy, wpm);
			healthPlayers[(roundCounter+1)%2] = healthPlayers[(roundCounter+1)%2] - damage;
			if (healthPlayers[(roundCounter+1)%2]<1) {
				message.channel.send(`This attack did ` + String(damage) + ` damage to ${users[(roundCounter+1)%2]}. ${users[(roundCounter+1)%2]} perished due to their injuries. ${users[((roundCounter)%2)]} is the winner!`);
				inFight=false
				healthPlayers[0] = 100;
				healthPlayers[1] = 100;
				users[0] = "";
				users[1] = "";
				roundCounter = 0;
				return;
			} else {
				message.channel.send(`This attack did ` + String(damage) + ` damage to ${users[(roundCounter+1)%2]}. ${users[(roundCounter+1)%2]} is now at ` + healthPlayers[(roundCounter+1)%2] + ".");
				roundCounter++;
			}
			
			message.channel.send(`${users[(roundCounter%2)]}, it's your turn!`);
			message.channel.send(`Type in the quote below as fast as you can: `);
			quote = quoteList[Math.floor(Math.random()*quoteList.length)];
			message.channel.send(quote);
			date = new Date;
			time1 = date.getTime();
		} 
	} else {
		return;
	}
	
});
function accuracyCheck(string1, string2) {
	let i;
	let mistakes = 0;
	for(i=0;i<string2.length;i++) {
		if (string1.charAt(i) == string2.charAt(i)) { 
		} else {
			mistakes++;
		}
	}
	mistakes = (string2.length-mistakes)/string2.length;
	return mistakes*100;
}

function typingSpeed(time1, time2, string2) {
	let timeTaken = ((time2-time1-4700)/1000)/60;
	let wpm = (string2.length / timeTaken)/5;
	wpm = Math.round(wpm);
	return wpm;
}

function damageCalculator(accuracy, wpm) {
	let damage =  (wpm/3.2)*(accuracy/95);
	damage = Math.round(damage);
	return damage;
}

client.login(token);



