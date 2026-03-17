#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { exec } = require('child_process');

const defaultCommand = 'npm run cypress run -- --component --browser chrome';

const testProcess = exec(defaultCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

testProcess.stdout.on('data', (data) => {
  console.log(data);
});

testProcess.stdout.on('error', (data) => {
  console.error(data);
});
