#!/usr/bin/env bash
set -e

export NEXT_PUBLIC_TITLE="Garching Forschungszentrum - Richtung Klinikum Großhadern"
export NEXT_PUBLIC_DEPARTURES_API="https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09184:460&limit=100&transportTypes=UBAHN,REGIONAL_BUS,BUS,TRAM,SBAHN"
export NEXT_PUBLIC_NEWS_API="https://www.mvg.de/api/bgw-pt/v3/messages"
export NEXT_PUBLIC_DIRECTION_FILTER="010U6:G:H"
export NEXT_PUBLIC_BASEPATH="/~momi/mymvg/gf/kl"

# run the actual Next.js build/export
next build
rm -rf dist/gf-kl
mkdir -p dist/gf-kl
mv -T out dist/gf-kl
