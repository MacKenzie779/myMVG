#!/bin/bash

chmod +x buildall.sh
./buildall.sh

scp -r ~/Documents/ubahn-departures/dist/ momi@lxhalle.in.tum.de:/u/halle/momi/home_at/home_page/html-data/mymvg