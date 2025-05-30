#!/bin/bash

# this file should be placed on the server to publish the static build with the correct access rights for the tum lxhalle webserver
#cd home_page/html-data/

echo "Publishing myMVG"
echo "============================"

echo "[1/7] ft-gf"
echo "============================"
echo "rename build directory"
rm -rf ft/gf
mkdir -p ft/gf
mv -T dist/ft-gf ft/gf
echo "set correct access rights"
chmod -R 705 ft
chmod -R 705 ft/gf
echo "published successfully!"
echo "============================"

echo "[2/7] ft-kl"
echo "============================"
echo "rename build directory"
rm -rf ft/kl
mkdir -p ft/kl
mv -T dist/ft-kl ft/kl
echo "set correct access rights"
chmod -R 705 ft
chmod -R 705 ft/kl
echo "published successfully!"
echo "============================"

echo "[3/7] gf-kl"
echo "============================"
echo "rename build directory"
rm -rf gf/kl
mkdir -p gf/kl
mv -T dist/gf-kl gf/kl
echo "set correct access rights"
chmod -R 705 gf
chmod -R 705 gf/kl
echo "published successfully!"
echo "============================"

echo "[4/7] kg-gf"
echo "============================"
echo "rename build directory"
rm -rf kg/gf
mkdir -p kg/gf
mv -T dist/kg-gf kg/gf
echo "set correct access rights"
chmod -R 705 kg
chmod -R 705 kg/gf
echo "published successfully!"
echo "============================"

echo "[5/7] kg-kl"
echo "============================"
echo "rename build directory"
rm -rf kg/kl
mkdir -p kg/kl
mv -T dist/kg-kl kg/kl
echo "set correct access rights"
chmod -R 705 kg
chmod -R 705 kg/kl
echo "published successfully!"
echo "============================"

echo "[6/7] mp-gf"
echo "============================"
echo "rename build directory"
rm -rf mp/gf
mkdir -p mp/gf
mv -T dist/mp-gf mp/gf
echo "set correct access rights"
chmod -R 705 mp
chmod -R 705 mp/gf
echo "published successfully!"
echo "============================"

echo "[7/7] un-gf"
echo "============================"
echo "rename build directory"
rm -rf un/gf
mkdir -p un/gf
mv -T dist/un-gf un/gf
echo "set correct access rights"
chmod -R 705 un
chmod -R 705 un/gf
echo "published successfully!"
echo "============================"

echo "Success!"