const fs = require('fs');
const path = require('path');
const readlineSync = require('readline-sync');

const kspGameDataPath = path.join(__dirname, 'GameData');
const outputFolderPath = path.join(__dirname, 'data');

function listMods() {
    const mods = fs.readdirSync(kspGameDataPath)
                    .filter(item => fs.statSync(path.join(kspGameDataPath, item)).isDirectory());
    return mods;
}

function listParts(mod) {
    const modPath = path.join(kspGameDataPath, mod);
    if (!fs.existsSync(modPath) || !fs.statSync(modPath).isDirectory()) {
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
                    parts.push({ name, filePath: path.relative(kspGameDataPath, itemPath) });
                }
            }
        });
    };
    traverseDirectory(modPath);
    
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

        const partsFilePath = path.join(modFolderPath, 'parts.json');
        let parts = [];

        // Check if parts.json already exists
        if (fs.existsSync(partsFilePath)) {
            const existingPartsJson = fs.readFileSync(partsFilePath, 'utf8');
            parts = JSON.parse(existingPartsJson);
        }

        // Check if preferred name and link are already set
        let preferredName, link;
        const existingModData = parts.find(part => part.preferredName && part.link);
        if (existingModData) {
            preferredName = existingModData.preferredName;
            link = existingModData.link;
        } else {
            // Prompt user for preferred name and link
            console.log(`Please provide preferred name and link for mod '${mod}':`);
            preferredName = readlineSync.question('Preferred Name: ');
            link = readlineSync.question('Link: ');
        }

        // Add or update part information
        const modParts = listParts(mod);
        modParts.forEach(part => {
            const existingPartIndex = parts.findIndex(p => p.name === part.name);
            if (existingPartIndex !== -1) {
                // Merge existing part data with new data
                parts[existingPartIndex] = { ...parts[existingPartIndex], ...part };
            } else {
                parts.push({ ...part, preferredName, link });
            }
        });

        // Save merged part data to parts.json
        const partsJson = JSON.stringify(parts, null, 2);
        fs.writeFileSync(partsFilePath, partsJson);
        console.log(`Parts JSON updated for mod: ${mod}`);
    });
}

const modsList = listMods();
createModFoldersWithParts(modsList);
