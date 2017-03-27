/* 
 * 
 */

/*eslint-env jquery */
function runChat(myName, opponentName, gameKey, database) {
    
    function initializeChat() {
    	setChatSubmitHandler();
    	setChatDatabaseListener();
    }

    function setChatSubmitHandler() {
    	$('#chatForm').submit(function(event) {
    		event.preventDefault();
    		var message = $('#message').val();
    		if (message !== "") {
    			submitMessage(message);
    			displayMessage(false, message);
    			$('#message').val('');
    		}
    	});
    }

    function displayChatBox() {
    	var conversationBox = $('<div id="conversation">');
    	var conversationList = $('<ul id="conversationList">');
    	var messageField = $('<input id="message" type="text" autocomplete="off" placeholder="trashtalk here">');
    	var sendButton = $('<input id="send" type="submit" value="send">');
    	var chat = $('<form id="chatForm">');
    	conversationBox.append(conversationList);
    	chat.append(messageField, sendButton);
    	$('#chat').html(conversationBox);
    	$('#chat').append(chat);
    	initializeChat();
    }

    function setChatDatabaseListener() {
    	database.ref(gameKey + '/chat/' + opponentName).on('child_added', function(snapshot){
    		displayMessage(true, snapshot.val().message);
    	});
    } 

    function submitMessage(message) {
    	database.ref(gameKey + '/chat/' + myName).push({
    		message: message
    	});
    }

    function displayMessage(isOpponent, message) {
		var messageBar = $('<li>');
		var htmlMessage;
    	if (isOpponent) {
    		htmlMessage = $('<span class="opMessage">');
    		messageBar.attr('class', 'op messageBar');
    	} else {
			htmlMessage = $('<span class="myMessage">');
			messageBar.attr('class', 'my messageBar');
    	}
		htmlMessage.text(message);
    	messageBar.append(htmlMessage);
    	$('#conversationList').append('<br>');
    	$('#conversationList').append(messageBar);
    }

    displayChatBox();
}