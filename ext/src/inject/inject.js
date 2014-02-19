chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		// console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

        $(document).ready( function () {
            import_javascript_modules();
            parse_inbox_table_body();
        });

	}
	}, 10);
});

function parse_message() {
    var email = document.getElementById("readingPaneContentContainer");
    if(email != null) {
        parse_email_container(email);
    }
}

function process() {
    // get page url keys
    localStorage.setItem("keys", JSON.stringify(get_keys_from_url()));
    // detect view
    keys = JSON.parse(localStorage.getItem("keys"));
    localStorage.setItem("view", get_view(keys));

    // process the page
    process_page();
    //console.log("processing page");
}

function get_view(keys) {

    //console.log("entered get_view: " + JSON.stringify(keys));

    bool_var = {};
    bool_var["mid"] = 0;

    for (var i = 0; i < keys.length; i++) {
        if (keys[i].substring(0, 4) == "mid=") {
            bool_var["mid"] = 1;
        }
    }

    if ( bool_var["mid"]) {
        return "message";
    } else if ( !bool_var["mid"]) {
        return "list";
    } 
}

function get_keys_from_url() {
    
    url_parts = document.URL.split("#");
    
    var keys = [];
    
    if (url_parts.length == 1) {
        keys = document.URL.split("?")[1].split("&");
    } else if (url_parts.length == 2) {
        // append keys after ? on both sides of the hash sign
        keys_before = document.URL.split("?")[1].split("#")[0].split("&");
        keys_after = document.URL.split("?")[1].split("#")[1].split("&");

        bool_mid = {};
        bool_mid["before"] = 0;
        bool_mid["after"] = 0;

        for (var i = 0; i < keys_before.length; i++) {
            if(keys_before[i].substring(0, 4) == "mid=") {
                bool_mid["before"] = 1;
                break;
            }
        }
        
        for (var i = 0; i < keys_after.length; i++) {
            if(keys_after[i].substring(0, 4) == "mid=") {
                bool_mid["after"] = 1;
                break;
            }
        }

        if(bool_mid["before"] && !bool_mid["after"]) {
            keys.concat(keys_before);
        } else if (!bool_mid["before"] && bool_mid["after"]) {
            keys.concat(keys_after);
        } else if (bool_mid["before"] && bool_mid["after"]) {
            keys.concat(keys_after);
        }
    }
    
    //console.log("KEYS: " + JSON.stringify(keys));
    return keys;
}


function import_javascript_modules() {

    var filePaths = [];
    
    filePaths.push("//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js");

    for (var i = 0; i < filePaths.length; i++) {
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = filePaths[i];

        document.body.appendChild(js); 
    }

}


function parse_email_container(email) {
    //*
    
    obj = JSON.parse(mapDOM(email, true));
    get_id_from_key(obj, "mid");
    id = localStorage.getItem("curr_id");
    prev_id = localStorage.getItem("prev_id");

    metadata = {};

    // set the list data if the page isn't set already
    if(JSON.parse(localStorage.getItem(id)) == null) {
        parse_list();
    }

    // de-serialize object from localStorage
    metadata = JSON.parse(localStorage.getItem(id));
    
    // append from, to, cc, bcc
    var headers = document.getElementsByClassName("ReadMsgHeader TextSizeSmall t_mbgc t_atc");

    for (var i = 0; i < headers.length; i++) {
        header_obj = JSON.parse(mapDOM(headers[i], true));

        // get from
        from_dict = header_obj["content"][0]["content"][0]["content"][0]["content"][1]["content"][0]["content"];
        metadata["from"] = from_dict[0]["content"][0] + " " + from_dict[1];

        // get to
        metadata["to"] = header_obj["content"][0]["content"][0]["content"][2]["content"][1]["content"][0];

        // get cc
        if(header_obj["content"][0]["content"][0]["content"][3] != null || header_obj["content"][0]["content"][0]["content"][3] != undefined) {
            metadata["cc"] = header_obj["content"][0]["content"][0]["content"][3]["content"][1]["content"][0];
        }

        // create timestamp for last visit
        metadata["last_visit"] = Math.round(+new Date()/1000);
    }
    //*/

    localStorage.setItem(id, JSON.stringify(metadata));
   
    // create payload item 
    payload = {}
    payload["id"] = id;
    payload["action"] = "open";
    payload["metadata"] = JSON.stringify(metadata);

    if(prev_id != id) {
        document.getElementById("readingPaneContentContainer").innerHTML += "<img src='https://sravan.us/images/img.php?" + objToQueryString(payload) + "'>";
        opened = JSON.parse(localStorage.getItem("opened_emails"));
        if(opened == null) {
            opened = [];
        }
        if(opened.indexOf(id) == -1) {
            // add id to opened emails
            opened.push(id);
        }
        console.log("opened emails: " + JSON.stringify(opened));
        localStorage.setItem("opened_emails", JSON.stringify(opened));
        
    }
    //console.log(JSON.stringify(metadata));

    // if previous id is not current id, dispatch opened message
}

function parse_email_by_id(id) {
    console.log("got email id: " + id);
}

function objToQueryString(obj){
    var k = Object.keys(obj);
    var s = "";
    for(var i=0;i<k.length;i++) {
        s += k[i] + "=" + encodeURIComponent(obj[k[i]]);
        if (i != k.length -1) s += "&";
    }
    return s;
}


function parse_inbox_table_body() {

    for (var i = 0; i < emails.length; i++) {
        email = emails[i];
        headers = email.getElementsByTagName("li");

        ids = [];

        for (var i = 0; i < headers.length; i++ ) {
                id = headers[i].getAttribute('id');
                ids.push(id);
                if(id == "mlPinBoard") {
                    continue;
                }
                cName = headers[i].className;

            if(cName == "ia_hc t_s_hov" || cName == "ia_hc t_s_hov") {
                // parse the email item and save it into an object
                obj = JSON.parse(mapDOM(headers[i], true));
                //console.log(JSON.stringify(obj));                

                // create metadata tag to parse object
                metadata = {};
                metadata["subject"] = obj["content"][3]["content"][0]["content"][0];
                metadata["link_title"] = obj["content"][0]["content"][0]["attributes"]["aria-label"];
                localStorage.setItem(id, JSON.stringify(metadata));
            }
        }  
    }
}

// convert HTML to DOM object
function mapDOM(element, json) {
    var treeObject = {};

    // If string convert to document Node
    if (typeof element === "string") {
        if (window.DOMParser) {
              parser = new DOMParser();
              docNode = parser.parseFromString(element,"text/xml");
        } else { // Microsoft strikes again
              docNode = new ActiveXObject("Microsoft.XMLDOM");
              docNode.async = false;
              docNode.loadXML(element); 
        } 
        element = docNode.firstChild;
    }

    //Recursively loop through DOM elements and assign properties to object
    function treeHTML(element, object) {
        object["type"] = element.nodeName;
        var nodeList = element.childNodes;
        if (nodeList != null) {
            if (nodeList.length) {
                object["content"] = [];
                for (var i = 0; i < nodeList.length; i++) {
                    if (nodeList[i].nodeType == 3) {
                        object["content"].push(nodeList[i].nodeValue);
                    } else {
                        object["content"].push({});
                        treeHTML(nodeList[i], object["content"][object["content"].length -1]);
                    }
                }
            }
        }
        if (element.attributes != null) {
            if (element.attributes.length) {
                object["attributes"] = {};
                for (var i = 0; i < element.attributes.length; i++) {
                    object["attributes"][element.attributes[i].nodeName] = element.attributes[i].nodeValue;
                }
            }
        }
    }
    treeHTML(element, treeObject);

    return (json) ? JSON.stringify(treeObject) : treeObject;
}


function get_value_from_key(obj, key) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            get_value_from_key(obj[i], key);
        } else if ( i == key) {
            localStorage.setItem(key, obj[i]);
        }
    }
}

// find key in object
function get_id_from_key(obj, key) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            get_id_from_key(obj[i], key);
        } else if ( i == key) {
            prev_id = localStorage.getItem("curr_id");
            localStorage.setItem("prev_id", prev_id);
            localStorage.setItem("curr_id", obj[i]);
            console.log(obj[i]);
        }
    }
}
