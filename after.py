import os
import json
import multiprocessing
import tkinter as tk
from tkinter import messagebox, scrolledtext
import logging

# Setup logging
logging.basicConfig(filename='error.log', level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

def check_subfolder(subfolder):
    try:
        parts_json_exists = os.path.exists(os.path.join(subfolder, 'parts.json'))
        info_json_exists = os.path.exists(os.path.join(subfolder, 'info.json'))
        if not parts_json_exists or not info_json_exists:
            return subfolder
    except Exception as e:
        logging.error(f"Error while checking subfolder {subfolder}: {e}")
        return None

def check_subfolders(directory):
    try:
        subfolders = [os.path.join(directory, d) for d in os.listdir(directory) if os.path.isdir(os.path.join(directory, d))]
        with multiprocessing.Pool(processes=multiprocessing.cpu_count()) as pool:
            missing_json_subfolders = pool.map(check_subfolder, subfolders)
        
        missing_json_subfolders = [folder for folder in missing_json_subfolders if folder is not None]
        total_missing = len(missing_json_subfolders)
        return missing_json_subfolders, total_missing
    except Exception as e:
        logging.error(f"Error while checking subfolders in {directory}: {e}")
        return [], 0

def get_subfolder_info(subfolder):
    try:
        parts_json_path = os.path.join(subfolder, 'parts.json')
        subfolder_name = os.path.basename(subfolder)
        parts_info = "Parts JSON contents:\n"

        if os.path.exists(parts_json_path):
            with open(parts_json_path, 'r') as f:
                parts_data = json.load(f)
                parts_info += json.dumps(parts_data, indent=2)
        else:
            parts_info += "parts.json not found."

        return subfolder_name, parts_info
    except Exception as e:
        logging.error(f"Error while getting info for subfolder {subfolder}: {e}")
        return None, None

def get_user_info(data_folder, subfolder_info):
    try:
        user_info = {}
        root = tk.Tk()
        root.title("Enter Information")

        subfolder_name, parts_info = subfolder_info

        subfolder_label = tk.Label(root, text=f"Subfolder Name: {subfolder_name}")
        subfolder_label.grid(row=0, column=0, columnspan=2)

        parts_info_label = tk.Label(root, text="Parts JSON contents:")
        parts_info_label.grid(row=1, column=0, columnspan=2)

        parts_info_text = scrolledtext.ScrolledText(root, width=50, height=10)
        parts_info_text.grid(row=2, column=0, columnspan=2)
        parts_info_text.insert(tk.END, parts_info)
        parts_info_text.configure(state='disabled')

        preferred_name_label = tk.Label(root, text="Preferred Name:")
        preferred_name_label.grid(row=3, column=0)
        preferred_name_entry = tk.Entry(root)
        preferred_name_entry.grid(row=3, column=1)

        link_label = tk.Label(root, text="Link:")
        link_label.grid(row=4, column=0)
        link_entry = tk.Entry(root)
        link_entry.grid(row=4, column=1)

        def submit():
            user_info['preferredName'] = preferred_name_entry.get()
            user_info['link'] = link_entry.get()

            # Create info.json for the folder if it doesn't exist
            info_file = os.path.join(data_folder, subfolder_name, 'info.json')
            if not os.path.exists(info_file):
                with open(info_file, 'w') as f:
                    json.dump({}, f)

            # Save user info to info.json
            with open(info_file, 'r+') as f:
                info_data = json.load(f)
                info_data.update(user_info)
                f.seek(0)
                json.dump(info_data, f, indent=2)

            root.destroy()

        submit_button = tk.Button(root, text="Submit", command=submit)
        submit_button.grid(row=5, columnspan=2)

        root.mainloop()

        return user_info
    except Exception as e:
        logging.error(f"Error while getting user info: {e}")
        return {}

def main():
    try:
        data_folder = os.path.abspath('data')  # Assuming 'data' folder is in the same directory as the script
        missing_json_subfolders, total_missing = check_subfolders(data_folder)

        if missing_json_subfolders:
            message = f"{total_missing} subfolder(s) missing either 'parts.json' or 'info.json' or both:\n"
            message += "\n".join(missing_json_subfolders)
            messagebox.showwarning("Warning", message)
        else:
            messagebox.showinfo("Info", "All subfolders have both 'parts.json' and 'info.json'.")

        for subfolder in missing_json_subfolders:
            subfolder_info = get_subfolder_info(subfolder)
            if subfolder_info:
                user_info = get_user_info(data_folder, subfolder_info)
                print("User Info for", subfolder_info[0], ":", user_info)
            else:
                logging.warning(f"No info retrieved for subfolder {subfolder}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        messagebox.showerror("Error", "An unexpected error occurred. Please check the error log.")

if __name__ == "__main__":
    main()
