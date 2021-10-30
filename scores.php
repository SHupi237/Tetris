<!DOCTYPE html>
<html lang="pl-PL">
<head>
    <meta charset="UTF-8">
    <title>Scores</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
</head>
<body id="body">
    <h1>Scores</h1>
    <div style="border:2px solid black">
    <?php
         $servername = "localhost";
         $username = "root";
         $password = "";
         $dbname = "tetris";
         $conn = new mysqli($servername, $username, $password, $dbname);
         $getTopTenSocres=$conn->query("SELECT * FROM `scores` ORDER BY scores DESC LIMIT 10;");
         $data=mysqli_fetch_all( $getTopTenSocres);
         echo '<div id="divOfScores">';
         for($i=0;$i<count($data);$i++){
            $number=$i+1;
            echo '<pre>';
            print_r('<b class="scores">' . $number.'.'.$data[$i][2].':'.$data[$i][1] . '</b>');
            echo '</pre>';
        }
         echo '</div>';
         die;
    ?> 
    </div>
    
</body>
</html>