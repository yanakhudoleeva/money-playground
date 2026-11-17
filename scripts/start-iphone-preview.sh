#!/bin/bash
# Opens the existing test device and installed preview; never reinstalls or erases data.
set -euo pipefail
export PATH="/usr/bin:/bin:/usr/sbin:/sbin"
device_id="FA0207E9-7056-4D7B-AE0E-AC2BE174BA9C"
bundle_id="com.moneyplayground.preview"
developer_dir="$(/usr/bin/xcode-select -p)"
xcode_contents="${developer_dir%/Developer}"
if [[ -d "$xcode_contents/Applications/DeviceHub.app" ]]; then
  simulator_app="$xcode_contents/Applications/DeviceHub.app"
else
  simulator_app="$developer_dir/Applications/Simulator.app"
fi
/usr/bin/xcrun simctl bootstatus "$device_id" -b
/usr/bin/xcrun simctl launch "$device_id" "$bundle_id"
/usr/bin/open "$simulator_app"
