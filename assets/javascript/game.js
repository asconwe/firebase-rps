/*eslint-env jquery, browser*/
/*globals database */

// Animates to a new background color -- Dependent on jQuery Color
function newBackgroundColor(target) {
    function randomDarkColorValue() {
        return String(Math.floor(Math.random() * 5)) + String(Math.floor(Math.random() * 9));
    }
    
    function randomMediumColorValue() {
        return String(Math.floor((Math.random() * 5) + 5)) + String(Math.floor(Math.random() * 9));
    }
    
    function getHexColor(a, b, c) {
        var randNumb = Math.floor(Math.random() * 3);
        if (randNumb === 1) {
            return '#' + a + b + c;
        } else if (randNumb === 2) {
            return '#' + b + c + a;
        }
        return '#' + c + a + b;
    }
    
    var a = randomDarkColorValue();
    var b = randomDarkColorValue();
    var c = randomMediumColorValue();
    var randomColor = getHexColor(a, b, c);
    $(target).animate({backgroundColor: randomColor} , 200, function(){
    });
}

// Runs the game
function runGame(myName, opponentName, gameKey, wins, losses, database) {
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

        // Game logic
    
        // Return true if it is a tie
        function isTie(m1, m2) {
        	return m1 === m2;
        }
        
        // Return true if you win, false if not
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
        
        // Display functions

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
            var opponentScore = $('<span class="op">' + opponentName + ': ' + losses + '</span>');
            $('#score').html(myScore);
            $('#score').append(opponentScore);
        }
        
        // Display a 'waiting for opponent' message
        function displayWaiting() {
            $('#display').html('<br><br><br><p>Waiting for ' + opponentName + '\'s move</br>');
        }
        
        function getFullStr(move) {
            if (move === 's') {
                return 'scissors';
            } else if (move === 'p') {
                return 'paper';
            } 
            return 'rock';
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
                if (snapshot.val() !== null) {
                    if (snapshot.val()[myName] !==  undefined) {
                        displayWaitingReset();
                        if (snapshot.val()[opponentName] !== undefined) {
                            database.ref(gameKey + '/newGame/').set({});
                            // Show move options
                            showPossibleMoves();
                            showScore();
                            // Set the click handler
                            setMoveClickHandler();
                            newBackgroundColor('body');
                            database.ref(gameKey + '/newGame').off('value');
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
            	submitMove(gameKey, myMove);     
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
            if (snapshot.val() !== null) {
                if (snapshot.val()[myName] !==  undefined) {
                    displayWaiting();
                    if (snapshot.val()[opponentName] !== undefined) {
                        myMove = snapshot.val()[myName].move;
                        oppoMove = snapshot.val()[opponentName].move;
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
                        newBackgroundColor('body');
                        displayNewGameButton();
                    }
                }
            }
        });
}