function AudioSynthView() {

	const isMobile = !!navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
	if(isMobile) { var evtListener = ['touchstart', 'touchend']; } else { var evtListener = ['mousedown', 'mouseup']; }

	var __audioSynth = new AudioSynth();
	__audioSynth.setVolume(0.5);
	var __octave = 4;
	
	// Change octave (actually septave)
	var fnChangeOctave = function(x) {

		x |= 0;
	
		__octave += x;
	
		__octave = Math.min(5, Math.max(3, __octave));
	
		// Not used, since we're omitting the label
		// var octaveName = document.getElementsByName('OCTAVE_LABEL');
		// var i = octaveName.length;
		// while(i--) {
		// 	var val = parseInt(octaveName[i].getAttribute('value'));
		// 	octaveName[i].innerHTML = (val + __octave);
		// }
	
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
		return metricToNormal[metricId] + ',' + septaveId
	}

	const keyboardCode = {
		// These mostly match the ASCII values, but not always
		num2: 50,
		num4: 52,
		num5: 53,
		num6: 54,
		num8: 56,
		num0: 48,
		minus: 189,
		equals: 187, 

		Q: 81,
		W: 87,
		E: 69,
		R: 82,
		T: 84,
		Y: 89,
		U: 85,
		I: 73,
		O: 79,
		P: 80,
		bracketLeft: 219,
		bracketRight: 221,

		S: 83,
		F: 70,
		G: 71,
		H: 72,

		Z: 90,
		X: 88,
		C: 67,
		V: 86,
		B: 66,
		N: 78,

		space: 32,
	}

	// Key bindings, keyCodes to notes
	const keyboard = {
	
			[keyboardCode.num2]: getPair('M1', -1),

			[keyboardCode.num4]: getPair('M4', -1),
			[keyboardCode.num5]: getPair('M6', -1),
			[keyboardCode.num6]: getPair('M8', -1),

			[keyboardCode.num8]: getPair('M1', 0),

			[keyboardCode.num0]: getPair('M4', 0),
			[keyboardCode.minus]: getPair('M6', 0),
			[keyboardCode.equals]: getPair('M8', 0),	

			[keyboardCode.Q]: getPair('C', -1),
			[keyboardCode.W]: getPair('M2', -1),
			[keyboardCode.E]: getPair('M3', -1),
			[keyboardCode.R]: getPair('M5', -1),
			[keyboardCode.T]: getPair('M7', -1),
			[keyboardCode.Y]: getPair('M9', -1),
			
			[keyboardCode.U]: getPair('C', 0),
			[keyboardCode.I]: getPair('M2', 0),
			[keyboardCode.O]: getPair('M3', 0),
			[keyboardCode.P]: getPair('M5', 0),
			[keyboardCode.bracketLeft]: getPair('M7', 0),
			[keyboardCode.bracketRight]: getPair('M9', 0),
		
			[keyboardCode.S]: getPair('M1', 1),

			[keyboardCode.F]: getPair('M4', 1),
			[keyboardCode.G]: getPair('M6', 1),
			[keyboardCode.H]: getPair('M8', 1),
		
			[keyboardCode.Z]: getPair('C', 1),
			[keyboardCode.X]: getPair('M2', 1),
			[keyboardCode.C]: getPair('M3', 1),
			[keyboardCode.V]: getPair('M5', 1),
			[keyboardCode.B]: getPair('M7', 1),
			[keyboardCode.N]: getPair('M9', 1),
		};
	
	var reverseLookupText = {};
	var reverseLookup = {};

	// Create a reverse lookup table.
	for(var i in keyboard) {
	
		var val;

		switch(i|0) {
			// We need to special case the keys whose key codes don't match the ASCII
			case keyboardCode.equals:
				val = 61;
				break;

			case keyboardCode.minus:
				val = 45;
				break;
			
			case keyboardCode.bracketLeft:
				val = 91;
				break;
			
			case keyboardCode.bracketRight:
				val = 93;
				break;
			
			// case 188: // comma, currently unused
			// 	val = 44;
			// 	break;
			
			// case 190: // period, currently unused
			// 	val = 46;
			// 	break;
			
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
		// The original code bailed on this condition, which seems to check for a flat
		const usesFlatNotation = (noteName[2] == 'b')

		return noteName == "D#" || noteName == "E" || usesFlatNotation
	}

	const oldNoteToNew = {
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
		// *** This is why we need to deal with all of the notes.
		// We might be able to get around that if we replaced this with a custom list.
		const notes = __audioSynth._notes; 

		for(var i=-1; i<=1; i++) { // fancy way of saying the three octaves/septaves shown
			for(var noteName in notes) {
				if (shouldSkip(noteName))
				{
					continue;
				}
				
				var thisKey = document.createElement('div');
				const isBlack = (noteName.length > 1)

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
				
				const metricKeyLabel = oldNoteToNew[noteName];

				// This is just confusing when we have letters as notes
				// const octaveNumber = (__octave + parseInt(i))
				// const optionalSharp = (noteName.substr(1,1) ? noteName.substr(1,1) : '');
				const octaveLabelIgnored = '' // <span name="OCTAVE_LABEL" value="' + i + '">' + octaveNumber + '</span>' + optionalSharp

				label.innerHTML = '<b>' + String.fromCharCode(reverseLookupText[noteName + ',' + i]) + '</b>' + '<br /><br />' + metricKeyLabel + octaveLabelIgnored;
				thisKey.appendChild(label);
				thisKey.setAttribute('ID', 'KEY_' + noteName + ',' + i);
				thisKey.addEventListener(evtListener[0], (function(_temp) { return function() { fnPlayKeyboard({keyCode:_temp}); } })(reverseLookup[noteName + ',' + i]));
				visualKeyboard[noteName + ',' + i] = thisKey;
				visualKeyboard.appendChild(thisKey);
				iKeys++; // *** What is this for?
			}
		}

		visualKeyboard.style.width = iWhite * 40 + 'px';

		window.addEventListener(evtListener[1], function() { noteName = keysPressed.length; while(noteName--) { fnRemoveKeyBinding({keyCode:keysPressed[noteName]}); } });
	
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
		console.log("key code: " + e.keyCode)
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
				break; // weird. Was this meant to not be there? 
				// It doesn't happen on space though if you uncomment this
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