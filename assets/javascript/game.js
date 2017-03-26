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
    
    //Debuggin
    var isFalse = false;

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
    var opRefString = gameKey + '/moves/' + opponentName;
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
    	database.ref(gameKey + '/moves/' + myName).update({
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
            // If both users have submitted their move
            if (snapshot.val()[myName] !== null || snapshot.val()[opponentName] !== null) {
                if (snapshot.val()[myName] !==  undefined) {
                    displayWaitingReset();
                    if (snapshot.val()[opponentName] !== undefined) {
                        database.ref(gameKey + '/newGame/').set({});
                        runGame(myName, opponentName, gameKey);
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
        	myMoveIsThrown = submitMove(gameKey, myMove);     
        });
    }

    // When the game is loaded, do these things    
    // Show move options
    showPossibleMoves();
    
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
                        console.log('tie');
                        myTies++;
                        displayResult(tieString);
                        displayNewGameButton();
                    // If not a tie
                    } else {
                        console.log('non-tie');
                        // If user won
                        if (isWinner(myMove, oppoMove)) {
                            console.log('win');
                            myWins++;
                            displayResult(winString);
                            displayNewGameButton();
                        // If user lost
                        } else {
                            console.log('lose');
                            myLosses++;
                            displayResult(lossString);
                            displayNewGameButton();
                            
                        }  
                    } 
                }
            }
        }
    });
}