#!/bin/bash

mysqldump --skip-comments --compact --skip-add-drop-table --skip-add-locks --skip-lock-tables --skip-disable-keys doonneys | sed '1i SET FOREIGN_KEY_CHECKS=0;SET UNIQUE_CHECKS=0;' | sed '$a SET FOREIGN_KEY_CHECKS=1;SET UNIQUE_CHECKS=1;' > database/doonneys.sql

git add . 
git commit -m "working"
git push