function AudioSynthView() {

	var isMobile = !!navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
	if(isMobile) { var evtListener = ['touchstart', 'touchend']; } else { var evtListener = ['mousedown', 'mouseup']; }

	var __audioSynth = new AudioSynth();
	__audioSynth.setVolume(0.5);
	var __octave = 4;
	
	// Change octave
	var fnChangeOctave = function(x) {

		x |= 0;
	
		__octave += x;
	
		__octave = Math.min(5, Math.max(3, __octave));
	
		var octaveName = document.getElementsByName('OCTAVE_LABEL');
		var i = octaveName.length;
		while(i--) {
			var val = parseInt(octaveName[i].getAttribute('value'));
			octaveName[i].innerHTML = (val + __octave);
		}
	
		document.getElementById('OCTAVE_LOWER').innerHTML = __octave-1;
		document.getElementById('OCTAVE_UPPER').innerHTML = __octave+1;
	
	};

	const metricToNormal = {
		'C': 'C',
		'M1': 'C#',
		'M2': 'D',
		'M3': 'F',
		'M4': 'F#',
		'M5': 'G',
		'M6': 'G#',
		'M7': 'A',
		'M8': 'A#',
		'M9': 'B',
	}

	function getPair(metricId, septaveId) {
		// *** TODO: Can we take it as a number? (to save quotes below)
		return metricToNormal[metricId] + ',' + septaveId
	}

	// Key bindings, notes to keyCodes.
	// *** This obviously needs to change, but for now we can keep the keys
	var keyboard = {
		
			/* 2 */
			50: getPair('M1', -1), //'C#,-1',
			
			/* 3 */
			// 51: 'D#,-1',
			
			/* 4 */
			52: getPair('M4', -1),

			/* 5 */
			53: getPair('M6', -1), //'F#,-1',
			
			/* 6 */
			54: getPair('M8', -1), //'G#,-1',
			
			/* 7 */
			// 55: 'A#,-1',
			
			/* 8 */
			56: getPair('M1', 0),

			/* 9 */
			//57: 'C#,0',
			
			// *** These aren't labeld right, and the - sign is wrong
			/* 0 */
			48: getPair('M4', 0), //'D#,0',
			
			/* - ???? */
			45: getPair('M6', 0),

			/* +  ??? Why does this work (sort of)*/
			// 187: getPair('M8', 0), //'F#,0',

			/* = */
			61: getPair('M8', 0), //'F#,0',
			
			/* Q */
			81: 'C,-1',
			
			/* W */
			87: 'D,-1',
			
			/* E */
			69: getPair('M3', "-1"), //'E,-1',
			
			/* R */
			82: getPair('M5', "-1"), //'F,-1',
			
			/* T */
			84: getPair('M7', "-1"), //'G,-1',
			
			/* Y */
			89: getPair('M9', "-1"), //'A,-1',
			
			/* U */
			85: getPair('C', "0"), //'B,-1',
			
			/* I */
			73: getPair('M2', "0"), //'C,0',
			
			/* O */
			79: getPair('M3', "0"), //'D,0',
			
			/* P */
			80: getPair('M5', "0"), //'E,0',
			
			/* [ */
			219: getPair('M7', "0"), //'F,0',
			
			/* ] */
			221: getPair('M9', "0"), //'G,0',
		
			/* A */
			65: 'G#,0',
		
			/* S */
			83: 'A#,0',
			
			/* F */
			70: 'C#,1',
		
			/* G */
			71: 'D#,1',
		
			/* J */
			74: 'F#,1',
		
			/* K */
			75: 'G#,1',
		
			/* L */
			76: 'A#,1',
		
			/* Z */
			90: getPair('C', "1"), //'A,0',
		
			/* X */
			88: getPair('M2', "1"), //'B,0',
		
			/* C */
			67: getPair('M3', "1"), //'C,1',
		
			/* V */
			86: getPair('M5', "1"), //'D,1',
		
			/* B */
			66: getPair('M7', "1"), //'E,1',
		
			/* N */
			78: getPair('M9', "1"), //'F,1',
		
			/* M */
			//77: 'G,1',
			
			/* , */
			//188: 'A,1',
			
			/* . */
			//190: 'B,1',

			// * (numpad)
			42: 'M1,0', // What's the second number? Looks like boosting by an octave

			// -		
			44: "M2,0",		
		};
	
	var reverseLookupText = {};
	var reverseLookup = {};

	// Create a reverse lookup table.
	// *** Likewise
	for(var i in keyboard) {
	
		var val;

		switch(i|0) {
		
			case 187:
				val = 61;
				break;
			
			case 219:
				val = 91;
				break;
			
			case 221:
				val = 93;
				break;
			
			case 188:
				val = 44;
				break;
			
			case 190:
				val = 46;
				break;
			
			default:
				val = i;
				break;
			
		}
	
		reverseLookupText[keyboard[i]] = val;
		reverseLookup[keyboard[i]] = i;
	
	}

	// Keys you have pressed down.
	var keysPressed = [];
	var visualKeyboard = null;
	var selectSound = null;

	function shouldSkip(noteName) {
		// *** Should be D and D# - but why do things not cycle correctly?
		return noteName == "D#" || noteName == "E"
	}

	var oldNoteToNew = {
		'C': 'C',
		'C#': 'M1',
		'D': 'M2',
		'D#': 'unused',
		'E': 'unused',
		'F': 'M3',
		'F#': 'M4',
		'G': 'M5',
		'G#': 'M6',
		'A': 'M7',
		'A#': 'M8',
		'B': 'M9',
	}

	var fnCreateKeyboard = function(keyboardElement) {
		// Generate keyboard
		// This is our main keyboard element! It's populated dynamically based on what you've set above.
		visualKeyboard = document.getElementById('keyboard');
		selectSound = document.getElementById('sound');

		var iKeys = 0;
		var iWhite = 0;
		// *** This is why we get all the notes shown
		// Not clear if we can change this - for now we can hack around it.,
		var notes = __audioSynth._notes; 

		for(var i=-1;i<=1;i++) { // fancy way of saying the three octaves shown
			for(var n in notes) {
				if (shouldSkip(n))
				{
					continue;
				}
				console.log("Creating key: " + n)

				// Oh, and change it so that D and D# are removed instead, so it's easier to handle
				const notInSomeKindOfBogusCondition = n[2] != 'b'
				if(notInSomeKindOfBogusCondition) {
					var thisKey = document.createElement('div');
					var isBlack = (n.length > 1)

					if(isBlack) {
						thisKey.className = 'black key';
						thisKey.style.width = '30px';
						thisKey.style.height = '120px';
						thisKey.style.left = (40 * (iWhite - 1)) + 25 + 'px';
					} else {
						thisKey.className = 'white key';
						thisKey.style.width = '40px';
						thisKey.style.height = '200px';
						thisKey.style.left = 40 * iWhite + 'px';
						iWhite++;
					}
					var label = document.createElement('div');
					label.className = 'label';
					
					// *** Seems we need to keep the old values in the HTML, so we convert here to display the M values
					var metricKeyLabel = oldNoteToNew[n]; // substr(0,1);

					// This is just confusing when we have letters as notes
					var octaveNumberIgnored = '' // (__octave + parseInt(i))
					var optionalSharpIgnored = '' // (n.substr(1,1)?n.substr(1,1):'');

					label.innerHTML = '<b>' + String.fromCharCode(reverseLookupText[n + ',' + i]) + '</b>' + '<br /><br />' + metricKeyLabel +
						'<span name="OCTAVE_LABEL" value="' + i + '">' + octaveNumberIgnored + '</span>' + optionalSharpIgnored;
					thisKey.appendChild(label);
					thisKey.setAttribute('ID', 'KEY_' + n + ',' + i);
					thisKey.addEventListener(evtListener[0], (function(_temp) { return function() { fnPlayKeyboard({keyCode:_temp}); } })(reverseLookup[n + ',' + i]));
					visualKeyboard[n + ',' + i] = thisKey;
					visualKeyboard.appendChild(thisKey); // *** This is where we actually stick it on
					iKeys++; // *** What is this for?
				}
			}
		}

		visualKeyboard.style.width = iWhite * 40 + 'px';

		window.addEventListener(evtListener[1], function() { n = keysPressed.length; while(n--) { fnRemoveKeyBinding({keyCode:keysPressed[n]}); } });
	
	};

	// Creates our audio player
	var fnPlayNote = function(note, octave) {

		src = __audioSynth.generate(selectSound.value, note, octave, 2);
		container = new Audio(src);
		container.addEventListener('ended', function() { container = null; });
		container.addEventListener('loadeddata', function(e) { e.target.play(); });
		container.autoplay = false;
		container.setAttribute('type', 'audio/wav');
		/*document.body.appendChild(container);*/
		container.load();
		return container;
	
	};

	// Detect keypresses, play notes.

	var fnPlayKeyboard = function(e) {
	
		var i = keysPressed.length;
		while(i--) {
			if(keysPressed[i]==e.keyCode) {
				return false;	
			}
		}
		keysPressed.push(e.keyCode);
	
		switch(e.keyCode) {
		
			// left
			case 37:
				fnChangeOctave(-1);
				break;
		
			// right
			case 39:
				fnChangeOctave(1);
				break;
		
			// space
			case 16:
				// break; // weird. Was this meant to not be there?
				fnPlaySong([
					['E,0', 8],
					['D,0', 8],
					['C,0', 2],
					['C,0', 8],
					['D,0', 8],
					['C,0', 8],
					['E,0', 8],
					['D,0', 1],
					['C,0', 8],
					['D,0', 8],
					['E,0', 2],
					['A,0', 8],
					['G,0', 8],
					['E,0', 8],
					['C,0', 8],
					['D,0', 1],
					['A,0', 8],
					['B,0', 8],
					['C,1', 2],
					['B,0', 8],
					['C,1', 8],
					['D,1', 8],
					['C,1', 8],
					['A,0', 1],
					['G,0', 8],
					['A,0', 8],
					['B,0', 2],
					['C,1', 8],
					['B,0', 8],
					['A,0', 8],
					['G,0', 8],
					['A,0', 1]
				]);
				break;
		
		}
	
		if(keyboard[e.keyCode]) {
			if(visualKeyboard[keyboard[e.keyCode]]) {
				visualKeyboard[keyboard[e.keyCode]].style.backgroundColor = '#ff0000';
				visualKeyboard[keyboard[e.keyCode]].style.marginTop = '5px';
				visualKeyboard[keyboard[e.keyCode]].style.boxShadow = 'none';
			}
			var arrPlayNote = keyboard[e.keyCode].split(',');
			var note = arrPlayNote[0];
			var octaveModifier = arrPlayNote[1]|0;
			fnPlayNote(note, __octave + octaveModifier);
		} else {
			return false;	
		}
	
	}

	// Remove key bindings once note is done.

	var fnRemoveKeyBinding = function(e) {
	
		var i = keysPressed.length;
		while(i--) {
			if(keysPressed[i]==e.keyCode) {
				if(visualKeyboard[keyboard[e.keyCode]]) {
					visualKeyboard[keyboard[e.keyCode]].style.backgroundColor = '';
					visualKeyboard[keyboard[e.keyCode]].style.marginTop = '';
					visualKeyboard[keyboard[e.keyCode]].style.boxShadow = '';
				}
				keysPressed.splice(i, 1);
			}
		}
	
	}

	var fnPlaySong = function(arr) {
	
		if(arr.length>0) {
		
			var noteLen = 1000*(1/parseInt(arr[0][1]));
			if(!(arr[0][0] instanceof Array)) {
				arr[0][0] = [arr[0][0]];	
			}
			var i = arr[0][0].length;
			var keys = [];
			while(i--) {
				keys.unshift(reverseLookup[arr[0][0][i]]);
				fnPlayKeyboard({keyCode:keys[0]});
			}
			arr.shift();
			setTimeout(function(array, val){ return function() { var i = val.length; while(i--) { fnRemoveKeyBinding({keyCode:val[i]}); } fnPlaySong(array); } }(arr, keys), noteLen);
		
		}
	
	};

	// Set up global event listeners

	window.addEventListener('keydown', fnPlayKeyboard);
	window.addEventListener('keyup', fnRemoveKeyBinding);
	document.getElementById('-_OCTAVE').addEventListener('click', function() { fnChangeOctave(-1); });
	document.getElementById('+_OCTAVE').addEventListener('click', function() { fnChangeOctave(1); });
	
	Object.defineProperty(this, 'draw', {
		value: fnCreateKeyboard
	});

}