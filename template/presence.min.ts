const presence = new Presence({
		clientId: '',
	}),
	strings = presence.getStrings({
		play: 'presence.playback.playing',
		pause: 'presence.playback.paused',
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum Assets {
	Logo = '',
	Play = 'https://i.imgur.com/lytENvp.png',
	Pause = 'https://i.imgur.com/NT77akx.png',
	Stop = 'https://i.imgur.com/8p9PINr.png',
	Search = 'https://i.imgur.com/ZVhazc7.png',
	Question = 'https://i.imgur.com/lqguVta.png',
	Live = 'https://i.imgur.com/n1AUYFX.png',
	Reading = 'https://i.imgur.com/PcbCZRj.png',
	Writing = 'https://i.imgur.com/jMdmkI9.png',
	Call = 'https://i.imgur.com/ujw4zJ9.png',
	Vcall = 'https://i.imgur.com/Lvxb6qi.png',
	Downloading = 'https://i.imgur.com/qPZwsd6.png',
	Uploading = 'https://i.imgur.com/ZdDRxeo.png',
	Repeat = 'https://i.imgur.com/mJ1qyqC.png',
	RepeatOne = 'https://i.imgur.com/kKqrQlA.png',
	Premiere = 'https://i.imgur.com/qiO6Yc0.png',
	PremiereLive = 'https://i.imgur.com/W97FVF6.png',
	Viewing = 'https://i.imgur.com/sNXN6K4.png',
}

presence.on('UpdateData', async () => {
	const presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
		startTimestamp: browsingTimestamp,
	};

	presence.setActivity(presenceData);
});
