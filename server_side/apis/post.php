<?php
date_default_timezone_set("UTC");

header('content-type: application/json; charset=utf-8');
/*
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
*/

$m = new MongoClient(); // connect
$db = $m->selectDB("project_toolbar");

$payload = array();

$payload["src"] = $_SERVER['HTTP_REFERER'];
$payload["server_timestamp"] = time();

foreach ($_REQUEST["payload"] as $key => $value) {
    $payload[$key] = $value;
}

$db->selectCollection($_REQUEST["doc"])->insert($payload);;

//echo json_encode(array("status" => "OK"));
echo $_REQUEST["callback"] . '(' . json_encode(array("status" => "OK")) . ');';
?>
