<?php
include_once dirname(__FILE__) . '/database.php';

$db_config = array(
    'host' => '10.1.1.105:3306',
    'user' => 'root',
    'pass' => 'Adfj89cc/*-+',
    'name' => 'mobile',
    'charset' => 'utf8'
);

$db = new Liba_Database($db_config);
$time_limit = strtotime('-3 days');

$id = 0;
echo str_repeat('-', 80) . "\n";
echo date('Y-m-d H:i:s') . "\n";
do {
    $sql = "SELECT id, update_time FROM lr_article WHERE id>{$id} ORDER BY id ASC LIMIT 100";
    $rs  = $db->query($sql, 'all');
    if (!empty($rs)) {
        foreach ($rs as $row) {
            $id = $row['id'];
            $update_time = strtotime($row['update_time']);

            $rank = 0;
            if ($update_time > $time_limit) {
                $rank = 10000;
            }

            $rank += rand(1, 9999);
            $sql = "UPDATE lr_article SET rank='{$rank}' WHERE id='{$id}' LIMIT 1";
            //echo $sql . "\n";
            echo $id . "\t\t" . $rank . "\n";
            
            $db->query($sql);
        }

        //break;
    } else {
        $id = -1;
    }
} while ($id > 0);
echo str_repeat('-', 80) . "\n\n";
