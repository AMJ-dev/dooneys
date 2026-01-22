<?php
    require_once __DIR__.'/verify-user.php'; 
    if($my_details->role == 'customer') invalid_token();   