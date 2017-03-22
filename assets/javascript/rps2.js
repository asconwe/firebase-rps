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

var localMove;
var userHasSubmittedMove = false;
var localMoveKey;

function isTie(m1, m2) {
	return (m1 === m2);
}

// Return the winning move
function isWinner(m1, m2) {
	var winningMove = results[m1 + m2];
	if (winningMove === m1) {
		return true
	}
	return false
};

// Display

// Display moves
function showMoves() {
	var rock = '<div id="rock" class="move" data-move="r"><h1>rock</h1></div>';
	var paper = '<div id="paper" class="move" data-move="p"><h1>paper</h1></div>';
	var scissors = '<div id="scissors" class="move" data-move="s"><h1>scissors</h1></div>';
	$('#display').html(rock + paper + scissors)
	return true;
};



function isUsersMove(snapshotKey, localMoveKey) {
	return (snapshotKey === localMoveKey);
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
showMoves();

// Get current user's move
$('.move').click(function(){
	localMove = $(this).data('move');
	// Submit the move and return the unique key
	localMoveKey = submitMove(localMove);
	userHasSubmittedMove = true;
});

// Database listener

// When a child is added
database.ref().on('child_added', function(chSnapshot) {
	var snapshotKey = chSnapshot.key;
	// If you have submitted a move already
	if (userHasSubmittedMove) {
		// And the move that triggered this listener is not the user's move
		if (!isUsersMove(snapshotKey, localMoveKey)) {
			// get the opponent move
			var opponentMove = chSnapshot.val().move;
			console.log('op move:', opponentMove, ', user move:', localMove);
			if (isTie(localMove, opponentMove)) {
				console.log('tie');
			} else {
				var didWin = isWinner(localMove, opponentMove)
				console.log('you won', didWin);
				// displayWinner(didWin)
			};
			// Initialize next game
			database.ref().remove();
			userHasSubmittedMove = false;
		};
	};
});
