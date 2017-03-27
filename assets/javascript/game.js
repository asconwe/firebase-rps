/*eslint-env jquery, browser*/

function runGame(myName, opponentName, gameKey, wins, losses) {
    var results = { 
    	// All possible plays and results
    	rp: 'p',
    	ps: 's',
    	sr: 'r',
    	pr: 'p',
    	sp: 's',
    	rs: 'r'
    };
    
    //Debuggin
    var isFalse = false;

    var myMove = ''; // User's choice of rock, paper, or scissors
    var oppoMove = ''; // Opponents choice of rock, paper, or scissors
    var opRefString = gameKey + '/moves/' + opponentName;

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
    	database.ref(gameKey + '/moves/' + myName).update({
    		move: move
    	});
    	return true;
    }
    
    // Display moves
    function showPossibleMoves() {
    	var rock = '<div id="rock" class="move" data-move="r"><h1>rock: \<\></h1></div>';
    	var paper = '<div id="paper" class="move" data-move="p"><h1>paper: [ ]</h1></div>';
    	var scissors = '<div id="scissors" class="move" data-move="s"><h1>scissors: 8\<</h1></div>';
    	$('#display').html(rock + paper + scissors);
    	setMoveClickHandler();
    	return true;    	
    }

    function showScore() {
        var myScore = $('<span class="my">' + myName + ': ' + wins + '</span>');
        var opponentScore = $('<span class="op">' + opponentName + ': ' + losses + '</span>')
        $('#score').html(myScore);
        $('#score').append(opponentScore);
    }
    
    // Display a 'waiting for opponent' message
    function displayWaiting() {
        $('#display').html('<br><br><br><p>Waiting for ' + opponentName + '\'s move</br>');
    }
    
    function getFullStr(move) {
        if (move === 's') {
            return 'scissors'
        } else if (move === 'p') {
            return 'paper'
        } else {
            return 'rock'
        }
    }

    // Display the result of the match
    function displayResult(winnerString) {
        $('#display').html('<br><br><br><p>' + myName + ': ' + getFullStr(myMove) + '</p><br><p>' + opponentName + ': ' + getFullStr(oppoMove) + '</p><br><p>' + winnerString + ' wins</p><br><br>');
    }
    
    // Display the 'New Game' button
    function displayNewGameButton() {
        $('#display').append('<button id="newGame">New Game</button>');
        setNewGameClickHandler();
        setNewGameDatabaseListener();
    }
    
    // Display a 'waiting for opponent to join' message
    function displayWaitingReset() {
        $('#display').html('<br><br><br><p>Waiting for ' + opponentName + ' to join the next match</p>');
    }
    
    // Set the database listener for resetting the game
    function setNewGameDatabaseListener() {
        database.ref(gameKey + '/newGame').on('value', function(snapshot){
            // If both users have submitted their move
            if (snapshot.val()[myName] !== null || snapshot.val()[opponentName] !== null) {
                if (snapshot.val()[myName] !==  undefined) {
                    displayWaitingReset();
                    if (snapshot.val()[opponentName] !== undefined) {
                        database.ref(gameKey + '/newGame/').set({});
                        runGame(myName, opponentName, gameKey, wins, losses);
                    }
                }
            }
        });
    }
    
    // Set the click handler for the newGame button
    function setNewGameClickHandler() {
        $('#newGame').click(function() {
            database.ref(gameKey + '/newGame/' + myName).set({
                reset: true
            });
            database.ref(gameKey + '/moves/').set({});
        });
    }
    
    //  Set the click handler for the possible moves
    function setMoveClickHandler() {
        // Get current user's move
        $('.move').click(function(){
            // Save the user's move
        	myMove = $(this).data('move');
        	// Submit the move and return true
        	var myMoveIsThrown = submitMove(gameKey, myMove);     
        });
    }

    // When the game is loaded, do these things    
    // Show move options
    showPossibleMoves();

    showScore();
    
    // Set the click handler
    setMoveClickHandler();
    
    // Listen for opponent moves to be added to the database
    database.ref(gameKey + '/moves').on('value', function(snapshot) {
        // If both users have submitted their move
        if (snapshot.val()[myName] !== null || snapshot.val()[opponentName] !== null) {
            if (snapshot.val()[myName] !==  undefined) {
                displayWaiting();
                if (snapshot.val()[opponentName] !== undefined) {
                    console.log('really made it');
                    myMove = snapshot.val()[myName].move;
                    oppoMove = snapshot.val()[opponentName].move;
                    console.log(myMove, oppoMove);
                    // Check if it is a tie
                    if (isTie(myMove, oppoMove)) {
                        displayResult('It\'s a tie! Everyone (and no one)');
                    // If not a tie
                    } else {
                        // If user won
                        if (isWinner(myMove, oppoMove)) {
                            displayResult(myName);                           
                            wins++;
                        // If user lost
                        } else {
                            displayResult(opponentName);
                            losses++;
                        }  
                        showScore();
                    } 
                    displayNewGameButton();
                }
            }
        }
    });
}