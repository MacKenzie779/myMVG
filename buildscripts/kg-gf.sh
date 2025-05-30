#!/usr/bin/env bash
set -e

export NEXT_PUBLIC_TITLE="Kieferngarten - Richtung GFZ"
export NEXT_PUBLIC_DEPARTURES_API="https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09162:430&limit=100&transportTypes=UBAHN,REGIONAL_BUS,BUS,TRAM,SBAHN"
export NEXT_PUBLIC_NEWS_API="https://www.mvg.de/api/bgw-pt/v3/messages"
export NEXT_PUBLIC_DIRECTION_FILTER="010U6:G:R"
export NEXT_PUBLIC_BASEPATH="/~momi/mymvg/kg/gf"

# run the actual Next.js build/export
next build
rm -rf dist/kg-gf
mkdir -p dist/kg-gf
mv -T out dist/kg-gf
