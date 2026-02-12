// ==UserScript==
// @name        EncounterHotkey
// @namespace   http://dev.drbillylin.com/oscarwiki
// @description	Listens for hotkeys and do oscar functions. Eg. entering BP measurement when user types "BP 120/90".
// @include     */casemgmt/forward.jsp?action=view*
// @version     1.2026
// @grant       none
// @author		Billy Lin
// @updateURL	https://github.com/linbilly/EncounterHotkey/raw/master/EncounterHotkey.meta.js
// @downloadURL	https://github.com/linbilly/EncounterHotkey/raw/master/EncounterHotkey.user.js
// ==/UserScript==

// The BP measurement group needs to be created first for this to work. 

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
	document.getElementsByTagName("body")[0].appendChild(myframe);

	setTimeout(function(){

		activeNote = document.getElementsByName("caseNote_note")[0];
		activeNote.addEventListener("keypress", findString);


		function findString(e){

			const evt = e || window.event; // compliant with ie6     

			//if the user presses "Enter", proceed
			if (evt.keyCode == 13) { 

				cursorLocation = activeNote.selectionStart;
				oldvalue = activeNote.value;
				var previousLines = activeNote.value.substring(0, cursorLocation).split('\n');

				var lastLine = previousLines[previousLines.length-1];
				var resultArray;

				var bpRegex = /BP\s*(\d+\/\d+)/gi;
				if((resultArray=bpRegex.exec(lastLine))!==null){
					enterBPMeasurement(resultArray[1],"sitting position");
				}

				var supinebpRegex = /Supine BP\s*(\d+\/\d+)/gi;
				if((resultArray=supinebpRegex.exec(lastLine))!==null){
					enterBPMeasurement(resultArray[1],"supine");
				}

				var standingbpRegex = /Standing BP\s*(\d+\/\d+)/gi;
				if((resultArray=standingbpRegex.exec(lastLine))!==null){
					enterBPMeasurement(resultArray[1],"standing position");
				}

				var standingbpRegex = /BP Tru\s*(\d+\/\d+)/gi;
				if((resultArray=standingbpRegex.exec(lastLine))!==null){
					enterBPMeasurement(resultArray[1],"BP Tru");
				}


				var wtRegex = /wt\s*(\d+)\s*kg/gi;
				if((resultArray = wtRegex.exec(lastLine))!==null){
					enterMeasurement(resultArray[1],"inputValue-2")
				}

				var tempRegex = /temp\s*(\d+)/gi;
				if((resultArray = tempRegex.exec(lastLine))!==null){
					enterMeasurement(resultArray[1],"inputValue-3")
				}

				var cbgRegex = /cbg\s*(\d+(\.\d+)?)\s*mmol\/L/gi;
				if((resultArray = cbgRegex.exec(lastLine))!==null){
					enterMeasurement(resultArray[1],"inputValue-1")
				}

				var rrRegex = /rr\s*(\d+)/gi;
				if((resultArray = rrRegex.exec(lastLine))!==null){
					enterMeasurement(resultArray[1],"inputValue-5")
				}

				var hrRegex = /hr\s*(\d+)/gi;
				if((resultArray = hrRegex.exec(lastLine))!==null){
					enterMeasurement(resultArray[1],"inputValue-6")
				}

			}
		}
	},2000);
}, false);

function enterMeasurement(mValue, boxLocation){

	console.log(mValue, boxLocation); 
	var pathArray = window.location.pathname.split( '/' );
	var newURL = window.location.protocol + "//" + window.location.host +"/"+pathArray[1]+"/oscarEncounter/oscarMeasurements/SetupMeasurements.do?groupName=Patient%20Vital%20Measurements";
	var measurementWindow = window.open(newURL, "hiddenWin");

	document.getElementById("hiddenWin").onload = function(){
		var inputbox = document.getElementById("hiddenWin").contentDocument.getElementsByName("value("+boxLocation+")")[0];
		inputbox.value = mValue;

		// finding the submit button and clicking on it
		var measurementButtons = document.getElementById("hiddenWin").contentDocument.getElementsByName("Button");
		for(var i=0; i<measurementButtons.length; i++){
			var mButton = measurementButtons[i];
			if(mButton.getAttribute('value')=="Submit"){
				mButton.click();
				var timer = setInterval(function(){
				//after the measurement window closes, 
					activeNote.value = [oldvalue.slice(0, cursorLocation),'\n',oldvalue.slice(cursorLocation)].join('');
					activeNote.focus();
					activeNote.setSelectionRange(cursorLocation+1,cursorLocation+1);
					clearInterval(timer);
				},1000);
			}
		}
	};

}

//Method to enter BP Measurement automatically. Regex for the matchedArray is /BP\s*(\d+)\/(\d+)/gi
function enterBPMeasurement(bpReading, typeButton){


	var pathArray = window.location.pathname.split( '/' );
	var newURL = window.location.protocol + "//" + window.location.host +"/"+pathArray[1]+"/oscarEncounter/oscarMeasurements/SetupMeasurements.do?groupName=Patient%20Vital%20Measurements";
	var measurementWindow = window.open(newURL, "hiddenWin");

	document.getElementById("hiddenWin").onload = function(){
		var bpInputBox = document.getElementById("hiddenWin").contentDocument.getElementsByName("value(inputValue-0)")[0];
		bpInputBox.value = bpReading; 

		var typeButtons = document.getElementById("hiddenWin").contentDocument.getElementsByName("value(inputMInstrc-0)"); 
		for(var i=0; i<typeButtons.length; i++){
			var tButton = typeButtons[i];
			if(tButton.getAttribute('value')==typeButton){
				tButton.checked = true; 
			}
		}
			

		// finding the submit button and clicking on it
		var measurementButtons = document.getElementById("hiddenWin").contentDocument.getElementsByName("Button");
		for(var i=0; i<measurementButtons.length; i++){
			var mButton = measurementButtons[i];
			if(mButton.getAttribute('value')=="Submit"){
				mButton.click();
				var timer = setInterval(function(){
				//after the measurement window closes, 
					activeNote.value = [oldvalue.slice(0, cursorLocation),'\n',oldvalue.slice(cursorLocation)].join('');
					activeNote.focus();
					activeNote.setSelectionRange(cursorLocation+1,cursorLocation+1);
					clearInterval(timer);
				},1000);
			}
		}
	};
}
