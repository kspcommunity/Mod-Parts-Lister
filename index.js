const fs = require('fs');
const path = require('path');

const kspGameDataPath = path.join(__dirname, 'GameData');
const outputFolderPath = path.join(__dirname, 'output');

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
    
    const parts = [];
    const traverseDirectory = (dir) => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const itemPath = path.join(dir, item);
            if (fs.statSync(itemPath).isDirectory()) {
                traverseDirectory(itemPath); // Recursively traverse subdirectories
            } else if (item.endsWith('.cfg')) {
                const partConfig = fs.readFileSync(itemPath, 'utf8');
                const nameMatch = partConfig.match(/name\s*=\s*(.+)/);
                const name = nameMatch ? nameMatch[1] : null;
                if (name !== null) {
                    parts.push({ name, filePath: itemPath });
                }
            }
        });
    };
    traverseDirectory(partsPath);
    
    return parts;
}

function createModFoldersWithParts(mods) {
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath);
    }

    mods.forEach(mod => {
        const modFolderPath = path.join(outputFolderPath, mod);
        if (!fs.existsSync(modFolderPath)) {
            fs.mkdirSync(modFolderPath);
        }

        const parts = listParts(mod);
        const partsJson = JSON.stringify(parts, null, 2);
        fs.writeFileSync(path.join(modFolderPath, 'parts.json'), partsJson);
        console.log(`Parts JSON created for mod: ${mod}`);
    });
}

const modsList = listMods();
createModFoldersWithParts(modsList);
