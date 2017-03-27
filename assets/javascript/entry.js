/*globals firebase runChat*/
/*eslint-env browser, jquery*/

$( document ).ready(function(){
    
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBh3FWJerRICwDBIA55IMaDtvm8NVoZ1rs",
        authDomain: "ropasci-2a5c8.firebaseapp.com",
        databaseURL: "https://ropasci-2a5c8.firebaseio.com",
        storageBucket: "ropasci-2a5c8.appspot.com",
        messagingSenderId: "3790041862"
    };
    firebase.initializeApp(config);
    
    var database = firebase.database();
    
    // App variables
    
    var userName;
    var openGameInterval;
    var stillListening = true;
    var gameKey;
    var opponent;
    var stillListening2 = true;
    
    // App functions
    
    // Display the waiting stuff
    function displayWaitingForOpponent() {
        $('#display').html('<p>... waiting for your opponent ...<p>');
    }
    
    // Returns the opponent's user name
    function getOppoName(user1, user2) {
        if (user1 === userName) {
            return user2;
        }
        return user1;
    }
    
    // Initialize page
    function initializePage() {
        var rps = $('<h2 id="title">1on1 RPS</h2>');
        var form = $('<form id="userName">');
        var label = $('<p id="label">Choose your user name</p>');
        var field = $('<input id="nameField" type="text">');
        var button = $('<input id="submitName" type="submit">');
        var display = $('#display');
        form.append(label);
        form.append(field);
        form.append(button);
        display.html(rps);
        display.append(form);
    
        // After you submit your username, do these things
        $('#userName').submit(function(e) {
            e.preventDefault();
            
            // Animate a new background color on the body
            newBackgroundColor('body');
            // If the name field is not empty
            if ($('#nameField').val() !== '') {
                // set the userName
                userName = $('#nameField').val();                
                // Check for an open game for 500 ms
                // If there is no open game
                openGameInterval = setTimeout(function() {
                    // Show waiting screen
                    displayWaitingForOpponent();
                    database.ref().push({
                        user1: userName
                    }).then(function(snapshot){
                        database.ref('openGame').set({
                            gameKey: snapshot.key
                        });
                        gameKey = snapshot.key;
                        database.ref(gameKey).on('child_added', function(snapshot) {
                            if (snapshot.val() !== userName && snapshot.key !== 'newGame' && stillListening2) {
                                opponent = snapshot.val();
                                runGame(userName, opponent, gameKey, 0, 0, database, runGame);
                                runChat(userName, opponent, gameKey, database);
                                stillListening2 = false;
                            }
                        });
                    });
                    stillListening = false;
                }, 500);
                
                // If there is an open game
                database.ref('openGame').once('child_added', function(snapshot) {
                    // If the open game interval hasn't timed out (so, if there is an available game, only before the game is set up)
                    if (stillListening) {
                        // Prevent no open game option from running
                        clearInterval(openGameInterval);
                        // Get the unique identifier for this game
                        gameKey = snapshot.val();
                        database.ref(gameKey).once('value', function(snapshot2) {
                            // If the opponents name is not the same as the user's name
                            if (snapshot2.val().user1 !== userName) {
                                displayWaitingForOpponent();
                                // Add the second user;
                                database.ref(gameKey).update({
                                    user2: userName,
                                    newGame: 'no'
                                }).then(function(){
                                    // Get the opponent's user name
                                    database.ref(gameKey).once('value', function(snapshot3) {
                                        var user1 = snapshot3.val().user1;
                                        var user2 = snapshot3.val().user2;
                                        opponent = getOppoName(user1, user2);
                                        runGame(userName, opponent, gameKey, 0, 0, database, runGame);
                                        runChat(userName, opponent, gameKey, database);
                                        database.ref('openGame').remove();
                                    });
                                });
                            } else {
                                $('#label').html('That\'s your opponent\'s name - pick another');
                            }
                        });
                    }
                });
            }
        });
    }
    
    // On the page load, do these things
    // Set up the page;
    initializePage();
});    