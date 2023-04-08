#!/usr/bin/env node

const {execSync} = require('child_process')

const runCommand = command => {
  try {
    execSync(`${command}`, {stdio: 'inherit'});
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
  return true;
}

const repoName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 https://github.com/Roshan-Horo/create-backend-ts-starter ${repoName}`
const installDepsCommand = `cd ${repoName} && npm install`;

console.log(`Cloning the repository with name ${repoName}`);
const checkedOut = runCommand(gitCheckoutCommand);
if(!checkedOut) process.exit(-1);

console.log(`Installing dependencies for ${repoName}`);
const installedDeps = runCommand(installDepsCommand);
if(!installedDeps) process.exit(-1);

console.log("Congratulations! You are ready to go, Follow the following command to start");
console.log(`For dev : cd ${repoName} && nodemon`);
console.log(`For Prod : cd ${repoName} && npm run build && npm start`);