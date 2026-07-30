const fs = require('fs');

const path = 'package.json';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/"publisherName": "Susankar Karmakar"/, '"publisherName": "Susankar Karmakar", "verifyUpdateCodeSignature": false');

fs.writeFileSync(path, code);
