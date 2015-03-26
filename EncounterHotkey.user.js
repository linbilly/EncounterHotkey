// ==UserScript==
// @name        EncounterHotkey
// @namespace   http://dev.drbillylin.com/oscarwiki
// @description	Listens for hotkeys and do oscar functions. Eg. entering BP measurement when user types "BP 120/90".
// @include     */casemgmt/forward.jsp?action=view*
// @version     1.2
// @grant       none
// @author		Billy Lin
// @updateURL	https://github.com/linbilly/EncounterHotkey/raw/master/EncounterHotkey.meta.js
// @downloadURL	https://github.com/linbilly/EncounterHotkey/raw/master/EncounterHotkey.user.js
// ==/UserScript==

var activeNote;
var oldvalue;
var cursorLocation;

window.addEventListener("load",function(){

	// Insert iFrame to hide the windows
	var myframe = document.createElement("iframe");
	myframe.name = "hiddenWin";
	myframe.id = "hiddenWin";
	myframe.height="0px";
	myframe.width="0px";
	// myframe.setAttribute("hidden",true);
	document.getElementsByTagName("body")[0].appendChild(myframe);



	setTimeout(function(){

		activeNote = document.getElementsByName("caseNote_note")[0];
		activeNote.addEventListener("keypress", findString);

		function findString(e){
			evt = e || window.event; // compliant with ie6     

			//if the user presses "Enter", proceed
			if (evt.keyCode == 13) { 
				cursorLocation = activeNote.selectionStart;
				oldvalue = activeNote.value;
				var previousLines = activeNote.value.substring(0, cursorLocation).split('\n');

				var lastLine = previousLines[previousLines.length-1];
				var resultArray;

				// regex to find <BP 120/80> in the last line:
				var bpRegex = /BP\s*(\d+)\/(\d+)/gi;

				if((resultArray=bpRegex.exec(lastLine))!==null){
					enterBPMeasurement(resultArray);
				}

				// THIS IS WHERE NEW REGEX CAN BE ADDED ALONG WITH NEW METHODS BELOW
				// var newRegex = /some regex/gi;
				// if((resultArray = newRegex.exec(lastLine))!==null){
				// 	dosomething(resultArray);
				// }
			}
		}
	},1000);
}, false);

//Method to enter BP Measurement automatically. Regex for the matchedArray is /BP\s*(\d+)\/(\d+)/gi
function enterBPMeasurement(matchedArray){
	var sbp=matchedArray[1];
	var dbp=matchedArray[2];

	// enter BP value https://../../oscarEncounter/oscarMeasurements/SetupMeasurements.do?groupName=BP
	var pathArray = window.location.pathname.split( '/' );
	var newURL = window.location.protocol + "//" + window.location.host +"/"+pathArray[1]+"/oscarEncounter/oscarMeasurements/SetupMeasurements.do?groupName=BP";
	var measurementWindow = window.open(newURL, "hiddenWin");

	document.getElementById("hiddenWin").onload = function(){
		var bpInputBox = document.getElementById("hiddenWin").contentDocument.getElementsByName("value(inputValue-0)")[0];
		bpInputBox.value = sbp+'/'+dbp;

		// finding the submit button and clicking on it
		var measurementButtons = document.getElementById("hiddenWin").contentDocument.getElementsByName("Button");
		for(var i=0; i<measurementButtons.length; i++){
			var mButton = measurementButtons[i];
			if(mButton.getAttribute('value')=="Submit"){
				mButton.click();
			}
		}
	};

	// measurementWindow.addEventListener("load", function(){
	// 	// putting the BP value in the correct input box
	// 	var bpInputBox = measurementWindow.document.getElementsByName("value(inputValue-0)")[0];
	// 	bpInputBox.value = sbp+'/'+dbp;

	// 	// finding the submit button and clicking on it
	// 	var measurementButtons = measurementWindow.document.getElementsByName("Button");
	// 	for(var i=0; i<measurementButtons.length; i++){
	// 		var mButton = measurementButtons[i];
	// 		if(mButton.getAttribute('value')=="Submit"){
	// 			mButton.click();
	// 		}
	// 	}
	// });

	// Some time after clicking on submit, the measurement window would close. As it closes, it will append a BP reading at the end of the current active note
	// The code below remove the OSCAR generated BP reading at the end of the active note in favor of keeping the user typed BP value in its original place
	var timer = setInterval(function(){
		//after the measurement window closes, 
		//if(measurementWindow.closed){
			activeNote.value = [oldvalue.slice(0, cursorLocation),'\n',oldvalue.slice(cursorLocation)].join('');
			activeNote.focus();
			activeNote.setSelectionRange(cursorLocation+1,cursorLocation+1);
			clearInterval(timer);
		//}
	},500);
}

// ADD NEW FUNCTIONS HERE FOR MORE HOTKEYS ACTIONS
//function dosomething(matchedArray){

// }
