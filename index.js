const fs = require('fs');
const path = require('path');

const kspGameDataPath = path.join(__dirname, 'GameData');

function listMods() {
    const mods = fs.readdirSync(kspGameDataPath)
                    .filter(item => fs.statSync(path.join(kspGameDataPath, item)).isDirectory());
    return mods;
}

function listParts(mod) {
    const partsPath = path.join(kspGameDataPath, mod, 'Parts');
    if (!fs.existsSync(partsPath)) {
        return [];
    }
    
    const parts = fs.readdirSync(partsPath)
                    .filter(item => fs.statSync(path.join(partsPath, item)).isDirectory());
    return parts;
}

function saveToJson(mods) {
    const modsWithParts = mods.map(mod => {
        return {
            modName: mod,
            parts: listParts(mod)
        };
    });

    const jsonContent = JSON.stringify(modsWithParts, null, 2);
    const outputFile = 'mods.json';
    
    fs.writeFileSync(outputFile, jsonContent);
    
    console.log(`List of mods with parts saved to ${outputFile}`);
}

const modsList = listMods();
saveToJson(modsList);
