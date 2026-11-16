#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! xcodebuild -version >/dev/null 2>&1; then
  echo "Full Xcode 26+ is required. Install Xcode and an iOS Simulator runtime, then run pnpm ios:build again." >&2
  exit 1
fi
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath .build-ios CODE_SIGNING_ALLOWED=NO build
echo "Simulator app: .build-ios/Build/Products/Debug-iphonesimulator/App.app"
