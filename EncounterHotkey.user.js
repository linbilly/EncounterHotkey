// ==UserScript==
// @name        EncounterHotkey
// @namespace   http://dev.drbillylin.com/oscarwiki
// @description	Listens for hotkeys and do oscar functions. Eg. entering BP measurement when user types "BP 120/90".
// @include     */casemgmt/forward.jsp?action=view*
// @version     1
// @grant       none
// @author		Billy Lin
// @updateURL	https://github.com/linbilly/EncounterHotkey/raw/master/EncounterHotkey.meta.js
// @downloadURL	https://github.com/linbilly/EncounterHotkey/raw/master/EncounterHotkey.user.js
// ==/UserScript==

var activeNote;
var oldvalue;
var cursorLocation;

window.addEventListener("load",function(){
	// console.log("KeyListner working");
	
	setTimeout(function(){

		activeNote = document.getElementsByName("caseNote_note")[0];
		activeNote.addEventListener("keypress", findString);
		//activeNote.onkeyup=findString;

		// console.log(activeNote);
		// console.log("listener added");
		function findString(e){
			evt = e || window.event; // compliant with ie6     

			//if the user presses "Enter", proceed
			if (evt.keyCode == 13) { 
	        	// console.log('Enter Pressed');

				// var content = activeNote.value;
				cursorLocation = activeNote.selectionStart;
				oldvalue = activeNote.value;
				var previousLines = activeNote.value.substring(0, cursorLocation).split('\n');

				var lastLine = previousLines[previousLines.length-1];
				// console.log(lastLine);

				//if there is <BP 120/80> in the last line:
				var bpRegex = /BP\s*(\d+)\/(\d+)/gi;
				var myArray;

				if((myArray=bpRegex.exec(lastLine))!==null){
					enterBPMeasurement(myArray);
				}
			}
		}
	},1000);
}, false);

function enterBPMeasurement(matchedArray){
	// console.log(myArray);
	var sbp=matchedArray[1];
	var dbp=matchedArray[2];
	// console.log("BP is: "+sbp+"/"+dbp);

	// enter BP value https://../../oscarEncounter/oscarMeasurements/SetupMeasurements.do?groupName=BP
	var pathArray = window.location.pathname.split( '/' );
	var newURL = window.location.protocol + "//" + window.location.host +"/"+pathArray[1]+"/oscarEncounter/oscarMeasurements/SetupMeasurements.do?groupName=BP";
	// console.log(newURL);
	var measurementWindow = window.open(newURL);
	// console.log(measurementWindow);

	measurementWindow.addEventListener("load", function(){
		// console.log(measurementWindow);
		var bpInputBox = measurementWindow.document.getElementsByName("value(inputValue-0)")[0];
		// console.log(bpInputBox);
		bpInputBox.value = sbp+'/'+dbp;

		var measurementButtons = measurementWindow.document.getElementsByName("Button");
		// console.log(measurementButtons);
		for(var i=0; i<measurementButtons.length; i++){
			var mButton = measurementButtons[i];
			// console.log(mButton);
			if(mButton.getAttribute('value')=="Submit"){
				// while(bpInputBox.value!==sbp+'/'+dbp){
				// 	// console.log(bpInputBox.value);
				// }
				mButton.click();
			}
		}
	});

	var timer = setInterval(function(){
		if(measurementWindow.closed){
			// console.log(cursorLocation);
			activeNote.value = [oldvalue.slice(0, cursorLocation),'\n',oldvalue.slice(cursorLocation)].join('');
			activeNote.focus();
			activeNote.setSelectionRange(cursorLocation+1,cursorLocation+1);
			clearInterval(timer);
		}
	},100);
}
