#!/bin/bash

npm run build-ft-gf

npm run build-ft-kl

npm run build-gf-kl

npm run build-kg-gf

npm run build-kg-kl

npm run build-un-gf

scp -r ~/Documents/ubahn-departures/dist/ momi@lxhalle.in.tum.de:/u/halle/momi/home_at/home_page/html-data/mymvg