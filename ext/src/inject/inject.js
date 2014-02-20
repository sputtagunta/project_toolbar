chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
    	if (document.readyState === "complete") {
    		clearInterval(readyStateCheckInterval);

            // starts the project_toolbar code
            inject_event_handlers();
            inject_dom_elements();
            parse_inbox_table_body();
    	}
	}, 10);
});

function inject_dom_elements() {
    
}


function inject_event_handlers() {
    // if the user clicks the send button
    $('#SendMessage').click( function() {
        metadata = update_metadata();
        generate_pixels(metadata);
    });

    // if the user uses ctrl + enter on the main page
    $(document).keydown(function(event) {
        key_event(event);
    });

    // if the user uses ctrl + enter on the iframe
    
    // create interval for checking if iframe element loaded
    var iframe_interval = setInterval(function() {
        // if the iframe is loaded enter the if statement
        iframeDoc = $('#ComposeRteEditor_surface').contents().get(0); 

        if(iframeDoc != undefined && iframeDoc != null) {
            // clear the interval handler if the iframe is loaded
            clearInterval(iframe_interval);
            iframe_interval = 0;

            var iframeDoc = $('#ComposeRteEditor_surface').contents().get(0);
            $("body", iframeDoc).keydown(function(event) {
                // forward event to key_event function
                key_event(event);
            });
        }
    }, 100); // check every 100 ms
}

function key_event(e) {
    console.log("keycode: " + e.keyCode);
    if (e.ctrlKey && e.keyCode == 13) {
        metadata = update_metadata();
        generate_pixels(metadata);
    }
}

// updates metadata every 100 ms
function update_metadata() {

    metadata = {};
    metadata["from"] = $('.FromContainer').find(".Address").html()
    metadata["to"] = get_emails("#toCP");
    metadata["cc"] = get_emails("#ccCP");
    metadata["action"] = "sent";
    metadata["bcc"] = get_emails("#bccCP");
    metadata["subject"] = $("#fSubject").val();
    metadata["device_timestamp"] = Math.floor((new Date()).getTime() / 1000);
    email_body = $("#ComposeRteEditor_surface").contents().find('body').html();
    metadata["id"] = compute_hash(metadata, email_body);
    //metadata["message_body"] = $("#ComposeRteEditor_surface").contents().find('body').html();
    return metadata;
}

function compute_hash(metadata, email_body) {
    var str = "";
    for (var k in metadata) {
        if (typeof metadata[k] == "number") {
            str += metadata[k].toString();
        } else {
            str += metadata[k];
        }
    }
    str += email_body;

    return SHA1(str);

}



function generate_pixels(metadata) {
    var b = $.param(metadata);
    msg_body = $("#ComposeRteEditor_surface").contents().find('body').html();
    if(msg_body != null && msg_body != undefined) {
        // if the custom blocker exists, truncate the text at the blocker
        // append the data
        image = "<img src='https://sravan.us/images/img.php?"+b+"' width='1' height='1'>";
        $("#ComposeRteEditor_surface").contents().find('body').html(msg_body + image);
    }
}

function get_emails(element) {
    var to = [];
    $(element).find(".cp_ctBtn").each(function() {
        to.push($(this).attr("title"));
    });
    return to;
}

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
        metadata["action"] = "opened";
        metadata["date"] = get_email_data(data, "date");
        metadata["importance"] = get_email_data(data, "importance");
        metadata["email_body"] = data;
        metadata["open_timestamp"] = Math.round(new Date().getTime()/1000.0);
        metadata["recipient"] = get_email_data(data, "x-sid-pra");

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