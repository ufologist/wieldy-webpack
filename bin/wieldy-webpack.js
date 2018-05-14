#!/usr/bin/env node

/**
 * 统一封装 npm scripts 要执行的命令
 * 这样其他项目要使用时, 只需要记住一个命令就可以了
 * 
 * 例如原来我们需要在每个项目中都定义如下命令
 * 
 * "scripts": {
 *   "start": "webpack-dev-server --inline --open --progress --colors --profile --env.__mode__=dev",
 *   "build": "webpack --progress --hide-modules",
 *   "deploy": "webpack --progress --hide-modules --env.__deploy__",
 *   "analysis": "webpack --progress --profile --json > stats.json"
 * }
 * 
 * 因为各个项目都是复制粘贴的命令, 没有统一共用,
 * 可想而知, 如果某个命令需要更改, 那就麻烦了, 各个项目都要重新修改一遍
 * 
 * 现在我们统一封装了命令, 就可以统一来管理了.
 * 
 * "scripts": {
 *   "start": "wieldy-webpack start",
 *   "build": "wieldy-webpack build",
 *   "deploy": "wieldy-webpack deploy",
 *   "analysis": "wieldy-webpack analysis"
 * }
 * 
 * 也可以只配置一个命令, 传值进去即可, 例如: npm run ww start
 * "scripts": {
 *   "ww": "wieldy-webpack"
 * }
 */

var execSync = require('child_process').execSync;

var npmScript = {
    'start': "webpack-dev-server --inline --open --progress --colors --profile --env.__mode__=dev",
    'build': "webpack --progress --hide-modules",
    'deploy': "webpack --progress --hide-modules --env.__deploy__",
    'analysis': "webpack --progress --profile --json > stats.json",
};
var command = npmScript['start'];

// node wieldy-webpack start --env.__port__=8000
var commandType = process.argv[2];
if (npmScript[commandType]) {
    command = npmScript[commandType] + ' ' + process.argv.slice(3).join(' ');
}

console.log('> ' + command + '\n');

execSync(command, {
    stdio: [process.stdin, process.stdout, process.stderr]
});