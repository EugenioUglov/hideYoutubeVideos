// GLOBAL VARIABLES
var isHideVideos = true;
var isYoutubePageToHideVideos = false;

var languageEN = "EN";
var languageRU = "RU";
var languageExtension = languageEN;


var rmbVideoElement;
//var checkboxGet;
var isCheckboxHideVideosChecked = true;

// Put 0 if you need isHide all videos with the last part of name
var number_last_viewed_serie = [];

// How many videos we can see now
var number_of_youtube_videos;

// Videos that were found and isHide on Youtube from video array
var hidden_videos = [];

// Videos that exists in the array for isHide, but weren't isHide yet
var not_hidded_videos = [];
var series_to_hide = [];

var series = [];

var head_container;

// Check if element changed on a page.
var isButtonVideoChoosed = false;
var interval = 3000;
var seconds_rewind_video = 5;

var isRewindComplete = false;

var mainPlayer;

var isLinkChanged = false;
var currentHref;

var isDataFromDBReaded = false;

var partTextMainPage = "featured";
var partTextMainPage2 = "https://www.youtube.com/channel";
var partTextMainPage3 = "https://www.youtube.com/user";
var partTextVideos = "videos";
var partTextWatch = "watch?v=";

var jsonName_videosColumnFromDB;
var youtubeVideosForHide_DBAgent;
var youtubeSeriesForHide_DBAgent;

var videoNameRMB;
var currentIndexYoutuberHref;

var contextMenuSettingsObj = {
	"rmbHideSettings": null
}

// .END (GLOBAL VARIABLES)

function StartLogic() {

	// console.log("Start logic");

	currentHref = window.location.href;

	// If this is youtube
	var allText = window.location.href;
	var partText = "https://www.youtube.com";
	if (IsFoundedPartOfText(allText, partText)) {
		GetStatusCheckboxHideVideosFromPopup();


		// IF this is main youtube page THEN pause video
		if ((IsFoundedPartOfText(allText, partTextMainPage) || IsFoundedPartOfText(allText, partTextMainPage2) || IsFoundedPartOfText(allText, partTextMainPage3)) && IsButtonMainPageSelected()) {
			FoundMainPlayer();
			isYoutubePageToHideVideos = true;
		}
		// .END (If this is main youtube page)

		// IF this is page with videos THEN get link for save to DB
		else if (IsFoundedPartOfText(allText, partTextVideos)) {
			buttonVideoClicked();
			// GET NAME VIDEOS FROM DB
			GetNameVideosDataFromDB();
			isYoutubePageToHideVideos = true;
		}
		// .END (IF this is page with videos THEN get link) 
		// IF this is page with watch (wathing curently video) THEN get link for save to DB
		else if (IsFoundedPartOfText(allText, partTextWatch)) {
			// GET NAME VIDEOS FROM DB
			GetNameVideosDataFromDB();
			isYoutubePageToHideVideos = true;
		}
		// .END (IF this is page with watch (wathing curently video) THEN get link) 

	}

}

// Key Input (keydown)
document.addEventListener('keydown', function (event) {
	if (isYoutubePageToHideVideos) {
		// clicked "h"
		var hKey = 72;
		if (event.keyCode == hKey) {
			var isHide = isCheckboxHideVideosChecked;
			logicForVideos(isHide);
		}
	}
});
// .END	(Key Input)

// click "back", "forward" buttons in the browser
addEventListener("popstate", function (e) {
	// console.log("Clicked button in the browser detected!");
	ClearTrash();
	StartLogic();
}, false);


// Page loaded
window.onload = function () {
	//startWorker();
	StartLogic();
}


// Right mouse down
window.onmousedown = function (event) {
	// RMB
	if (event.which == 3) {
		// console.log("isDataFromDBLoaded = " + isDataFromDBLoaded);
		videoNameRMB = null;

		// console.log("RMB");
		if (document.location.host == "www.youtube.com") {
			ShowExtensionItemInContextMenu();
			// GET TITLE VIDEO if RMB clicked on the video
			var currentHref = window.location.href;
			var allText = currentHref;


			// if videos page
			if (IsFoundedPartOfText(allText, partTextVideos)) {
				// Get video element after click RMB
				var clickedElement = event.target;
				var videoElementRMB = clickedElement.closest("ytd-grid-video-renderer");
				if (videoElementRMB != null) {
					// Get title video
					videoNameRMB = videoElementRMB.querySelector(".yt-simple-endpoint.style-scope.ytd-grid-video-renderer").title;
				}
			}

			// if watch page (Watching video now)
			else if (IsFoundedPartOfText(allText, partTextWatch)) {
				var clickedElement = event.target;
				var videoElementRMB = clickedElement.closest("ytd-compact-video-renderer");
				// Get title video
				if (videoElementRMB != null) {
					videoNameRMB = videoElementRMB.querySelector("#video-title").title;
				}
			}
			// .END (GET TITLE VIDEO)


			if (videoElementRMB != undefined && videoElementRMB != null && videoNameRMB != null && videoNameRMB != undefined) {
				// console.log("Cideo name RMB: " + videoNameRMB);
				GetContextMenuSettingsFromPopup(videoNameRMB);
			}
			else {
				// // console.log("RMB not youtube");
				HideItemInContextMenu();
			}

		}
		else {
			// // console.log("RMB not youtube");
			HideItemInContextMenu();
		}

	}
};
// .END (Right mouse click)



// Click mouse LMB
document.onclick = function (event) {

	// console.log(event);
	if (window.location.host == "www.youtube.com") {
		event = event || window.event;
		if (!event.target) {
			event.target = event.srcElement;
		}

		// Clicked element
		var event_target = event.target;
		// // console.log("Clicked element:" + event_target );

		var isClickedElementHaveHref = IsClickedElementHaveHref(event_target);
		var isClickedHeadNavigationPanel = IsClickedHeadNavigationPanel(event_target);
		// IF clicked element have href THEN youtube changed page
		if (isClickedElementHaveHref || isClickedHeadNavigationPanel) {
			// console.log("Youtube changed page");
			isLinkChanged = true;
			ClearTrash();
			//StartLogic();
			setTimeout(StartLogic, 1000);
		}
		// .END

	}

}
//

function OnUrlChanged() {
	ClearTrash();
	StartLogic();
}

function IsClickedHeadNavigationPanel(event_target) {
	// Проверка на нажатие на верхнюю панель навигации. "Главная", "Видео", "Плейлисты" и тд..
	if (event_target.id == "tabs-container") {
		// Определенно нажата
		// console.log("Head navigation clicked! FIRST TRY :)");
		return true;
	}
	else {
		for (var i = 0; i < 50; i++) {
			// Перебрать все элементы вверх от клика
			event_target = event_target.parentNode;
			if (event_target != null) {
				if (event_target.id != null) {
					if (event_target.id == "tabs-container") {
						// console.log("Head navigation clicked!");
						return true;
					}
				}
			}
			// No parent elements
			else {
				return false;
			}
		}
	}

	//var headButtons = document.querySelector("#tabs-container");
}


function PauseVideo() {
	document.querySelector(".ytp-play-button.ytp-button").click();
}

function IsClickedElementHaveHref(event_target) {
	if (event_target != null) {
		if (event_target.href != null) {
			// console.log("Clicked item have href!");
			return true;
		}

		// Clicked item have not href THEN check parent items
		else {
			for (var i = 0; i < 50; i++) {
				event_target = event_target.parentNode;
				if (event_target != null) {
					if (event_target.href != null) {
						// console.log("Parent item has href!");
						return true;
					}
				}
				// No parent elements
				else {
					return false;
				}
			}
		}
	}

	return false;
}






var isMainVideoLoaded = false;


function FoundMainPlayer() {
	interval = 1;

	if (document.querySelector(".video-stream.html5-main-video") != null) {
		MainVideoLogic();
	}
	else {
		// console.log("retry loop (Searching for main video player)");
		setTimeout(FoundMainPlayer, interval);
	}
}

function MainVideoLogic() {
	// console.log("is link changed: " + isLinkChanged);
	if (isLinkChanged == false) {
		WaitPauseMainVideo();
	}
	else {

	}

}


function WaitPauseMainVideo() {
	// console.log("loop WaitPauseMainVideo");
	interval = 100;
	var mainPlayer = document.querySelector(".video-stream.html5-main-video");
	var sectionMainPlayer = document.querySelector(".style-scope ytd-item-section-renderer");
	if (sectionMainPlayer != null && mainPlayer != null) {
		// console.log("main video founded");

		var buttonVideo = document.getElementsByClassName("tab-content style-scope paper-tab")[1];

		if (buttonVideo != undefined) {
			mainPlayer.onplaying = function () {
				// console.log("main player is playing -> main player pause");

				mainPlayer.pause();
				mainPlayer.onplaying = null;
				mainPlayer = null;
			}
		}
	}
	else {
		// console.log("retry loop find pause button video");
		// IF long loading... THEN add to waiting 0.5sec
		interval += 500;
		setTimeout(WaitPauseMainVideo, interval);
	}

}

function ShowHiddenVideos() {
	var isHide = false;

	for (var i_videoElem = 0; i_videoElem < hidden_videos.length; i_videoElem++) {
		HideOrShowVideo(isHide, hidden_videos[i_videoElem]);
	}
}

// true - isHide videos, false -show videos
function logicForVideos(isHide) {
	if (isHide) {
		HideVideosOnYoutubeByName(not_hidded_videos, isHide);
	}
	else {
		ShowHiddenVideos();
	}

	if (!IsArrayEmpty(series_to_hide)) {
		HideSeriesByName(series_to_hide, isHide);
	}
}



function HideVideosOnYoutubeByName(isHide) {
	var videos;
	var allText = document.location.href;
	// Class with all videos on the page
	if (IsFoundedPartOfText(allText, partTextVideos)) {
		videos = document.getElementsByClassName("yt-simple-endpoint style-scope ytd-grid-video-renderer");
	}
	else if (IsFoundedPartOfText(allText, partTextWatch)) {
		videos = document.getElementsByClassName("style-scope ytd-watch-next-secondary-results-renderer");
	}

	//If our list not empty
	if (!IsArrayEmpty(not_hidded_videos)) {
		// Looking for all videos from out list
		for (var j = 0; j < not_hidded_videos.length; j++) {
			// Looking for all videos from Youtube
			if (videos == undefined) { break; }
			for (var i = 0; i < videos.length; i++) {
				var nameVideoOnYoutube;
				if (IsFoundedPartOfText(allText, partTextVideos)) {
					nameVideoOnYoutube = videos[i].innerText;
				}
				else if (IsFoundedPartOfText(allText, partTextWatch)) {
					if (i == 0) { continue; }
					// not video element
					else if (i == videos.length - 2) { break; }
					nameVideoOnYoutube = videos[i].querySelector("#video-title").title;
				}


				// If Youtube video == list video then hide or show video on Youtube
				if (nameVideoOnYoutube == not_hidded_videos[j]) {

					var videoElement;

					// GET TITLE VIDEO if RMB clicked on the video
					var currentHref = window.location.href;
					var allText = currentHref;

					// if videos page
					if (IsFoundedPartOfText(allText, partTextVideos)) {
						// элемент, который необходимо скрыть
						videoElement = videos[i].closest("ytd-grid-video-renderer");
					}
					// if watch page
					else if (IsFoundedPartOfText(allText, partTextWatch)) {
						videoElement = videos[i];
					}

					HideOrShowVideo(isHide, videoElement);

					if (isHide) {
						// Put video element to array hiden_videos
						hidden_videos.push(videoElement);

						// if videos page
						if (IsFoundedPartOfText(allText, partTextVideos)) {
							// console.log("HIDED Video "+"video Youtube: "+ videos[i].innerText +" == video in list: " + not_hidded_videos[j]);
						}
						else if (IsFoundedPartOfText(allText, partTextWatch)) {
							// console.log("HIDED Video "+"video Youtube: "+ videos[i].querySelector("#video-title").title +" == video in list: " + not_hidded_videos[j]);
						}


						// Delete video from array 
						not_hidded_videos.splice(j, 1);

						j--;

					}

					// If we find watched video in Youtube then exit from loop and watch next video from our list
					break;
				}
			}
		}
	}

}

function hideVideosWithWatchedLinde() {
	var allText = document.location.href;
	var watchedLineElements = document.getElementsByClassName("style-scope ytd-thumbnail-overlay-resume-playback-renderer");
	for (var i = 0; i < watchedLineElements; i++) {
		// console.log(watchedLineElements[i]);

		var videoElement;
		if (IsFoundedPartOfText(allText, partTextVideos)) {
			// элемент, который необходимо скрыть
			videoElement = videos[i].closest("ytd-grid-video-renderer");
		}
		else if (IsFoundedPartOfText(allText, partTextWatch)) {

			videoElement = videos[i];
		}

		videoElement.style.display = "none";

	}
}

function HideSeriesByName(series, isHide) {
	for (var i = 0; i < series.length; i++) {
		var text_last_part_of_video = [];
		// if part of video = 0, get all videos with this name
		if (series[i].part == 0) {
			text_last_part_of_video = "[title*='" + series[i].name + " #" + "']";
			hideOrShowSerieVideos(isHide, text_last_part_of_video);
		} else {
			// Для серий от 1 до числа из массива объектов для видео
			for (var j = 1; j <= series[i].part; j++) {
				text_last_part_of_video = "[title*='" + series[i].name + " #" + j + "']";
				hideOrShowSerieVideos(isHide, text_last_part_of_video);
			}
		}
	}

}

function hideOrShowSerieVideos(isHide, text_last_part_of_video) {
	var allText = document.location.href;

	// Взять из видео на ютуб все титлы (названия видео) в конце у которых название схоже с названием из переменной БД
	// Пример: death strave (# 1)
	var serie_videos_for_hide = document.querySelectorAll(text_last_part_of_video);

	// For all titles of serie_videos_for_hide get element that will isHide block with video
	for (var s = 0; s < serie_videos_for_hide.length; s++) {


		var videoElement;
		if (IsFoundedPartOfText(allText, partTextVideos)) {
			// элемент, который необходимо скрыть
			videoElement = serie_videos_for_hide[s].closest("ytd-grid-video-renderer");
		}
		else if (IsFoundedPartOfText(allText, partTextWatch)) {
			var videoNameElement = serie_videos_for_hide[s];

			if (videoNameElement.ariaLabel != null && videoNameElement.ariaLabel != undefined) {
				videoElement = videoNameElement.closest("ytd-compact-video-renderer");
			}
		}

		if (videoElement != undefined && videoElement != null) {
			HideOrShowVideo(isHide, videoElement);
		}
	}
}

function HideOrShowVideo(isHide, videoElement) {

	// isHide videos
	if (isHide) {
		videoElement.style.display = "none";
	}
	//
	// Show videos
	else {
		videoElement.style.display = "block";
	}
	//
}



function HideVideosInHiddenVideosArray() {
	for (var i = 0; i < hidden_videos.length; i++) {
		var isHide = true;
		var elem_video = hidden_videos[i];
		HideOrShowVideo(isHide, elem_video);
	}
}

function logicForVideosDependsOfCheckbox() {

	if (isCheckboxHideVideosChecked) {
		// Checkbox is checked..
		// alert("checked");
		HideVideosInHiddenVideosArray();
		// console.log("Checkbox change value - checked");
		logicForVideos(true);
	} else {
		// alert("unchecked");
		// Checkbox is not checked..

		logicForVideos(false);
	}
}

function SetVideosToHide() {

}

function pauseMainVideo() {
	var videoMain = document.getElementById("player");
	videoMain.pause();
}



// Mouse scrolling
document.onwheel = function (event) {
	var allText = document.location.href;
	if (IsFoundedPartOfText(allText, partTextVideos) && isDataFromDBReaded) {
		// console.log("whee!");
		if (event.deltaY > 0) {
			// console.log("whee down!");
			var current_number_of_youtube_videos = document.getElementsByClassName('style-scope ytd-grid-renderer').length;
			if (current_number_of_youtube_videos != number_of_youtube_videos) {
				var isHide = isCheckboxHideVideosChecked;
				logicForVideos(isHide);
			}
		}
	}
	// Wathing video page
	else if (IsFoundedPartOfText(allText, partTextWatch) && isDataFromDBReaded) {
		// console.log("whee!");
		if (event.deltaY > 0) {
			// console.log("whee down!");
			var current_number_of_youtube_videos = document.getElementsByClassName("style-scope ytd-watch-next-secondary-results-renderer").length;
			if (current_number_of_youtube_videos != number_of_youtube_videos) {
				var isHide = isCheckboxHideVideosChecked;
				logicForVideos(isHide);
			}
		}
	}

}
//




// If we clicked to button Видео
function buttonVideoClicked() {
	WaitForLoadButtonVideo();
}

function WaitForLoadButtonVideo() {
	interval = 1;

	// // console.log("loop");
	if (document.getElementsByClassName("tab-content style-scope paper-tab")[1] != null) {
		var buttonVideo = document.getElementsByClassName("tab-content style-scope paper-tab")[1].closest("paper-tab");

		if (buttonVideo.className == "style-scope ytd-c4-tabbed-header-renderer iron-selected") {
			isButtonVideoChoosed = true;
		}
	}
	else {
		// Repeat function
		setTimeout(WaitForLoadButtonVideo, interval);
	}
};

function WaitForLoadButtonMainPage() {
	interval = 1;

	// Wait for load button "Glavnaya" on the head menu
	if (document.getElementsByClassName("tab-content style-scope paper-tab")[0] != null) {
		// console.log("I see main page here..");
		var buttonVideo = document.getElementsByClassName("tab-content style-scope paper-tab")[0].closest("paper-tab");

		if (buttonVideo.className == "style-scope ytd-c4-tabbed-header-renderer iron-selected") {
			// console.log("Wait for load video");
			FoundMainPlayer();
		}
	}
	else {
		// Repeat function
		setTimeout(WaitForLoadButtonMainPage, interval);
	}
};

function IsButtonMainPageSelected() {
	interval = 1;

	// Wait for load button "Glavnaya" on the head menu
	if (document.getElementsByClassName("tab-content style-scope paper-tab")[0] != null) {
		// console.log("I see main page here..");
		var buttonVideo = document.getElementsByClassName("tab-content style-scope paper-tab")[0].closest("paper-tab");

		// + Main page selected
		if (buttonVideo.className == "style-scope ytd-c4-tabbed-header-renderer iron-selected") {
			return true;
		}
		// - Main page not selected
		else {
			return false;
		}
	}
	else {
		// Repeat function
		setTimeout(WaitForLoadButtonMainPage, interval);
	}
}

function SetDefaultSettings() {
	isLinkChanged = false;
}

function ClearTrash() {
	if (document.querySelector(".video-stream.html5-main-video") != null) {
		if (document.querySelector(".video-stream.html5-main-video").ontimeupdate != null) {
			document.querySelector(".video-stream.html5-main-video").ontimeupdate = null;
		}
	}
	not_hidded_videos = [];
	series_to_hide = [];
}

// Check in the text (allText) if exists part of text (partText)
// Return true if exists
function IsFoundedPartOfText(allText, partText) {
	var index_exist_text = allText.indexOf(partText);
	if (index_exist_text > -1) {
		return true;
	}

	return false;
}



/* WORK with background scripts */

// Get value of checkbox on popup
function GetStatusCheckboxHideVideosFromPopup() {
	var message = { request: "GetStatusCheckboxHideVideosFromPopup" };
	SendMessageToBackgroundScript(message);
}

function GetNameVideosDataFromDB() {
	var message = { request: "GetNameVideosDataFromDB" };
	// console.log("Get name videos data from DB");
	// Return from DB NameVideosDataFromDB
	SendMessageToBackgroundScript(message);
}

function SetNameVideosForHideToDB(nameVideosStr) {
	var message = { request: "SetNameVideosForHideToDB", data: nameVideosStr };
	SendMessageToBackgroundScript(message);
}

function GetContextMenuSettingsFromPopup(videoNameRMBParam) {
	var message = { request: "GetContextManuSettings", videoNameRMB: videoNameRMBParam };

	SendMessageToBackgroundScript(message);
}

function HideItemInContextMenu() {
	var message = { context: "CreateContextMenu", showContextMenus: "false", "youtuberHref": "", title: "" };

	SendMessageToBackgroundScript(message);
}



// SEND MESSAGE TO contextmenu.js script
function ShowExtensionItemInContextMenu(youtuberHref, titleContextMenu) {
	var message = { context: "CreateContextMenu", showContextMenus: "true", "youtuberHref": youtuberHref, title: titleContextMenu };
	// console.log("hiden element by RMB");
	// console.log(videoElement);
	SendMessageToBackgroundScript(message);
}


function SendMessageToBackgroundScript(message) {
	chrome.runtime.sendMessage(message, function (response) {
		//LogicForResponceMessage(responce);
		// console.log(response.farewell);
	});
}

function LogicForResponceMessage(responceMessage) {
	// console.log(responceMessage);
}

// .END (SEND MESSAGE TO contextmenu.js)

// LISTENER
// Get message from background.js or contextmenu.js
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		var message = request;

		if (message.context != null || message.request != null) {

			// Get name videos data from DB
			if (message.context == "NameVideosDataFromDB") {
				// console.log("DATA FROM DB (Or from variable that saved DB data):.");
				// console.log(message);
				// console.log(message.info);
				SetNameVideosDataFromDB(message);
				isDataFromDBReaded = true;

				var isHide = isCheckboxHideVideosChecked;
				logicForVideos(isHide);
			}
			//


			// Get contextmenu settings
			if (message.request == "ContextManuSettings") {
				// if checkbox Hide Videos active
				if(isCheckboxHideVideosChecked){
					contextMenuSettingsObj.rmbHideSettings = message.data;
				}
				else{
					contextMenuSettingsObj.rmbHideSettings = "None";
				}
				SetSettingsForContextMenu(contextMenuSettingsObj.rmbHideSettings, message.videoNameRMB);
				//alert("Settings context menu: " + contextMenuSettingsObj.rmbHideSettings);
			}
			//



			// Get responce from contextmenu.js
			if (message.context == "ContextMenuAnswer") {
				if (message.hide === "true") {
					// console.log("DATA FROM CONTEXTMENU:.");
					// console.log(message);
					var titleContextMenu = message.titleContextMenu;

					if (videoNameRMB != undefined) {
						if (titleContextMenu == null || titleContextMenu == "Скрыть видео" || titleContextMenu == "Hide video") {
							//var videoElement = videoNameRMB.closest("ytd-grid-video-renderer");

							//var nameVideosArray = [videoNameRMB];
							//HideVideosOnYoutubeByName(nameVideosArray, hide);
							//HideOrShowVideo(hide, videoElement);

							AddVideoNameToDB(videoNameRMB);
						}
						else if (titleContextMenu == "Hide until this serie") {
							var nameAndNumberSerieRMB = GetNameAndNumberSerieFromRMB(videoNameRMB);

							var nameSerieRMB = nameAndNumberSerieRMB[0];

							if(nameSerieRMB != null){
								var numberSerieRMB = nameAndNumberSerieRMB[1];

								AddSerieToDB(nameSerieRMB, numberSerieRMB);
							}
						}
						else if (titleContextMenu == "Hide all series") {
							var numberToHideAllSeries = 0;

							// From videoNameRMB get name after 0 index or symbol | or symol |> until #
							// And put to nameSerie.
							// Number get from # until space or not number
							var nameAndNumberSerieRMB = GetNameAndNumberSerieFromRMB(videoNameRMB);

							var nameSerieRMB = nameAndNumberSerieRMB[0];

							if(nameSerieRMB != null){
								AddSerieToDB(nameSerieRMB, numberToHideAllSeries);
							}
						}

						// console.log("videoNameRMB = " + videoNameRMB);
						videoNameRMB = undefined;
					}
					else {
						// alert("videoNameRMB = undefined");
					}
				}
			}

			if (message.context == "StatusCheckboxHideVideosFromPopup") {
				var valueCheckbox = message.data;
				if (valueCheckbox === "true" || valueCheckbox === null || valueCheckbox === undefined) {
					isCheckboxHideVideosChecked = true;
				}
				else if (valueCheckbox === "false") {
					isCheckboxHideVideosChecked = false;
				}
				else {
					alert("ERROR! Something happened with checkbox popup/n Info: Cant' to get value of checkbox");
				}

				logicForVideosDependsOfCheckbox();
			}
			//

			sendResponse({ farewell: "main script get " });
		}
	});
// .END (LISTENER)

function GetNameAndNumberSerieFromRMB(videoNameRMB) {
	var nameSerie;
	var numberSerie = "";

	var lastSymbolInVideoNameRMB = videoNameRMB[videoNameRMB.length - 1];

	// Search # symbol
	for (var i_symbol = videoNameRMB.length; i_symbol >= 0; i_symbol--) {
		if (i_symbol != 0) {
			var currentSymbol = videoNameRMB[i_symbol];
			if (currentSymbol == "#") {
				var i_sharpSymbol = i_symbol;

				var isNumberSymol;

				// Get nubmer serie
				for (var j_symbol = i_symbol; j_symbol < videoNameRMB.length; j_symbol++) {
					currentSymbol = videoNameRMB[j_symbol];
					isNumberSymol = IsNumeric(currentSymbol);
					if (isNumberSymol) {
						numberSerie += currentSymbol;
					}
					else {
						if (numberSerie != "" || j_symbol == videoNameRMB.length - 1) {
							break;
						}
						else {

						}
					}

					// Error checker
					if (j_symbol == videoNameRMB.length - 1 && numberSerie == "") {
						var errorTitleText = "Error the number of selected video after symbol #";
						ShowErrorChoosedVideoNotSerie(videoNameRMB, errorTitleText);
					}
				}
				// .END (Get number serie)

				// Get name serie
				for (var j_symbol = i_symbol; j_symbol >= 0; j_symbol--) {
					// cut str from index to index
					//videoNameRMB.substr(1, 2);


					currentSymbol = videoNameRMB[j_symbol];
					if (j_symbol == 0 || currentSymbol == "►") {
						// From first letter or symbol
						var firstIndexSymbolNameSerie = j_symbol + 1;
						if(j_symbol == 0){
							firstIndexSymbolNameSerie--;
						}
						else if (videoNameRMB[firstIndexSymbolNameSerie] == ' ') {
							firstIndexSymbolNameSerie++;
						}
						
						// Until #
						var lastIndexSymbolNameSerie = i_symbol - 1;
						if (videoNameRMB[lastIndexSymbolNameSerie] == ' ') {
							lastIndexSymbolNameSerie--;
						}

						lastIndexSymbolNameSerie = lastIndexSymbolNameSerie - firstIndexSymbolNameSerie + 1;

						nameSerie = videoNameRMB.substr(firstIndexSymbolNameSerie, lastIndexSymbolNameSerie);

						break;
					}
				}
				// .END (Get name serie)

				break;
			}
		}
		// if i_symbol = 0 THEN # weren't found
		else {
			var errorTitleText = "symbol # doesn't exist in the video";
			ShowErrorChoosedVideoNotSerie(videoNameRMB, errorTitleText);
			nameSerie = null;
		}
	}

	// alert("serie: " + nameSerie + "# "+ numberSerie); 

	return [nameSerie, numberSerie];
}

function IsNumeric(num) {
	return !isNaN(num)
}

function ShowErrorChoosedVideoNotSerie(videoNameRMB, errorTitleText) {
	alert("ERROR: # symbol weren't found in name video: " + videoNameRMB + " | Video wil be hiden not as a serie. As a separate video");

	var resultActionUser = confirm("ERROR! Do You want to add video not as a sirie, but as a uniq video?" + "\n" + "Info: " + errorTitleText + ": " + "\n" + "Name of selected video: " + videoNameRMB);

	// If user clicked OK
	if (resultActionUser) {
		console.log("resultActionUser");
		AddVideoNameToDB(videoNameRMB);
	}
	// If user clicked Cancel
	else {

	}
}


function SetNameVideosDataFromDB(message) {
	var jsonFromDB = message.data;

	var stringFromDB = JSON.stringify(jsonFromDB);
	var stringFromDBWithDecodedSharpSymbol = GetTextWithDecodeSymbols(stringFromDB);
	var jsonFromDB = JSON.parse(stringFromDBWithDecodedSharpSymbol);

	var stringName_videosColumnFromDB = jsonFromDB.name_videos;
	
	if (stringName_videosColumnFromDB != "" && stringName_videosColumnFromDB != undefined) {
		jsonName_videosColumnFromDB = JSON.parse(stringName_videosColumnFromDB);
	}

	var allText = document.location.href;

	if (jsonName_videosColumnFromDB != undefined) {
		var youtuberHrefDB = IsCurrentYoutuberHrefExistsInDB();

		var indexYoutuberHrefDB;
		var isYoutuberHrefExists = youtuberHrefDB[0];
		if (isYoutuberHrefExists) {
			indexYoutuberHrefDB = youtuberHrefDB[1];
		}
		else{
			AddNewYoutuberHrefToDBVariable();
			indexYoutuberHrefDB = jsonName_videosColumnFromDB.length - 1;
		}

		if (IsFoundedPartOfText(allText, partTextVideos)) {
			var nameVideosArray = jsonName_videosColumnFromDB[indexYoutuberHrefDB].nameVideos;
		}
		else if (IsFoundedPartOfText(allText, partTextWatch)) {
			var nameVideosArray = [];
			// Get all videos from DB variable
			for (var i_youtuberHref = 0; i_youtuberHref < jsonName_videosColumnFromDB.length; i_youtuberHref++) {
				nameVideosArray = nameVideosArray.concat(jsonName_videosColumnFromDB[i_youtuberHref].nameVideos);
			}
		}
		// console.log("All name videos for isHide:.");
		// console.log(nameVideosArray);
		not_hidded_videos = CloneArray(nameVideosArray);


		if (IsFoundedPartOfText(allText, partTextVideos)) {
			if (!IsArrayEmpty(series)) {
				series_to_hide = jsonName_videosColumnFromDB[indexYoutuberHrefDB].series;
			}
			number_of_youtube_videos = document.getElementsByClassName('style-scope ytd-grid-renderer').length;
		}
		else if (IsFoundedPartOfText(allText, partTextWatch)) {
			series_to_hide = GetSeriesAllYoutubers();
			number_of_youtube_videos = document.getElementsByClassName("style-scope ytd-watch-next-secondary-results-renderer").length;
		}

	}
	else {
		// console.log("name videos for isHide is empty");
	}
}

function HideVideosFromDB() {
	if (jsonName_videosColumnFromDB != undefined) {
		var youtuberHrefDB = IsCurrentYoutuberHrefExistsInDB();

		var isYoutuberHrefExists = youtuberHrefDB[0];
		if (isYoutuberHrefExists) {
			var indexYoutuberHrefDB = youtuberHrefDB[1];
			currentIndexYoutuberHref = indexYoutuberHrefDB;
			var nameVideosArrayForHide = jsonName_videosColumnFromDB[indexYoutuberHrefDB].nameVideos;
			series = jsonName_videosColumnFromDB[indexYoutuberHrefDB].series;

			var isHide = true;

			logicForVideos(isHide);
		}
	}

}

function GetSeriesAllYoutubers() {
	var allSeries;
	for (var i_youtuberHref = 0; i_youtuberHref < jsonName_videosColumnFromDB.length; i_youtuberHref++) {
		var seriesYoutuberCurrent = jsonName_videosColumnFromDB[i_youtuberHref].series;
		allSeries = series.concat(seriesYoutuberCurrent);
	}

	return allSeries;
}

function GetIndexYoutuberHrefFromDBVariable() {
	var indexYoutuberHrefDB;

	// IF data from DB exists THEN work with this data
	// ELSE create default object for data to DB
	if (jsonName_videosColumnFromDB == undefined || jsonName_videosColumnFromDB == "") {
		// CREATE DEFAULT OBJECT VARIABLE WITH NAME VIDEOS
		jsonName_videosColumnFromDB = [];
		indexYoutuberHrefDB = 0;
		AddNewYoutuberHrefToDBVariable();
	}

	// IF youtuber href on the current page exists in the DB THEN add video to exists youtuber href
	// ELSE create new youtuber href (current)
	var youtuberHrefDB = IsCurrentYoutuberHrefExistsInDB();

	var isYoutuberHrefExists = youtuberHrefDB[0];
	if (isYoutuberHrefExists) {
		indexYoutuberHrefDB = youtuberHrefDB[1];
	}
	else {
		AddNewYoutuberHrefToDBVariable();
		indexYoutuberHrefDB = jsonName_videosColumnFromDB.length - 1;
	}


	return indexYoutuberHrefDB;
}

function AddVideoNameToDB(videoName) {
	var indexYoutuberHrefDB = GetIndexYoutuberHrefFromDBVariable();

	// Put name videos to DB variable
	jsonName_videosColumnFromDB[indexYoutuberHrefDB].nameVideos.push(videoName);


	// Put to background script
	stringName_videosColumnFromDB = JSON.stringify(jsonName_videosColumnFromDB);

	var stringName_videosColumnFromDBWithEncodeSharp = GetTextWithEncodeSymbols(stringName_videosColumnFromDB);


	jsonName_videosColumnFromDB = "";


	var nameVideosForHideObjForBackgroundScript = { "name_videos": stringName_videosColumnFromDBWithEncodeSharp };

	SetNameVideosForHideToDB(nameVideosForHideObjForBackgroundScript);

}

function AddSerieToDB(videoName, numberLastWathedSerie) {

	var indexYoutuberHrefDB = GetIndexYoutuberHrefFromDBVariable();

	// console.log(videoName);

	var isSerieExistsInDBGetFunc = IsSerieExistsInDB(videoName, indexYoutuberHrefDB);
	var isSerieExistsInDB = isSerieExistsInDBGetFunc[0];

	// ADD SERIE TO DB
	if (isSerieExistsInDB == false) {
		var nameSerieObj = { "name": videoName, "part": numberLastWathedSerie }

		// Put name videos to DB variable
		jsonName_videosColumnFromDB[indexYoutuberHrefDB].series.push(nameSerieObj);
	}
	// .END (ADD SERIE TO DB)

	// CHANGE PART EXISTS SERIE IN DB
	else if (isSerieExistsInDB) {
		var i_serieNameInDB = isSerieExistsInDBGetFunc[1];
		jsonName_videosColumnFromDB[indexYoutuberHrefDB].series[i_serieNameInDB].part = numberLastWathedSerie;
	}
	// .END (CHANGE PART EXISTS SERIE IN DB)


	// Put to background script
	stringName_videosColumnFromDB = JSON.stringify(jsonName_videosColumnFromDB);

	var stringName_videosColumnFromDBWithEncodeSharp = GetTextWithEncodeSymbols(stringName_videosColumnFromDB);


	jsonName_videosColumnFromDB = "";


	var nameVideosForHideObjForBackgroundScript = { "name_videos": stringName_videosColumnFromDBWithEncodeSharp };

	SetNameVideosForHideToDB(nameVideosForHideObjForBackgroundScript);
}

function IsSerieExistsInDB(serieNameForAddToDB, indexYoutuberHrefDB) {
	var countSeries = jsonName_videosColumnFromDB[indexYoutuberHrefDB].series.length;
	// console.log("Count series = " + countSeries);

	for (var i_serie = 0; i_serie < countSeries; i_serie++) {
		var currentSerieName = jsonName_videosColumnFromDB[indexYoutuberHrefDB].series[i_serie].name;
		if (currentSerieName == serieNameForAddToDB) {
			return [true, i_serie];
		}
	}
	return [false, -1];
}

function IsCurrentYoutuberHrefExistsInDB() {
	currentHref = document.location.href;
	var allText = currentHref;

	// If this is video page
	if (IsFoundedPartOfText(allText, partTextVideos)) {
		currentYotuberHref = currentHref.substr(0, currentHref.length - 7);


		// for all youtuber hrefs in DB
		for (var i = 0; i < jsonName_videosColumnFromDB.length; i++) {
			if (currentYotuberHref == jsonName_videosColumnFromDB[i].youtuberHref) {
				var returnArray = [true, i];
				return returnArray;
			}
		}
	}
	// If this is watch page
	else if (IsFoundedPartOfText(allText, partTextWatch)) {
		var currentYoutuberHrefFromDBVariable;
		// for all youtuber hrefs in DB
		for (var i = 0; i < jsonName_videosColumnFromDB.length; i++) {
			currentYoutuberHrefFromDBVariable = jsonName_videosColumnFromDB[i].youtuberHref;

			if (currentYoutuberHrefFromDBVariable == "AllYoutubers") {
				// console.log("WTF");
				var returnArray = [true, i];
				return returnArray;
			}
		}

	}
	return [false, -1];
}

function AddNewYoutuberHrefToDBVariable() {
	currentHref = document.location.href;
	var allText = currentHref;
	var youtuberHref;

	// If this is video page
	if (IsFoundedPartOfText(allText, partTextVideos)) {
		youtuberHref = currentHref.substr(0, currentHref.length - 7);
	}
	// If this is watch page
	else if (IsFoundedPartOfText(allText, partTextWatch)) {
		youtuberHref = "AllYoutubers";
	}

	jsonName_videosColumnFromDBDefaultObj = {};
	jsonName_videosColumnFromDBDefaultObj.youtuberHref = youtuberHref;
	jsonName_videosColumnFromDBDefaultObj.nameVideos = [];
	jsonName_videosColumnFromDBDefaultObj.series = [];
	jsonName_videosColumnFromDB.push(jsonName_videosColumnFromDBDefaultObj);
}

function SetSettingsForContextMenu(titleContextMenu, videoNameRMBParam) {
	var youtuberHref = currentHref.substr(0, currentHref.length - 7);


	if (titleContextMenu == "hideSelectedVideo") {
		titleContextMenu = "Hide video";
	}
	else if (titleContextMenu == "hideWatchedSeries") {
		titleContextMenu = "Hide until this serie";
	}
	else if (titleContextMenu == "hideAllSeries") {
		titleContextMenu = "Hide all series";
	}
	else if (titleContextMenu == "None") {
		titleContextMenu = "None";
	}
	ShowExtensionItemInContextMenu(youtuberHref, titleContextMenu);
}


/* ADDITIONAL FUNCTIONS */

function ReloadMainPage(mainPageUrl) {
	var currentHref = document.location.href;

	if (currentHref == mainPageUrl) {
		location.reload();
	}

}

function isElementExist(elem) {
	if (elem != undefined) {
		return true;
	}

	return false;
}

function IsArrayEmpty(arr) {
	if (arr.length == 0 && arr.length == undefined) {
		return true;
	}
	return false;
}

function CloneArray(arr) {
	var cloneArray = JSON.parse(JSON.stringify(arr));
	return cloneArray;
}



function GetTextWithEncodeSymbols(textParam)
{
	var encodeText = GetTextWithEncodeSharpSymbol(textParam);
	encodeText = GetTextWithEncodeAmpersandSymbol(textParam);

	return encodeText;
}

function GetTextWithDecodeSymbols(textParam)
{
	var decodeText = GetTextWithDecodeSharpSymbol(textParam);
	decodeText = GetTextWithDecodeAmpersandSymbol(textParam);

	return decodeText;
}


// Change NsharpN to symbol #
function GetTextWithDecodeSharpSymbol(textParam) {
	return textParam.replace(/NsharpN/g, "#");
}
// Change symbol # to NsharpN	
function GetTextWithEncodeSharpSymbol(textParam) {
	return textParam.replace(/#/g, "NsharpN");
}


// Change NampersandN to symbol &
function GetTextWithDecodeAmpersandSymbol(textParam) {
	return textParam.replace(/NampersandN/g, "&");
}
// Change symbol & to NampersandN	
function GetTextWithEncodeAmpersandSymbol(textParam) {
	return textParam.replace(/&/g, "NampersandN");
}

// .END (ADDITIONAL FUNCTIONS)




/* Main Fnctions to use */
/*
ALL FUNCTIONS:
// isHide ARRAY OF VIDEOS BY NAME
// SHOW HIDDEN VIDEOS
// GET NAME VIDEOS FROM DB
*/


// isHide ARRAY OF VIDEOS BY NAME
/*
var nameVideosArray = ["name_video1", "name_video2"];
var isHide = true;
HideVideosOnYoutubeByName(nameVideosArray, isHide);
*/

// SHOW HIDDEN VIDEOS
// ShowHiddenVideos();