<?php 
$message = "this is a text file";
$file = fopen("nadeem.text","a"); 
    echo fwrite($file, "\n" . date('Y-m-d h:i:s') . " :: " . $message); 
    fclose($file);

?>