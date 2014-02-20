<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Max-Age: 1000');

$m = new MongoClient(); // connect
$db = $m->selectDB("project_toolbar");

$toolbar = $_POST;

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


echo json_encode($resp);

?>
