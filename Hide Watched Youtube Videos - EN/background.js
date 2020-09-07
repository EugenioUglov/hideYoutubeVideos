var responceMessage = "";
var isNameVideosDataFromDBGet = false;
var nameVideosForHideObj = {};
var radioboxElementHideSettings_SavedValue;


// Get message from content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

	//var message = request.showContextMenus;
	var message = request;

	
	// GET data from DB
	if(message.request === "GetNameVideosDataFromDB" && isNameVideosDataFromDBGet == false)
	{
		//alert("get from DB");
		var userIdStorage = localStorage.getItem('userId');
		
		if(userIdStorage != null){
			var paramsToPHP = "request=getNameVideos&userId=" + userIdStorage;
		
			// Connect to php
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://hideyoutubevideos.000webhostapp.com/dbRequests.php?" + paramsToPHP, true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					
					GetNameVideosFromDB(xhr, AfterGetVideosFromDB);
					// SEND JSON data
					// Send answer message
					
					SendMessageVideosDataToMainScript(responceMessage);
					//alert("Data get");
				}
			}
			
			// SEND DATA TO PHP
			xhr.send();
		}
	}
	else if(message.request === "GetNameVideosDataFromDB" && isNameVideosDataFromDBGet)
	{
		//alert("Get saved data from background script");		
		SendMessageVideosDataToMainScript(responceMessage);
	}
	else if(message.request === "SetNameVideosForHideToDB")
	{
		var userIdStorage = localStorage.getItem('userId');
		
		var dataFromMainScript = message.data;
		nameVideosForHideObj = dataFromMainScript;
		var nameVideosForHideString = JSON.stringify(nameVideosForHideObj.name_videos);
		// Connect to php
		var messageForPHP = "request=" + "setNameVideos" +"&youtuberVideosJSON=" + nameVideosForHideString + "&userId=" + userIdStorage; 
		
		
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "https://hideyoutubevideos.000webhostapp.com/dbRequests.php", true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			   // alert(xhr.responseText);
			}
		}
		
		// SEND DATA TO PHP
		xhr.send(messageForPHP);
		
		// SEND VARIABLE WITH DB DATA TO MAIN SCRIPT (DON'T GET FROM DB)
		SendMessageVideosDataToMainScript(responceMessage);
		
	}

	// Get request from main script to get settings for context menu
	if(message.request == "GetContextManuSettings")
	{	
		radioboxElementHideSettings_SavedValue = localStorage.getItem('rmbHideSettings');
		var messageForMainScript = {request: "ContextManuSettings", data: radioboxElementHideSettings_SavedValue, videoNameRMB: message.videoNameRMB};	
		//alert(radioboxElementHideSettings_SavedValue);
		
		SendMessageToMainScript(messageForMainScript);
	}

	if(message.request == "GetStatusCheckboxHideVideosFromPopup"){
		var valueChecxbox = localStorage.getItem('checkboxHideWatchedVideos');
		var messageForMainScript = {context: "StatusCheckboxHideVideosFromPopup", data: valueChecxbox};
		SendMessageToMainScript(messageForMainScript);
	}

	sendResponse();

  });
// .END (Get message from content script)


function SendMessageVideosDataToMainScript(messageForMainScript)
{
	var message;
	var info;
	
	// IF data from DB were not read yet THEN get data
	if(isNameVideosDataFromDBGet == false)
	{
		//var message = {context: "NameVideosDataFromDB", data: messageForMainScript};
		jsonFromDB = messageForMainScript;
		nameVideosForHideObj = jsonFromDB;

		
		isNameVideosDataFromDBGet = true;
		
		info = "Data from DB";
	}
	// IF data from DB already readed
	else 
	{
		info = "Data from variable saved in background script saved DB data: nameVideosForHideObj"
	}
	message = {context: "NameVideosDataFromDB", data: nameVideosForHideObj, "info": info};
	
	SendMessageToMainScript(message)
	/*
	chrome.tabs.query(
		{active: true, currentWindow: true},
		function(tabs)
		{
			chrome.tabs.sendMessage
			(
				tabs[0].id,
				message,
				function(response)
				{
					//console.log(response.farewell)
				}
			)
		}
	)
	*/
	// .END (Send message to content script)

}


function SendMessageToMainScript(messageForMainScript)
{
	// Send message to content script
	chrome.tabs.query(
		{active: true, currentWindow: true},
		function(tabs)
		{
			chrome.tabs.sendMessage
			(
				tabs[0].id,
				messageForMainScript,
				function(response)
				{
					//console.log(response.farewell)
				}
			)
		}
	)
	// .END (Send message to content script)
	
}



function GetNameVideosFromDB(xhr, callback)
{
	var messageFromPHP = xhr.responseText;
	if(messageFromPHP == "null")
	{
		alert("ERROR! Can't to get data from DB")
	}
	else{
		var jsonFromPHP = JSON.parse(messageFromPHP);
	
		//alert("Background: " + messageFromPHP);
		
		responceMessage = jsonFromPHP;
		callback();
	}
}

function AfterGetVideosFromDB()
{
	
	
}
