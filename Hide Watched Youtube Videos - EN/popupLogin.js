document.addEventListener('DOMContentLoaded', function(){
		// Html page
	var elemFromMyHtml = document.getElementById('dataHtml');
	var buttonLoginOk = document.getElementById('buttonLoginOk');
	var buttonRegitrationOk = document.getElementById('buttonRegitrationOk');

	// IF user id exists on the PC THEN load main page of extension
	var userIdStorage = localStorage.getItem('userId');

	if(userIdStorage != null && userIdStorage != undefined)
	{
		document.location.href = "./popup.html";
	}
	else{
		//alert("user id not founded");
	}
	//


	function OnClickButtonLoginOK(){
		
		var inputNick = document.getElementById("inputLoginNick").value;
		var inputPass = document.getElementById("inputLoginPass").value;
		
		LoginUser(inputNick, inputPass);
	}
	
	function OnClickButtonRegistrationOK()
	{	
		var inputNick = document.getElementById("inputRegistrationNick").value;
		var inputPass = document.getElementById("inputRegistrationPass").value;
		
		RegistrationUser(inputNick, inputPass);
	}
		
	function LoginUser(nick, pass)
	{
		if(nick && pass){
			var messageForPHP = "request=" + "login" + "&nickname=" +nick+"&pass="+pass;
			GetResponceFromPHP(messageForPHP);
		}
		else{
			elemFromMyHtml.innerHTML = "! Fields can't be empty !";
		}
	}
	
	function RegistrationUser(nick, pass)
	{
		if(nick && pass){
			var messageForPHP = "request=" + "registration" + "&nickname=" + nick + "&pass=" + pass;
			GetResponceFromPHP(messageForPHP);
		}
		else{
			elemFromMyHtml.innerHTML = "! Fields can't be empty !";
		}
	}
	
	function GetResponceFromPHP(messageForPHP)
	{
		// Connect to php
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "https://hideyoutubevideos.000webhostapp.com/loginRequests.php", true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			   var messageFromPHP = xhr.responseText;
		
				elemFromMyHtml.innerHTML = messageFromPHP;
				
				var messageMessageFromPHP = document.getElementById('message').innerText;
				var accessMessageFromPHP = document.getElementById('access').innerText;
				var userIdMessageFromPHP = document.getElementById('userId').innerText;
				//alert(userIdMessageFromPHP);
				
				// IF register success THEN open extension
				if(accessMessageFromPHP == 1 || accessMessageFromPHP == "true"){

					// Save user id on the PC
					var keyStorageData = 'userId';
					var valueStorageData = userIdMessageFromPHP;
					SaveDataInStorage(keyStorageData, valueStorageData);
					//
					
					// open main popup page of extension
					document.location.href = "./popup.html";
				}
			}
		}
		
		// SEND DATA TO PHP
		xhr.send(messageForPHP);
	}
	
	function SaveDataInStorage(keyParam, valueParam)
	{
		localStorage.setItem(keyParam, valueParam);
		//alert(keyParam + " | saved with value: " + valueParam);
	}
		
		
	
	// Button  login click
    buttonLoginOk.addEventListener('click', function() { 
		OnClickButtonLoginOK();
    }, false);
	// .END (Button click)	
	
	// Button registration click
    buttonRegitrationOk.addEventListener('click', function() { 
		OnClickButtonRegistrationOK();
    }, false);
	// .END (Button click)	
	
}, false);