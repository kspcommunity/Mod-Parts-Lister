const fs = require('fs');
const path = require('path');
const readlineSync = require('readline-sync');

const kspGameDataPath = path.join(__dirname, 'GameData');
const outputFolderPath = path.join(__dirname, 'data');

function listMods() {
    try {
        const mods = fs.readdirSync(kspGameDataPath)
                        .filter(item => fs.statSync(path.join(kspGameDataPath, item)).isDirectory());
        return mods;
    } catch (error) {
        console.error('Error listing mods:', error.message);
        return [];
    }
}

function listParts(mod) {
    try {
        const modPath = path.join(kspGameDataPath, mod);
        if (!fs.existsSync(modPath) || !fs.statSync(modPath).isDirectory()) {
            console.warn(`Mod '${mod}' folder not found or not a directory.`);
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
    } catch (error) {
        console.error(`Error listing parts for mod '${mod}':`, error.message);
        return [];
    }
}

function getVersionInfo(modPath) {
    try {
        const versionFilePaths = getFilesRecursively(modPath).filter(filePath => path.basename(filePath).endsWith('.version'));
        if (versionFilePaths.length === 0) {
            return null; // No version file found
        }

        const versionFileContents = fs.readFileSync(versionFilePaths[0], 'utf8');
        const versionData = JSON.parse(versionFileContents);

        return {
            preferredName: versionData.NAME || '',
            link: versionData.DOWNLOAD || ''
        };
    } catch (error) {
        console.error(`Error getting version info for mod '${modPath}':`, error.message);
        return null;
    }
}

function getFilesRecursively(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            files = files.concat(getFilesRecursively(filePath));
        } else {
            files.push(filePath);
        }
    });
    return files;
}

function createModFoldersWithParts(mods) {
    try {
        if (!fs.existsSync(outputFolderPath)) {
            fs.mkdirSync(outputFolderPath);
        }

        mods.forEach(mod => {
            const modFolderPath = path.join(outputFolderPath, mod);
            if (!fs.existsSync(modFolderPath)) {
                fs.mkdirSync(modFolderPath);
            }

            const infoFilePath = path.join(modFolderPath, 'info.json');
            let modInfo = {};

            // Check if info.json already exists
            if (fs.existsSync(infoFilePath)) {
                const existingInfoJson = fs.readFileSync(infoFilePath, 'utf8');
                modInfo = JSON.parse(existingInfoJson);
            }

            // Get version info from .version file
            const versionInfo = getVersionInfo(path.join(kspGameDataPath, mod));
            if (versionInfo) {
                modInfo.preferredName = versionInfo.preferredName;
                modInfo.link = versionInfo.link;
                fs.writeFileSync(infoFilePath, JSON.stringify(modInfo, null, 2));
            }

            // Add or update part information
            const modParts = listParts(mod);
            const parts = modParts.map(part => ({ name: part.name, filePath: part.filePath }));

            // Save part data to parts.json
            const partsFilePath = path.join(modFolderPath, 'parts.json');
            const partsJson = JSON.stringify(parts, null, 2);
            fs.writeFileSync(partsFilePath, partsJson);
            console.log(`Parts JSON updated for mod: ${mod}`);
        });
    } catch (error) {
        console.error('Error creating mod folders with parts:', error.message);
    }
}

const modsList = listMods();
createModFoldersWithParts(modsList);
