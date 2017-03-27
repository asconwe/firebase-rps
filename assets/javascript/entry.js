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
                    database.ref(gameKey).on('child_added', function(snapshot) {
                        if (snapshot.val() !== userName && snapshot.key !== 'newGame' &&stillListening2) {
                            opponent = snapshot.val();
                            runGame(userName, opponent, gameKey, 0, 0, database);
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
                    // Add the second user;
                    database.ref(gameKey).update({
                        user2: userName,
                        newGame: 'no'
                    }).then(function(){
                        // Get the opponent's user name
                        database.ref(gameKey).once('value', function(snapshot2) {
                            var user1 = snapshot2.val().user1;
                            var user2 = snapshot2.val().user2;
                            opponent = getOppoName(user1, user2);
                            console.log(opponent);
                            runGame(userName, opponent, gameKey, 0, 0, database);
                            runChat(userName, opponent, snapshot.val(), database);
                            database.ref('openGame').remove();
                        });
                    });
                }
            
            });
        });
    }
    
    // On the page load, do these things
    // Set up the page;
    initializePage();
    
    $('body').click(function(){
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
        $('body').animate({backgroundColor: randomColor} , 200, function(){
        });
    });
});    