var youtuberHref;
// var titleContextText = "Скрыть видео";
var titleContextText = "Hide video";

hideVideo = function(){
	// Send message to content script
	var message = {context: "ContextMenuAnswer", hide: "true", "youtuberHref": youtuberHref, titleContextMenu: titleContextText};
	
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
	// .END (Send message to content script)
};
	

// Create context menu
chrome.contextMenus.create({
	id: "hideVideo",
	title: titleContextText,
	contexts:['link'], 
	onclick: hideVideo
});
// .END (Create context menu)



function OnGetMessageFromMainScript(message){
	if(message.showContextMenus === "true")
	{
		titleContextText = message.title;
		chrome.contextMenus.update("hideVideo", {"visible": true, "title": message.title});
	}
	else{
		chrome.contextMenus.update("hideVideo", {"visible": false});
	}

	youtuberHref = message.youtuberHref;
}

// Get message from content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	//CreateContextMenu();
	//var message = request.showContextMenus;
	var message = request;
	
	if(message.context == "CreateContextMenu")
	{
		// Logic what to do with message
		OnGetMessageFromMainScript(request);
		
		// Send answer message
		//sendResponse({farewell: "context get ", hide: "true"});
		sendResponse();
	}
  });
// .END (Get message from content script)



// Help Links
// Update context menu:
// http://www.adambarth.com/experimental/crx/docs/contextMenus.html