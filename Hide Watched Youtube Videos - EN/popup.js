// This is background script
// We can't to do console.log from this script
// Work with extension's html	

document.addEventListener('DOMContentLoaded', function(){
	// Html page
	// var elemFromMyHtml = document.getElementById('dataHtml');
	// Find button by id
	// var checkPageButton = document.getElementById('testBtn');

	// MAIN CHECKBOX VARIABLES
	var checkboxHideWatchedVideos = document.getElementById('checkboxHideWatchedVideos');
	var isCheckboxHideVideosActive_SavedValue = localStorage.getItem('checkboxHideWatchedVideos');
	//
	
	// RADIOBOX VARIABLES
	
	var rmbHideSettings = {
		"isHideSelectedVideoElement": document.getElementById('hideSettings_hideVideo'),
		"isHideSeriesUntilTheLastWatchedElement": document.getElementById('hideSettings_hideWatchedSeries'),
		"isHideAllSeriesElement" : document.getElementById('hideSettings_hideAllSeries')
	}
	
	var radioboxElementHideSettings_SavedValue = localStorage.getItem('rmbHideSettings');
	
	//
	
	
	
	// Check checkbox last saved value
	if(isCheckboxHideVideosActive_SavedValue == null || isCheckboxHideVideosActive_SavedValue == 'true')
	{
		CheckCheckboxHideWatchedVideos();
	}
	else if(isCheckboxHideVideosActive_SavedValue == 'false')
	{
		UncheckCheckboxHideWatchedVideos();
	}
	//
	// Check radiobox last saved value
	if(radioboxElementHideSettings_SavedValue == null || radioboxElementHideSettings_SavedValue == 'hideSelectedVideo')
	{
		rmbHideSettings.isHideSelectedVideoElement.checked = true;
	}
	else if(radioboxElementHideSettings_SavedValue == 'hideWatchedSeries')
	{
		rmbHideSettings.isHideSeriesUntilTheLastWatchedElement.checked  = true;
	}
	else if(radioboxElementHideSettings_SavedValue  == 'hideAllSeries')
	{
		rmbHideSettings.isHideAllSeriesElement.checked = true;
	}
	//
	
	// IF checbox "Hide videos" changed value THEN save value
	checkboxHideWatchedVideos.addEventListener( 'change', function() {
		var keyParam = 'checkboxHideWatchedVideos';
		var valueParam = 'true';
		var info = "If checkbox is active then hide wathced videos";
		
		if(document.getElementById("checkboxHideWatchedVideos").checked == true)
		{
			valueParam = 'true';	
		}
		else if(document.getElementById("checkboxHideWatchedVideos").checked == false)
		{
			valueParam = 'false';
		}
		
		localStorage.setItem(keyParam, valueParam);

		var messageForMainScript = {context: "StatusCheckboxHideVideosFromPopup", data: valueParam, "info": info};
		SendMessageToMainScript(messageForMainScript);

	
	});
	//
	
	// IF radiobox rmbHideSettings changed value THEN save value
	document.getElementById('hideSettings_hideVideo').addEventListener('change', function() {
		var keyParam = 'rmbHideSettings';
		var valueParam = null;
		
		if(document.getElementById('hideSettings_hideVideo').checked == true)
		{
			if(radioboxElementHideSettings_SavedValue != 'hideSelectedVideo')
			{
				valueParam = 'hideSelectedVideo';	
				localStorage.setItem(keyParam, valueParam);
			}
		}
	});
	
	document.getElementById('hideSettings_hideWatchedSeries').addEventListener( 'change', function() {
		var keyParam = 'rmbHideSettings';
		var valueParam = null;
		
		if(document.getElementById('hideSettings_hideWatchedSeries').checked == true)
		{
			if(radioboxElementHideSettings_SavedValue != 'hideWatchedSeries')
			{
				valueParam = 'hideWatchedSeries';
				localStorage.setItem(keyParam, valueParam);
			}
		}
	});
	
	document.getElementById('hideSettings_hideAllSeries').addEventListener( 'change', function() {
		var keyParam = 'rmbHideSettings';
		var valueParam = null;
		
		if(document.getElementById('hideSettings_hideAllSeries').checked == true)
		{
			
			if(radioboxElementHideSettings_SavedValue != 'hideAllSeries')
			{
				
				valueParam = 'hideAllSeries';
				localStorage.setItem(keyParam, valueParam);
			}	
		}
	});


  
	function CheckCheckboxHideWatchedVideos() {
	    document.getElementById("checkboxHideWatchedVideos").checked = true;
	}

	function UncheckCheckboxHideWatchedVideos() {
	    document.getElementById("checkboxHideWatchedVideos").checked = false;
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

}, false);


