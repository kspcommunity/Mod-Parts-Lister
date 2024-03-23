const fs = require('fs');
const path = require('path');

const dataFolderPath = './data';
const finalData = [];

// Function to read parts.json file
const readPartsJson = (folderPath) => {
    const partsJsonPath = path.join(folderPath, 'parts.json');
    try {
        const partsData = fs.readFileSync(partsJsonPath, 'utf8');
        return JSON.parse(partsData);
    } catch (error) {
        console.error(`Error reading parts.json in ${folderPath}: ${error}`);
        return [];
    }
};

// Function to read info.json file
const readInfoJson = (folderPath) => {
    const infoJsonPath = path.join(folderPath, 'info.json');
    try {
        const infoData = fs.readFileSync(infoJsonPath, 'utf8');
        return JSON.parse(infoData);
    } catch (error) {
        console.error(`Error reading info.json in ${folderPath}: ${error}`);
        return {};
    }
};

// Main function to process each mod
const processMod = (modName) => {
    const modPath = path.join(dataFolderPath, modName);
    const partsData = readPartsJson(modPath);
    const infoData = readInfoJson(modPath);
    
    const modEntry = {
        modName,
        preferredName: infoData.preferredName || '',
        link: infoData.link || '',
        parts: partsData.map(part => ({
            name: part.name,
            filePath: part.filePath
        }))
    };

    finalData.push(modEntry);
};

// Main function to iterate through subfolders (mods)
const main = () => {
    try {
        const mods = fs.readdirSync(dataFolderPath);
        mods.forEach(processMod);
        fs.writeFileSync('final_data.json', JSON.stringify(finalData, null, 2));
        console.log('Final data compiled successfully.');
    } catch (error) {
        console.error('Error processing mods:', error);
    }
};

// Run the main function
main();
