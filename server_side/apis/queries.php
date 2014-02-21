<?php

header('content-type: application/json; charset=utf-8');
/*
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
*/

$m = new MongoClient(); // connect
$db = $m->selectDB("project_toolbar");

$toolbar = $_REQUEST;

$resp = array();
$resp["sent"] = array();
$resp["opened"] = array();

$sent_emails = $db->selectCollection($toolbar["sent"]["doc"])->find($toolbar["sent"]["payload"]);
foreach ($sent_emails as $email) {
    array_push($resp["sent"], $email);
}

$opened_emails = $db->selectCollection($toolbar["opened"]["doc"])->find($toolbar["opened"]["payload"]);
foreach ($opened_emails as $email) {
    array_push($resp["opened"], $email);
}


//echo json_encode($resp);
echo $_REQUEST["callback"] . '(' . json_encode($resp) . ');';

?>
