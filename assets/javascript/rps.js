// Initialize Firebase
var config = {
	apiKey: "AIzaSyA3XgUuHlSTizqtriwrHWFNjlb0FD0AoLM",
	authDomain: "mygreatapp-9e858.firebaseapp.com",
	databaseURL: "https://mygreatapp-9e858.firebaseio.com",
	storageBucket: "mygreatapp-9e858.appspot.com",
	messagingSenderId: "1016802631233"
};
firebase.initializeApp(config);

var database = firebase.database();

var results = { 
	// All possible plays and results
	rp: 'p',
	ps: 's',
	sr: 'r',
	pr: 'p',
	sp: 's',
	rs: 'r'
};

var myMove; // User's choice of rock, paper, or scissors
var oppoMove; // Opponents choice of rock, paper, or scissors
var canMove = true; // User is allowed to make a move
var iAmPlayerOne = true; // User is player one
var firstMoveHappened = false; // The first Move has happened
var myMoveKey; // The unique ID of the Users move in database
var myWins = 0;
var myLosses = 0;
var myTies = 0;

function isTie(m1, m2) {
	return (m1 === m2);
}

// Display moves
function showPossibleMoves() {
	var rock = '<div id="rock" class="move" data-move="r"><h1>rock</h1></div>';
	var paper = '<div id="paper" class="move" data-move="p"><h1>paper</h1></div>';
	var scissors = '<div id="scissors" class="move" data-move="s"><h1>scissors</h1></div>';
	$('#display').html(rock + paper + scissors)
	return true;
};

// Return the winning move
function isWinner(m1, m2) {
	var winningMove = results[m1 + m2];
	if (winningMove === m1) {
		return true
	}
	return false
};

// Check if the move in the snapshot is the user's move
function isMyMove(snapshotKey, myMoveKey) {
	return (snapshotKey === myMoveKey);
}

// Add the move to the database
function submitMove(move) {
	var pushRef;
	database.ref().push({
		move: move
	}).then(function(snap){
		pushRef = snap.key;
	});

	return pushRef;
};

// Initialize page
showPossibleMoves();

// Get current user's move
$('.move').click(function(){
	myMove = $(this).data('move');
	// Submit the move and return the unique key
	myMoveKey = submitMove(localMove);
	userHasSubmittedMove = true;
});

// Database listener

// When a child is added
database.ref().on('child_added', function(chSnapshot) {
	// If it was the first move
	if (!firstMoveHappened) {
		// If it was my move
		if (isMyMove(chSnapshot.key, myMoveKey)) {
			myMove = chSnapshot.val().move;
			canMove = false;
		// If it wasn't my move
		} else {
			// iAmPlayerOne = false;
			oppoMove = chSnapshot.val().move;
		};
		firstMoveHappened = true;
	// If it wasn't the first move
	} else {
		// If it was my move
		if (isMyMove(chSnapshot.key, myMoveKey)) {
			myMove = chSnapshot.val().move;
		// If it wasn't my move
		} else {
			oppoMove = chSnapshot.val().move;
		};
		if (!isTie(myMove, oppoMove)) {
			if (isWinner(myMove, oppoMove)) {
				myWins++;
				displayResult(winString);
				displayNewGameButton();
			} else {
				myLosses++;
				displayResult(lossString);
				displayNewGameButton();
			};
		} else {
			myTies++;
			displayResult(tieString);
			displayNewGameButton();
		}
	};
});
