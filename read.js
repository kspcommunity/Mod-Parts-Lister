const fs = require('fs');
const path = require('path');

const craftsFolderPath = path.join(__dirname, 'crafts');
const outputFolderPath = path.join(__dirname, 'data');

function readCraftFile(craftFileName) {
    try {
        const craftFilePath = path.join(craftsFolderPath, craftFileName);
        if (!fs.existsSync(craftFilePath)) {
            throw new Error(`Craft file "${craftFileName}" not found.`);
        }

        const craftContent = fs.readFileSync(craftFilePath, 'utf-8');
        const craftInfo = extractCraftInfo(craftContent);
        const parts = extractPartsFromCraft(craftContent);

        console.log(`Craft Information for "${craftFileName}":`);
        console.log(`Name: ${craftInfo.ship}`);
        console.log(`Version: ${craftInfo.version}`);
        console.log(`Description: ${craftInfo.description}`);
        console.log(`Type: ${craftInfo.type}`);
        console.log(`Size: ${craftInfo.size.join('m x ')}m`);
        console.log(`Vessel Type: ${craftInfo.vesselType}`);
        console.log(`Total Part Count: ${parts.length}`);

        console.log(`Parts in "${craftFileName}":`);
        console.log(parts);

        const processedParts = new Set(); // Keep track of processed parts
        parts.forEach(partName => {
            if (!processedParts.has(partName)) {
                processedParts.add(partName);
                const modName = findModForPart(partName);
                if (modName) {
                    console.log(`Mod for part "${partName}": ${modName}`);
                } else {
                    console.log(`Mod for part "${partName}" not found.`);
                }
            }
        });
    } catch (error) {
        console.error(`Error while processing "${craftFileName}": ${error.message}`);
    }
}

function extractCraftInfo(craftContent) {
    const craftInfo = {
        size: [] // Initialize size as an array
    };
    const lines = craftContent.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        const key = parts[0].trim();
        const value = parts[1] ? parts[1].trim() : '';
        if (key && value) {
            // Check if the key is 'size' and split the value into an array
            if (key === 'size') {
                craftInfo[key] = value.split(',').map(parseFloat);
            } else {
                craftInfo[key] = value;
            }
        }
    });
    return craftInfo;
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
    try {
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
    } catch (error) {
        console.error(`Error while finding mod for part "${partName}": ${error.message}`);
        return null;
    }
}

// Example: Read the craft file "MiG-29 Fulcrum.craft"
readCraftFile('MiG-29 Fulcrum.craft');
