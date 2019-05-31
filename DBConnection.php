<?php
function GetDBConnection(){
  $connection = mysqli_connect("localhost", "teacheng_prod" ,"EKvCfHQ8uuyXl2tf" ,"prod_edu_standards_db");
  if($connection == false){
          die("Error: Could not connect ".mysqli_connect_error());
  }

  return $connection;


}

 ?>
