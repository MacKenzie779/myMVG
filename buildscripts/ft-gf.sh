#!/usr/bin/env bash
set -e

export NEXT_PUBLIC_TITLE="Fröttmaning - Richtung GFZ"
export NEXT_PUBLIC_DEPARTURES_API="https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09162:470&limit=100&transportTypes=UBAHN,REGIONAL_BUS,BUS,TRAM,SBAHN"
export NEXT_PUBLIC_NEWS_API="https://www.mvg.de/api/bgw-pt/v3/messages"
export NEXT_PUBLIC_DIRECTION_FILTER="010U6:G:R"
export NEXT_PUBLIC_BASEPATH="/~momi/mymvg/ft/gf"

# run the actual Next.js build/export
next build
rm -rf dist/ft-gf
mkdir -p dist/ft-gf
mv -T out dist/ft-gf
