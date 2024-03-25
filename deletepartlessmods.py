import os
import json
import logging

def setup_logger():
    logger = logging.getLogger("deletepartsless")
    logger.setLevel(logging.DEBUG)

    # Create console handler and set level to INFO
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)

    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    # Add formatter to ch
    ch.setFormatter(formatter)

    # Add ch to logger
    logger.addHandler(ch)

    return logger

def is_empty_parts_json(file_path):
    try:
        with open(file_path, 'r') as f:
            parts_data = json.load(f)
            return len(parts_data) == 0
    except Exception as e:
        logger.error(f"Error reading JSON file {file_path}: {e}")
        return False

def delete_folders_without_parts(directory, logger):
    for root, dirs, files in os.walk(directory):
        if "parts.json" in files and root != directory:
            parts_json_path = os.path.join(root, "parts.json")
            if is_empty_parts_json(parts_json_path):
                logger.info(f"Deleting folder: {root}")
                try:
                    # Delete the folder and all its contents
                    for file in files:
                        os.remove(os.path.join(root, file))
                    os.rmdir(root)
                    logger.info(f"Folder deleted: {root}")
                except Exception as e:
                    logger.error(f"Error deleting folder {root}: {e}")
            else:
                logger.debug(f"Skipping non-empty parts.json in folder: {root}")

if __name__ == "__main__":
    logger = setup_logger()
    data_folder = "data"
    if not os.path.exists(data_folder):
        logger.error(f"Error: Folder '{data_folder}' does not exist.")
    else:
        delete_folders_without_parts(data_folder, logger)
