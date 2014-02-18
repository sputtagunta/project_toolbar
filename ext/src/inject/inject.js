chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		// console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

        
        //*
        var emails = document.getElementsByClassName('InboxTableBody');
        parse_inbox_table_body(emails);


	}
	}, 10);
});

function parse_inbox_table_body(emails) {

    for (var i = 0; i < emails.length; i++) {
        emails[i].addEventListener('click', (function(i) {
            return function() {
                this.innerHTML = 'New Text';
            };
        })(i), false);

        console.log(emails[i].innerHTML);
        
    }
    //*/

}
