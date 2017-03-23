/* Setting pairs for chat and rps
 * 
 * On page load, collect userName
 * Check for an open game (with on ref(openGame).on 'value' listener) 
 * If no open game
 *      create new game
 *      add game to open games list
 *      display waiting for opponent
 * If there is an open game
 *      add user to the game
 *      remove game from open games list
 *      initialize game and chat
 */

// Initialize Firebase
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

var userName = 'testuser 1';
var openGameInterval;
var stillListening = true;

// App functions

// Display the waiting stuff
function displayWaitingForOpponent() {
    
}

function initializeGame() {
    
}

// On the page load, do these things

// Check for an open game for 100 ms
// If there is no open game
openGameInterval = setTimeout(function() {
    displayWaitingForOpponent();
    console.log(userName);
    database.ref().push({
        user1: userName
    }).then(function(snapshot){
        database.ref('openGame').set({
            gameKey: snapshot.key
        });
        gameKey = snapShot.key;
        console.log('first gk', gameKey);
    });
    stillListening = false;
}, 500);

// If there is an open game
database.ref('openGame').once('child_added', function(snapshot) {
    console.log('hey');
    if (stillListening) {
        clearInterval(openGameInterval);
        gameKey = snapshot.val();
        console.log('second gk', gameKey);
        database.ref(gameKey).update({
            user2: 'user2'
        });
        initializeGame(snapshot.key);
        database.ref('openGame').remove();
    }
});