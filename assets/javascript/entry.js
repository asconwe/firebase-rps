/*globals firebase */
/*eslint-env browser, jquery*/


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
    $('#display').html('<h3>... waiting for your opponent ...<h3>');
}

// Returns the opponent's user name
function getOppoName(user1, user2) {
    if (user1 === userName) {
        return user2;
    }
    return user1;
}

// Once match is set, initialize the chat
function initializeChat() {
    
}


// Initialize page
function initializePage() {
    
    console.log('happening');
    var form = $('<form id="userName">');
    var field = $('<input id="nameField" type="text">');
    var button = $('<input id="submitName" type="submit">');
    var display = $('#display');
    form.append(field);
    form.append(button);
    display.html(form);

    // After you submit your username, do these things
    $('#userName').submit(function(e) {
        
        console.log('submitted');
        e.preventDefault();
        
        // set the userName
        userName = $('#nameField').val();
        // Show waiting screen
        displayWaitingForOpponent();
        // Check for an open game for 500 ms
        // If there is no open game
        openGameInterval = setTimeout(function() {
            database.ref().push({
                user1: userName
            }).then(function(snapshot){
                database.ref('openGame').set({
                    gameKey: snapshot.key
                });
                gameKey = snapshot.key;
                console.log('a:', gameKey);
                database.ref(gameKey).on('child_added', function(snapshot) {
                    if (snapshot.val() !== userName && stillListening2) {
                        opponent = snapshot.val();
                        console.log('opponent value being passed to the function', opponent);
                        runGame(userName, opponent, gameKey);
                        stillListening2 = false;
                    }
                });
            });
            stillListening = false;
        }, 500);
        
        // If there is an open game
        database.ref('openGame').once('child_added', function(snapshot) {
            console.log('should only happen once');
            // If the open game interval hasn't timed out (so, if there is an available game, only before the game is set up)
            if (stillListening) {
                // Prevent no open game option from running
                clearInterval(openGameInterval);
                // Get the unique identifier for this game
                gameKey = snapshot.val();
                console.log('b:', gameKey);
                // Add the second user;
                database.ref(gameKey).update({
                    user2: userName
                }).then(function(){
                    // Get the opponent's user name
                    database.ref(gameKey).once('value', function(snapshot2) {
                        var user1 = snapshot2.val().user1;
                        var user2 = snapshot2.val().user2;
                        opponent = getOppoName(user1, user2);
                        console.log('op:', opponent);
                    });
                   });
                   console.log('gameKey:', gameKey);
                runGame(userName, opponent, gameKey);
                initializeChat(userName, opponent, snapshot.val());
                database.ref('openGame').remove();
            }
        
        });
    });
}

// On the page load, do these things
// Set up the page;
initializePage();