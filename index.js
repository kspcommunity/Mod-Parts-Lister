const fs = require('fs');
const path = require('path');

const kspGameDataPath = './gamedata';

function listMods() {
    const mods = [];
    
    // Read the contents of the GameData folder
    const files = fs.readdirSync(kspGameDataPath);
    
    // Filter out directories that are not mods
    files.forEach(file => {
        const filePath = path.join(kspGameDataPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            mods.push(file);
        }
    });
    
    return mods;
}

function saveToJson(mods) {
    const jsonContent = JSON.stringify(mods, null, 2);
    const outputFile = 'mods.json'; 
    
    fs.writeFileSync(outputFile, jsonContent);
    
    console.log(`List of mods saved to ${outputFile}`);
}

const modsList = listMods();
saveToJson(modsList);
