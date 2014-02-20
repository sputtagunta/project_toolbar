<?php
date_default_timezone_set("UTC");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Max-Age: 1000');

$m = new MongoClient(); // connect
$db = $m->selectDB("project_toolbar");

$payload = array();

$payload["src"] = $_SERVER['HTTP_REFERER'];
$payload["server_timestamp"] = time();

foreach ($_POST["payload"] as $key => $value) {
    $payload[$key] = $value;
}

$db->selectCollection($_POST["doc"])->insert($payload);;

echo json_encode(array("status" => "OK"));

?>
