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
                // Check for an open game
                // If there is no open game
                console.log(opponent);
                // If no opponent yet
                if (opponent === undefined) {
                    console.log('no opponent');
                    // Show waiting screen
                    displayWaitingForOpponent();
                    database.ref().push({
                        user1: userName
                    }).then(function(snapshot){
                        database.ref('openGame').set({
                            gameKey: snapshot.key
                        });
                        gameKey = snapshot.key;
                    });
                } else {
                    console.log('has opponent, this gamekey', gameKey);
                    database.ref(gameKey).update({
                        user2: userName
                    });
                    database.ref('openGame').remove();
                }
            }
        });

        // If there is an open game
        database.ref('openGame').on('child_added', function(snapshot) {
            gameKey = snapshot.val();
            // When a new game is opened, listen to that new game room
            // when that new game has 
            database.ref(snapshot.val()).on('value', function(snapshot2){
                console.log(snapshot2.val())
                if (snapshot2.val().user1 === userName) {
                    opponent = snapshot2.val().user2;
                    if (opponent !== undefined) {
                        runGame(userName, opponent, gameKey, 0, 0, database, runGame);
                        runChat(userName, opponent, gameKey, database);
                        database.ref('openGame').off('child_added');
                        database.ref(snapshot.val()).off('value');
                    }
                } else {
                    opponent = snapshot2.val().user1;
                    console.log('opponent', opponent);
                    if (snapshot2.val().user2 !== undefined) {
                        runGame(userName, opponent, gameKey, 0, 0, database, runGame);
                        runChat(userName, opponent, gameKey, database);
                        database.ref('openGame').off('child_added');
                        database.ref(snapshot.val()).off('value');
                    }
                }
            });
        });
    }
    
    // On the page load, do these things
    // Set up the page;
    initializePage();
});    