const {
	Client,
	Util
} = require('discord.js');
const {
	TOKEN,
	PREFIX,
	GOOGLE_API_KEY
} = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const client = new Client({
	disableEveryone: true
});
const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();
client.on('warn', console.warn);
client.on('error', console.error);
client.on('ready', () => console.log('Ready to go Boss!'));
client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));
client.on('reconnecting', () => console.log('I am reconnecting now!'));
client.on("serverNewMember", function (server, user) {
           msg.addMemberToRole(user, server.roles.get("name", "shadow realm"), function (err) { if (err) console.log(err) })
client.on('message', async msg => {
	if (!msg.content.startsWith(PREFIX)) return undefined;
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)
	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('I\m going to say the n-word!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		if (!permissions.has('SPEAK')) return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id);
				await handleVideo(video2, msg, voiceChannel, true);
			}
			return
			msg.channel.send(`Playlist: **${playlist.title}** has been added to the queue!`)
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
					msg.channel.send(`
__**Song selection:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
Please provide a value to select one of the search results ranging from 1-5.
					`);
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('No or invalid value entered, cancelling video selection.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('I could not obtain any search results.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	}
	else if (command === 'next') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Next command has been used!');
		return undefined;
	}
	else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	}
	else if (command === '7') {
		msg.channel.send('7');
	} else if (command === 'user') {
		msg.channel.send(`Your username: ${msg.author.username}\nYour ID: ${msg.author.id}`);
	} else if (command === 'nword') {
		msg.channel.send("I'm gonna say the N-Word!!");
		msg.channel.send("HATE CRIME ALERT!!!");
		msg.channel.send("HATE CRIME ALERT!!!");
		msg.channel.send("HATE CRIME ALERT!!!");
		msg.channel.send("HATE CRIME ALERT!!!");
	} else if (command === 'hardr') {
		msg.channel.send("May god have mercy on you...");
		msg.channel.send("Yes officers, this racist right here.");
		msg.channel.send("Sir, I'm gonna need to ask you to come with me.");
		msg.channel.send("You're under arrest.");
		msg.channel.send("Pathetic.");
		msg.channel.send("Fucking retard.");
	} else if (command === 'join') {
		const channel = client.channels.get("633934506306568202");
		if (!channel) return console.error("The channel does not exist!");
		channel.join().then(connection => {
			console.log("Successfully connected.");
		}).catch(e => {
			console.error(e);
		});
	} else if (command === 'leave') {
		if (!serverQueue) return msg.channel.send('There is no channel for me to leave!');
		serverQueue.playing = false;
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;
	} else if (command === 'cbt') {
		msg.channel.send("-join")
		msg.channel.send("-play https://youtu.be/EbwRFcoEugQ")
	} else if (command === 'imsosorry') {
		msg.channel.send("-volume 50")
	} else if (command === 'bruh') {
		msg.channel.send("-play https://www.youtube.com/watch?v=9MJ-RuNYILo")
	}
	else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could stop for you.');
		serverQueue.playing = false;
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;
	} else if (command === 'volume') {
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		if (!args[1]) return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 30);
		return msg.channel.send(`I set the volume to: **${args[1]}**`);
	} else if (command === 'help') {
		msg.channel.send('**WELCOME TO SHITTY MUSIC FROM JACOB!**\nUse **-** for commands.\n-help [This command]\n-play (url) [Plays the youtube video specified]\n-stop [Stops bot from making noise and removes from voice chat]\n-skip [Next song in queue]\n-next\n-volume (1-30) **Warning this can get really loud**\n-queue [Displays songs in queue]\n-pause\n-resume');
	} else if (command === 'now') {
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		return msg.channel.send(`Playing: **${serverQueue.songs[0].title}**`);
	} else if (command === 'queue') {
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		return msg.channel.send(`
__**Song queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('Paused the music for you!');
		}
		return msg.channel.send('There is nothing playing.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('Resumed the music for you!');
		}
		return msg.channel.send('There is nothing playing.');
	}
	return undefined;
});
async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 1.5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);
		queueConstruct.songs.push(song);
		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`**${song.title}** has been added to the queue!`);
	}
	return undefined;
}
function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.playing = false;
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url)).on('end', reason => {
		if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
		else console.log(reason);
		serverQueue.songs.shift();
		setTimeout(function() {
			play(guild, serverQueue.songs[0]);
		}, 500);
	}).on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Playing: **${song.title}**`);
}
client.login(TOKEN);
