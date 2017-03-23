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
var firstMoveHappened = false; // The first Move has happened
var myMoveKey; // The unique ID of the Users move in database
var myWins = 0;
var myLosses = 0;
var myTies = 0;
var winString = "Win";
var lossString = 'Loss';
var tieString = 'Tie';

function isTie(m1, m2) {
	return m1 === m2;
}

// Return the winning move
function isWinner(m1, m2) {
	var winningMove = results[m1 + m2];
	if (winningMove === m1) {
		return true;
	}
	return false;
}

// Check if the move in the snapshot is the user's move
function isMyMove(snapshotKey, myMoveKey) {
	return snapshotKey === myMoveKey;
}

// Add the move to the database
function submitMove(move) {
	database.ref().push({
		move: move
	}).then(function(snap){
		myMoveKey = snap.key;
		console.log('myMoveKey in the then function', myMoveKey);
	});
}

// Display moves
function showPossibleMoves() {
	var rock = '<div id="rock" class="move" data-move="r"><h1>rock</h1></div>';
	var paper = '<div id="paper" class="move" data-move="p"><h1>paper</h1></div>';
	var scissors = '<div id="scissors" class="move" data-move="s"><h1>scissors</h1></div>';
	$('#display').html(rock + paper + scissors)
	return true;
}

// Display a 'waiting for opponent message'
function displayWaiting() {
    console.log(waiting);
    $('#display').html('<h2>Waiting for your opponent</h2>');
}

// Display the result of the match
function displayResult(resultString) {
    $('#display').html('<h1>' + resultString + '</h1>')
}

// Display the 'New Game' button
function displayNewGameButton() {
    $('#display').append('<button id="newGame">New Game</button>');
}

// Initialize page
showPossibleMoves();

// Get current user's move
$('.move').click(function(){
    if (canMove) {
    	myMove = $(this).data('move');
    	// Submit the move and return the unique key
    	submitMove(myMove);
    	console.log('my move key', myMoveKey);
    	userHasSubmittedMove = true;
	}

});

// Database listener

// When a child is added
database.ref().on('child_added', function(chSnapshot) {
	// If it was the first move
	if (!firstMoveHappened) {
		// If it was my move
		console.log('real move:',chSnapshot.val().move)
		console.log(chSnapshot.key, 'should equal', myMoveKey)
		if (isMyMove(chSnapshot.key, myMoveKey)) {
			myMove = chSnapshot.val().move;
			canMove = false;
			displayWaiting();
		// If it wasn't my move
		} else {
			// iAmPlayerOne = false;
			oppoMove = chSnapshot.val().move;
		}
		firstMoveHappened = true;
	// If it wasn't the first move
	} else {
		// If it was my move
		console.log('real move:', chSnapshot.val().move)
		if (isMyMove(chSnapshot.key, myMoveKey)) {
			myMove = chSnapshot.val().move;
			canMove = false;
		// If it wasn't my move
		} else {
			oppoMove = chSnapshot.val().move;
		}
		if (!isTie(myMove, oppoMove)) {
			if (isWinner(myMove, oppoMove)) {
				myWins++;
				displayResult(winString);
				displayNewGameButton();
			} else {
				myLosses++;
				displayResult(lossString);
				displayNewGameButton();
			}
		} else {
			myTies++;
			displayResult(tieString);
			displayNewGameButton();
		}
		database.ref().remove();
	}
});
