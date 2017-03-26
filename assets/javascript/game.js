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
    
    var myMove = ''; // User's choice of rock, paper, or scissors
    var oppoMove = ''; // Opponents choice of rock, paper, or scissors
    var myMoveIsThrown = false;
    var opponentMoveIsThrown = false;
    var resetOnMyClick = false;
    var resetOnOpponentClick = false;
    var myWins = 0;
    var myLosses = 0;
    var myTies = 0;
    var winString = "Win";
    var lossString = 'Loss';
    var tieString = 'Tie';
    var opRefString = gameKey + '/' + opponentName;
    console.log('new game:', myMoveIsThrown, opponentMoveIsThrown, resetOnMyClick, resetOnOpponentClick, myMove, oppoMove);
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
    	setMoveClickHandler();
    	return true;    	
    }
    
    // Display a 'waiting for opponent' message
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
        setNewGameClickHandler();
        setNewGameDatabaseListener();
    }
    
    // Display a 'waiting for opponent to join' message
    function displayWaitingReset() {
        $('#display').html('<h2>Waiting for you opponent to join the next match</h2>');
    }
    
    // Set the database listener for resetting the game
    function setNewGameDatabaseListener() {
        database.ref(gameKey + '/newGame').on('value', function(snapshot){
            console.log('listener Called');
            if (snapshot.val() === opponentName) {
                console.log('entered first');
                resetOnMyClick = true;
                console.log('on my click', resetOnMyClick);
                if (resetOnOpponentClick) {
                    console.log('happening');
                    // Clear moves
                    database.ref(gameKey + '/' + opponentName).remove();
                    database.ref(gameKey + '/' + myName).remove();
                    database.ref(gameKey + '/newGame').remove();
                    // Initiate a new game
                    database.ref().off();
                    $('#move').off('click');
                    runGame(myName, opponentName, gameKey);   
                }
            } else if (snapshot.val() === myName) {
                console.log('entered second');
               
            } else {
                console.log('did not enter if statement at all, snapshot user was:', snapshot.val());
            }
        });
    }
    
    // Set the click handler for the newGame button
    function setNewGameClickHandler() {
        $('#newGame').click(function() {
            if (resetOnMyClick) {
                database.ref(gameKey).update({
                    newGame: myName
            });
            // Clear moves
            database.ref(gameKey + '/' + opponentName).remove();
            database.ref(gameKey + '/' + myName).remove();
            database.ref(gameKey + '/newGame').remove();
            // Initiate a new game
            database.ref().off();
            $('#move').off('click');
            runGame(myName, opponentName, gameKey);
            } else {
                displayWaitingReset();
                database.ref(gameKey).update({
                    newGame: myName
                });
            }
            resetOnOpponentClick = true;
            console.log('on opponent click', resetOnOpponentClick);
        });
    }
    
    //  Set the click handler for the possible moves
    function setMoveClickHandler() {
        // Get current user's move
        $('.move').click(function(){
            // If user has not yet submitted a move
            if (!myMoveIsThrown) {
                // Save the user's move
            	myMove = $(this).data('move');
            	// Submit the move and return true
            	myMoveIsThrown = submitMove(gameKey, myMove);
            	// If the opponent has submitted a move, then compare user and opponent moves
            	if (opponentMoveIsThrown) {
            	    console.log('entered from click');
            	    // Check for a tie
                    if (isTie(myMove, oppoMove)) {
                        myTies++;
                        displayResult(tieString);
                        displayNewGameButton();
                    // If not a tie
                    } else {
                        // If user won
                        if (isWinner(myMove, oppoMove)) {
                            myWins++;
                            displayResult(winString);
                            displayNewGameButton();
                        // If user lost
                        } else {
                            myLosses++;
                            displayResult(lossString);
                            displayNewGameButton();
                            
                        }  
                    } 
                } else {
                    displayWaiting();
                }
        	}
        
        });
    }

    // When the game is loaded, do these things    
    // Show move options
    showPossibleMoves();
    
    // Set the click handler
    setMoveClickHandler();
    
    // Listen for opponent moves to be added to the database
    database.ref(opRefString).on('value', function(snapshot) {
        if (snapshot.val() !== null && snapshot.key !== 'newGame') {
            console.log('!!!', snapshot.val());
            // Save the opponent move
            oppoMove = snapshot.val().move;
            // Register that the opponent has made a move
            opponentMoveIsThrown = true;
            // If the user has submitted a move, too
            console.log(myMoveIsThrown);
            if (myMoveIsThrown) {
                console.log('entered');
                // Check for a tie
                if (isTie(myMove, oppoMove)) {
                    myTies++;
                    displayResult(tieString);
                    displayNewGameButton();
                // If not a tie
                } else {
                    // If the user won
                    if (isWinner(myMove, oppoMove)) {
                        myWins++;
                        displayResult(winString);
                        displayNewGameButton();
                    // If the user lost
                    } else {
                        myLosses++;
                        displayResult(lossString);
                        displayNewGameButton(); 
                        
                    }  
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