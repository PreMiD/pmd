const presence = new Presence({
		//The client ID of the Application created at https://discordapp.com/developers/applications
		clientId: "000000000000000000",
	}),
	//You can use this to get translated strings in their browser language
	strings = presence.getStrings({
		play: "presence.playback.playing",
		pause: "presence.playback.paused",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000); // Here you generate the time someone is spending on the page. You divivde the miliseconds to seconds (/ 1000)

const enum Assets { // An Enum for collecting all images (that aren't loaded on the site or are better quality for usage for the presence.
	Logo = "", // You should the logo link in here (Atm imgur links.)
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

presence.on("UpdateData", async () => {
	/*UpdateData is always firing, and therefore should be used as your refresh cycle, or `tick`. This is called several times a second where possible.

    It is recommended to set up another function outside of this event function which will change variable values and do the heavy lifting if you call data from an API.*/

	const presenceData: PresenceData = {
		//The large image on the presence. This can be a key of an image uploaded to imgur.
		largeImageKey: Assets.Logo,
		//The small image on the presence. This can be a key of an image uploaded to imgur that has been added to the enum Assets.
		smallImageKey: "", // Put an Asset from Assets there e.g. Assets.Play. All Assets can be found at index.d.ts
		//The text which is displayed when hovering over the small image
		smallImageText: "Some hover text",
		//The upper section of the presence text
		details: "Browsing Page Name",
		//The lower section of the presence text
		state: "Reading section A",
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
