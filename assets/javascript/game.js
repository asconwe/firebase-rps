/*eslint-env jquery, browser*/

function runGame(myName, opponentName, gameKey) {
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
    var myMoveKey; // The unique ID of the Users move in database
    var myMoveIsThrown = false;
    var opponentMoveIsThrown = false;
    var myWins = 0;
    var myLosses = 0;
    var myTies = 0;
    var winString = "Win";
    var lossString = 'Loss';
    var tieString = 'Tie';
    var opRefString = gameKey + '/' + opponentName;
    console.log('gk', gameKey, 'opref', opRefString);
    
    // Return true if it is a tie
    function isTie(m1, m2) {
    	return m1 === m2;
    }
    
    
    // Return the true if you win, false if not
    function isWinner(m1, m2) {
    	var winningMove = results[m1 + m2];
    	if (winningMove === m1) {
    		return true;
    	}
    	return false;
    }
    
    // Add the move to the database
    function submitMove(gameKey, move) {
    	database.ref(gameKey + '/' + myName).set({
    		move: move
    	});
    	return true;
    }
    
    // Display moves
    function showPossibleMoves() {
    	var rock = '<div id="rock" class="move" data-move="r"><h1>rock</h1></div>';
    	var paper = '<div id="paper" class="move" data-move="p"><h1>paper</h1></div>';
    	var scissors = '<div id="scissors" class="move" data-move="s"><h1>scissors</h1></div>';
    	$('#display').html(rock + paper + scissors);
    	return true;
    }
    
    // Display a 'waiting for opponent message'
    function displayWaiting() {
        $('#display').html('<h2>Waiting for your opponent\'s move</h2>');
    }
    
    // Display the result of the match
    function displayResult(resultString) {
        $('#display').html('<h1>' + resultString + '</h1>');
    }
    
    // Display the 'New Game' button
    function displayNewGameButton() {
        $('#display').append('<button id="newGame">New Game</button>');
    }

    // When the game is loaded, do these things    
    // Show move options
    showPossibleMoves();
    
    // Get current user's move
    $('.move').click(function(){
        if (canMove) {
        	myMove = $(this).data('move');
        	// Submit the move and return true
        	myMoveIsThrown = submitMove(gameKey, myMove);
        	canMove = false;
        	if (opponentMoveIsThrown) {
                if (isTie(myMove, oppoMove)) {
                    myTies++;
                    displayResult(tieString);
                    displayNewGameButton();
                } else {
                    if (isWinner(myMove, oppoMove)) {
                        myWins++;
                        displayResult(winString);
                        displayNewGameButton();
                    } else {
                        myLosses++;
                        displayResult(lossString);
                        displayNewGameButton();
                        
                    }  
                } 
            }
    	}
    
    });
    
    database.ref(opRefString).on('value', function(snapshot) {
        console.log('heard something');
        oppoMove = snapshot.val();
        if (myMoveIsThrown) {
            if (isTie(myMove, oppoMove)) {
                myTies++;
                displayResult(tieString);
                displayNewGameButton();
            } else {
                if (isWinner(myMove, oppoMove)) {
                    myWins++;
                    displayResult(winString);
                    displayNewGameButton();
                } else {
                    myLosses++;
                    displayResult(lossString);
                    displayNewGameButton(); 
                    
                }  
            } 
        }
    });
//    // When a child is added
//    database.ref(gameKey).on('child_added', function(chSnapshot) {
//    	// If it was the first move
//    	if (!firstMoveHappened) {
//    		// If it was my move -- this is broken because myMovekey is set asynchronously and the callback happens after
//    		console.log(chSnapshot.key, 'should equal', myMoveKey);
//    		if (isMyMove(chSnapshot.key, myMoveKey)) {
//    			myMove = chSnapshot.val().move;
//    			canMove = false;
//    			displayWaiting();
//    		// If it wasn't my move
//    		} else {
//    			// iAmPlayerOne = false;
//    			oppoMove = chSnapshot.val().move;
//    		}
//    		firstMoveHappened = true;
//    	// If it wasn't the first move
//    	} else {
//    		// If it was my move
//    		if (isMyMove(chSnapshot.key, myMoveKey)) {
//    			myMove = chSnapshot.val().move;
//    			canMove = false;
//    		// If it wasn't my move
//    		} else {
//    			oppoMove = chSnapshot.val().move;
//    		}
//    		if (!isTie(myMove, oppoMove)) {
//    			if (isWinner(myMove, oppoMove)) {
//    				myWins++;
//    				displayResult(winString);
//    				displayNewGameButton();
//    			} else {
//    				myLosses++;
//    				displayResult(lossString);
//    				displayNewGameButton();
//    			}
//    		} else {
//    			myTies++;
//    			displayResult(tieString);
//    			displayNewGameButton();
//    		}
//    		database.ref().remove();
//    	}
//    });
}