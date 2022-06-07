import * as fs from 'fs-extra';

let data = JSON.parse(fs.readFileSync('./files/presetsData.json', {encoding: 'utf8'}));
data.version += 1;
fs.outputFileSync('./files/presetsData.json',JSON.stringify(data),{encoding: 'utf8', flag: 'w'});
