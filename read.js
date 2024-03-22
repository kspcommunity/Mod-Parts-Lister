const fs = require('fs');
const path = require('path');

const craftsFolderPath = path.join(__dirname, 'crafts');
const outputFolderPath = path.join(__dirname, 'output');

function readCraftFile(craftFileName) {
    const craftFilePath = path.join(craftsFolderPath, craftFileName);
    if (!fs.existsSync(craftFilePath)) {
        console.log(`Craft file "${craftFileName}" not found.`);
        return;
    }

    const craftContent = fs.readFileSync(craftFilePath, 'utf-8');
    const parts = extractPartsFromCraft(craftContent);

    console.log(`Parts in "${craftFileName}":`);
    console.log(parts);

    parts.forEach(partName => {
        const modName = findModForPart(partName);
        if (modName) {
            console.log(`Mod for part "${partName}": ${modName}`);
        } else {
            console.log(`Mod for part "${partName}" not found.`);
        }
    });
}

function extractPartsFromCraft(craftContent) {
    const parts = [];
    const partRegex = /PART\s*{([^}]*)}/g;
    let match;
    while ((match = partRegex.exec(craftContent)) !== null) {
        const partContent = match[1];
        const partNameMatch = partContent.match(/part\s*=\s*([^\s]+)/);
        if (partNameMatch) {
            const partFullName = partNameMatch[1];
            const partName = extractPartName(partFullName);
            parts.push(partName);
        }
    }
    return parts;
}

function extractPartName(partFullName) {
    // Extract the part name by removing the unique identifier
    return partFullName.replace(/_\d+$/, '');
}

function findModForPart(partName) {
    const mods = fs.readdirSync(outputFolderPath);
    for (const mod of mods) {
        const partsJsonPath = path.join(outputFolderPath, mod, 'parts.json');
        if (fs.existsSync(partsJsonPath)) {
            const partsJson = JSON.parse(fs.readFileSync(partsJsonPath, 'utf8'));
            const foundPart = partsJson.find(part => part.name === partName);
            if (foundPart) {
                return mod;
            }
        }
    }
    return null; // Mod not found for the part
}

// Example: Read the craft file "example.craft"
readCraftFile('example.craft');