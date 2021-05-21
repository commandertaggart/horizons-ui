import * as fs from 'fs';
import { O_CREAT, O_WRONLY } from 'node:constants';

function processMessage(stream, message) {
    stream.write();
}

function processFile(filename) {
    try {
        const fileContents = fs.readFileSync(filename);
        const data = JSON.parse(fileContents);

        console.log(`File ${filename} successfully loaded.`);

        const stream = fs.openSync('_' + filename, O_WRONLY | O_CREAT);
        data.forEach(processMessage.bind(undefined, stream));
    }
    catch (ex) {
        console.error(ex);
    }
}

files = process.argv.slice(2);
files.forEach(processFile);