const parser = require('../Parser/parser');
const wrapper = require('./wrapper');

const fs = require('fs');
const file = fs.readFileSync('example.bjs', {encoding: 'utf-8'});
const res = parser(file)[0];
fs.writeFileSync('debug-output.json', JSON.stringify(res, null, 3));
wrapper(res);