const presence = new Presence({
		//The client ID of the Application created at https://discordapp.com/developers/applications
		clientId: '000000000000000000',
	}),
	//You can use this to get translated strings in their browser language
	strings = presence.getStrings({
		play: 'presence.playback.playing',
		pause: 'presence.playback.paused',
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
// You use these for all non element images
enum Assets {
	Logo = '', // You should the imgur logo in here
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

/*
function myOutsideHeavyLiftingFunction(){
    //Grab and process all your data here

    // element grabs //
    // api calls //
    // variable sets //
}

setInterval(myOutsideHeavyLiftingFunction, 10000);
//Run the function separate from the UpdateData event every 10 seconds to get and set the variables which UpdateData picks up
*/

presence.on('UpdateData', async () => {
	/*UpdateData is always firing, and therefore should be used as your refresh cycle, or `tick`. This is called several times a second where possible.

    It is recommended to set up another function outside of this event function which will change variable values and do the heavy lifting if you call data from an API.*/

	const presenceData: PresenceData = {
		//The large image on the presence. This can be a key of an image uploaded to imgur.
		largeImageKey: Assets.Logo,
		//The small image on the presence. This can be a key of an image uploaded to imgur that has been added to the enum Assets.
		smallImageKey: 'https://mycrazywebsite.com/coolImage.png',
		//The text which is displayed when hovering over the small image
		smallImageText: 'Some hover text',
		//The upper section of the presence text
		details: 'Browsing Page Name',
		//The lower section of the presence text
		state: 'Reading section A',
		//The unix epoch timestamp for when to start counting from
		startTimestamp: browsingTimestamp,
		//If you want to show Time Left instead of Elapsed, this is the unix epoch timestamp at which the timer ends
		endTimestamp: 3133700400000,
		//Optionally you can set a largeImageKey here and change the rest as variable subproperties, for example presenceData.type = "blahblah"; type examples: details, state, etc.
	};
	//Update the presence with all the values from the presenceData object
	if (presenceData.details) presence.setActivity(presenceData);
	//Update the presence with no data, therefore clearing it and making the large image the Discord Application icon, and the text the Discord Application name
	else presence.setActivity();
});
