#!/bin/bash

# this file should be placed on the server to publish the static build with the correct access rights for the tum lxhalle webserver
#cd home_page/html-data/

echo "Publishing myMVG"
echo "============================"

echo "rename build directory"
rm -rf myu6
mkdir -p myu6
mv -T out myu6
echo "set correct access rights"
chmod -R 705 myu6
echo "published successfully!"
echo "============================"