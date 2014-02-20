chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // starts the project_toolbar code
            $jQ = jQuery.noConflict();
            inject_event_handlers();
            inject_dom_elements();
            //parse_inbox_table_body();
        }
    }, 10);
});



function inject_dom_elements() {
    $jQ('#sortFilterContainer').append("<div id='project_toolbar_pane'></div>");
    $jQ('#sortFilterContainer').append("<div id='sent_emails_pane_toolbar' class='toolbar_email_view'></div>");
    $jQ('#sortFilterContainer').append("<div id='opened_emails_pane_toolbar' class='toolbar_email_view'></div>");
    $jQ('#sortFilterContainer').append("<div id='unopened_emails_pane_toolbar' class='toolbar_email_view'></div>");

    toolbar_menu = {};
    toolbar_menu["sent"] = {'doc' : 'sent', 'payload' : { 'from':document.title.split(" - ")[1]} };
    toolbar_menu["opened"] = {'doc' : 'opened', 'payload' : { 'from':document.title.split(" - ")[1]}};

    $jQ.post( "https://sravan.us/apis/queries", 
          toolbar_menu)
    .done(function( data ) {
        process_data(data);
    });
}

function process_data(data) {
    data = JSON.parse(data);
    sent_emails = data["sent"];
    opened_emails = data["opened"];


    ids = [];
    
    opened_emails_count = 0;
    for (var i = 0; i < opened_emails.length; i++ ) {
        diff = Math.abs(opened_emails[i]["server_timestamp"] - opened_emails[i]["device_timestamp"]);
        if(diff > 5 && ids.indexOf(opened_emails[i]["id"]) == -1 ) {
            opened_emails_count++;
            ids.push(opened_emails[i]["id"]);
        }
    }

    $jQ('#sent_emails_pane_toolbar').html(populate_div(sent_emails, 'sent'));
    $jQ('#opened_emails_pane_toolbar').html(populate_div(opened_emails, 'opened'));
    $jQ('#unopened_emails_pane_toolbar').html(populate_unopened_div(sent_emails, 'unopened', ids));

    $jQ('#project_toolbar_pane').append("<div id='sent_emails_project_toolbar' class='project_toolbar_menu_item'>Sent Emails: "+ sent_emails.length +"</div>");
    $jQ('#project_toolbar_pane').append("<div id='opened_emails_project_toolbar' class='project_toolbar_menu_item'>Opened Emails: "+ opened_emails_count +"</div>");
    $jQ('#project_toolbar_pane').append("<div id='unopened_emails_project_toolbar' class='project_toolbar_menu_item'>Unopened Emails: "+ (sent_emails.length - opened_emails_count).toString() +"</div>");

    $jQ("#opened_emails_project_toolbar").click( function() {
        $jQ("#opened_emails_pane_toolbar").toggle();
        $jQ("#sent_emails_pane_toolbar").hide();
        $jQ("#unopened_emails_pane_toolbar").hide();
    });

    $jQ("#sent_emails_project_toolbar").click( function() {
        $jQ("#sent_emails_pane_toolbar").toggle();
        $jQ("#opened_emails_pane_toolbar").hide();
        $jQ("#unopened_emails_pane_toolbar").hide();
    });

    $jQ("#unopened_emails_project_toolbar").click( function() {
        $jQ("#unopened_emails_pane_toolbar").toggle();
        $jQ("#sent_emails_pane_toolbar").hide();
        $jQ("#opened_emails_pane_toolbar").hide();
    });

    $jQ("#hide_div_sent").click(function() {
        $jQ("#sent_emails_pane_toolbar").toggle();
    });

    $jQ("#hide_div_opened").click(function() {
        $jQ("#opened_emails_pane_toolbar").toggle();
    });

    $jQ("#hide_div_unopened").click(function() {
        $jQ("#unopened_emails_pane_toolbar").toggle();
    });
}

function populate_unopened_div(emails, email_type, ids) {
    var template = "";
    template += "<div id='email_item'>\n";
    template += "<table>\n";
    template += "<tr><td>Date</td><td>{date_here}</td></tr>\n";
    template += "<tr><td>From</td><td>{from_addr_here}</td></tr>\n";
    template += "<tr><td>To</td><td>{to_addr_here}</td></tr>\n";
    template += "<tr><td>Cc</td><td>{cc_addr_here}</td></tr>\n";
    template += "<tr><td>Bcc</td><td>{bcc_addr_here}</td></tr>\n";
    template += "<tr><td>Subject</td><td>{subject_here}</td></tr>\n";
    template += "</div>";

    html = "";
    html += "<h1>"+email_type+" emails</h1>";
    html += "<br><hr /><a id='hide_div_"+email_type+"'>Hide Toolbar</a>";

    for (var i = 0; i < emails.length; i++) {
        if(ids.indexOf(emails[i]["id"]) != -1 ) {
            continue;
        }

        html += merge_template(template, emails[i]);
        ids.push(emails[i]["id"]);
    }
    //console.log(html);
    return html;
}


function populate_div(emails, email_type) {
    var template = "";
    template += "<div id='email_item'>\n";
    template += "<table>\n";
    template += "<tr><td>Date</td><td>{date_here}</td></tr>\n";
    template += "<tr><td>From</td><td>{from_addr_here}</td></tr>\n";
    template += "<tr><td>To</td><td>{to_addr_here}</td></tr>\n";
    template += "<tr><td>Cc</td><td>{cc_addr_here}</td></tr>\n";
    template += "<tr><td>Bcc</td><td>{bcc_addr_here}</td></tr>\n";
    template += "<tr><td>Subject</td><td>{subject_here}</td></tr>\n";
    template += "</div>";

    html = "";
    html += "<h1>"+email_type+" emails</h1>";
    html += "<br><hr /><a id='hide_div_"+email_type+"'>Hide Toolbar</a>";

    ids = [];    

    for (var i = 0; i < emails.length; i++) {
        diff = Math.abs(emails[i]["server_timestamp"] - emails[i]["device_timestamp"]);
        if((email_type == "opened" && diff < 5) || ids.indexOf(emails[i]["id"]) != -1 ) {
            continue;
        }

        html += merge_template(template, emails[i]);
        ids.push(emails[i]["id"]);
    }

    return html;
}

function merge_template(template, email) {
    template = template.replace("{from_addr_here}", email["from"]);
    template = template.replace("{to_addr_here}", email["to"]);
    template = template.replace("{cc_addr_here}", email["cc"]);
    template = template.replace("{bcc_addr_here}", email["bcc"]);
    template = template.replace("{subject_here}", email["subject"]);
    var d = new Date();
    template = template.replace("{date_here}", Date(email["date"]*1000 + d.getTimezoneOffset() * 60000));

    lines = template.split("\n");
    final_temp = [];
    for(var i = 0; i < lines.length; i++) {
        if(lines[i].search("undefined") == -1) {
            //console.log("no undefined: " + lines[i]);
            final_temp.push(lines[i]);
        }
    }

    return final_temp.join("\n");
}

function inject_event_handlers() {
    // if the user clicks the send button
    $jQ('#SendMessage').click( function() {
        metadata = update_metadata();
        generate_pixels(metadata);
    });

    // if the user uses ctrl + enter on the main page
    $jQ(document).keydown(function(event) {
        key_event(event);
    });

    // if the user uses ctrl + enter on the iframe
    
    // create interval for checking if iframe element loaded
    var iframe_interval = setInterval(function() {
        // if the iframe is loaded enter the if statement
        iframeDoc = $jQ('#ComposeRteEditor_surface').contents().get(0); 

        if(iframeDoc != undefined && iframeDoc != null) {
            // clear the interval handler if the iframe is loaded
            clearInterval(iframe_interval);
            iframe_interval = 0;

            var iframeDoc = $jQ('#ComposeRteEditor_surface').contents().get(0);
            $jQ("body", iframeDoc).keydown(function(event) {
                // forward event to key_event function
                key_event(event);
            });
        }
    }, 100); // check every 100 ms
}

function key_event(e) {
    //console.log("keycode: " + e.keyCode);
    if (e.ctrlKey && e.keyCode == 13) {
        metadata = update_metadata();
        generate_pixels(metadata);
    }
}

// updates metadata every 100 ms
function update_metadata() {

    metadata = {};
    metadata["from"] = $jQ('.FromContainer').find(".Address").html()
    metadata["to"] = get_emails("#toCP");
    metadata["cc"] = get_emails("#ccCP");
    metadata["bcc"] = get_emails("#bccCP");
    metadata["subject"] = $jQ("#fSubject").val();
    metadata["device_timestamp"] = Math.floor((new Date()).getTime() / 1000);
    email_body = $jQ("#ComposeRteEditor_surface").contents().find('body').html();
    metadata["id"] = compute_hash(metadata, email_body);

    payload = {};
    payload["doc"] = "sent";
    payload["payload"] = metadata;

    $jQ.post( "https://sravan.us/apis/post", 
          payload)
    .done(function( data ) {
        console.log( "Data inserted: " + data );
    });

    //metadata["message_body"] = $jQ("#ComposeRteEditor_surface").contents().find('body').html();
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
    var b = $jQ.param(metadata);
    msg_body = $jQ("#ComposeRteEditor_surface").contents().find('body').html();
    if(msg_body != null && msg_body != undefined) {
        // if the custom blocker exists, truncate the text at the blocker
        // append the data
        image = "<img src='https://sravan.us/images/img.php?"+b+"' width='1' height='1'>";
        $jQ("#ComposeRteEditor_surface").contents().find('body').html(msg_body + image);
    }
}

function get_emails(element) {
    var to = [];
    $jQ(element).find(".cp_ctBtn").each(function() {
        to.push($jQ(this).attr("title"));
    });
    return to;
}

function parse_inbox_table_body() {
    $jQ(".InboxTableBody" ).find( "li" ).click( function() {
        parse_email_by_id($jQ(this).attr("id"));
    });
    
}

function parse_email_by_id(id) {
    url = "https://"+window.location.host+"/mail/GetMessageSource.aspx?msgid="+id;
   
    $jQ.post( url, function( data ) {
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
        metadata["recipient"] = get_email_data(data, "x-sid-pra");

        img_url = "https://sravan.us/images/img.php?"+$jQ.param(metadata);
        $jQ('#mpf0_MsgContainer').html($jQ('#mpf0_MsgContainer').html()+"<img src='"+img_url+"'>");
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