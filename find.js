const fs = require('fs');
const path = require('path');

const outputFolderPath = path.join(__dirname, 'output');

function findPart(partName) {
    const mods = fs.readdirSync(outputFolderPath);
    for (const mod of mods) {
        const partsJsonPath = path.join(outputFolderPath, mod, 'parts.json');
        if (fs.existsSync(partsJsonPath)) {
            const partsJson = JSON.parse(fs.readFileSync(partsJsonPath, 'utf8'));
            const foundPart = partsJson.find(part => part.name === partName);
            if (foundPart) {
                console.log(`Part "${partName}" found in mod "${mod}"`);
                return;
            }
        }
    }
    console.log(`Part "${partName}" not found in any mod`);
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter the name of a part: ', (partName) => {
    findPart(partName);
    readline.close();
});
