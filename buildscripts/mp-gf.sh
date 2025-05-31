#!/usr/bin/env bash
set -e

export NEXT_PUBLIC_TITLE="Marienplatz - Richtung GFZ"
export NEXT_PUBLIC_DEPARTURES_API="https://www.mvg.de/api/bgw-pt/v3/departures?globalId=de:09162:2"
export NEXT_PUBLIC_NEWS_API="https://www.mvg.de/api/bgw-pt/v3/messages"
export NEXT_PUBLIC_DIRECTION_FILTER="010U6:G:R"
export NEXT_PUBLIC_BASEPATH="/~momi/mymvg/mp/gf"

# run the actual Next.js build/export
next build
rm -rf dist/mp-gf
mkdir -p dist/mp-gf
mv -T out dist/mp-gf
