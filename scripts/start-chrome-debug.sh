#!/bin/bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9333 \
  --user-data-dir=/tmp/chrome-playwright-profile \
  --no-first-run \
  --no-default-browser-check \
  --ignore-certificate-errors \
  --host-rules="MAP consent.trustarc.com 127.0.0.1" \
  "https://stage.foo.redhat.com:1337/dashboard-hub"
