#!/bin/sh
set -e
DIST="$HOME/.gradle/wrapper/dists/gradle-8.7-bin"
mkdir -p "$DIST"
ZIP="$DIST/gradle-8.7-bin.zip"
if [ ! -f "$ZIP" ]; then curl -fsSL -o "$ZIP" https://services.gradle.org/distributions/gradle-8.7-bin.zip; fi
DIR=$(find "$DIST" -maxdepth 2 -type f -name gradle -path '*/bin/gradle' -print -quit | sed 's#/bin/gradle##')
if [ -z "$DIR" ]; then mkdir -p "$DIST/unpacked"; unzip -q "$ZIP" -d "$DIST/unpacked"; DIR=$(find "$DIST/unpacked" -maxdepth 2 -type d -name 'gradle-8.7' -print -quit); fi
exec "$DIR/bin/gradle" "$@"
