<?php
date_default_timezone_set("UTC");
header("Content-Type: image/png");
$im = @imagecreate(1, 1)
    or die("Cannot Initialize new GD image stream");
$background_color = imagecolorallocate($im, 0, 0, 0);
imagepng($im);
imagedestroy($im);

$m = new MongoClient(); // connect
$db = $m->selectDB("project_toolbar");

$_REQUEST["src"] = $_SERVER['HTTP_REFERER'];
$_REQUEST["server_timestamp"] = time();

$db->opened->insert($_REQUEST);


?>
