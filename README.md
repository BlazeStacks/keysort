# 🔐 KeySort

KeySort is a Windows desktop tool that compiles, merges, and organizes exported password CSV files into a clean, searchable, and exportable format.

Built with Python and PySide6.

---

## ✨ Features

- Import multiple CSV password exports
- Automatically detect URL, username, and password columns
- Merge duplicate accounts intelligently
- Group credentials by site/domain
- Live search filtering
- One-click copy to clipboard
- Password visibility toggle
- Export compiled results to:
  - CSV
  - TXT
- GitHub update detection
- Windows MSI installer support

---

## 📦 Download

Download the latest installer from:

https://github.com/BlazeStacks/keysort/releases

Install the `.msi` file and launch KeySort from the Start Menu.

---

## 🛠 Development Setup

### 1. Clone the repository

git clone https://github.com/BlazeStacks/keysort.git  
cd keysort

### 2. Install dependencies

pip install PySide6 pandas requests tldextract

### 3. Run the application

python keysort.py

---

## 🔨 Building the Executable

Using PyInstaller:

pyinstaller --onefile --windowed --icon=keysort.ico keysort.py

The executable will appear inside the `dist` folder.

---

## 📜 License

This project is licensed under the MIT License.  
See the LICENSE file for details.

---

## ⚠ Disclaimer

KeySort processes password export files locally.  
It does not transmit data externally.  

Users are responsible for handling exported password data securely.