# 🗝️ KeySort --- Password Compiler (Desktop App)

KeySort is a lightweight desktop application built with **Electron,
Vite, and React** that helps you import, organize, clean, and export
exported browser passwords into structured formats.

Designed for clarity. Built for control.

------------------------------------------------------------------------

## 🚀 Features

-   📂 Import multiple CSV files (Chrome, Edge, Firefox exports)
-   🧠 Automatic column detection (URL, Username, Password)
-   🏷 Smart site + domain extraction
-   🔁 Deduplicates passwords per account
-   📊 Groups accounts by website
-   📄 Export to:
    -   Structured TXT format (clean, readable layout)
    -   CSV format
-   🖥 Desktop-first experience (Windows installer via NSIS)
-   ⚡ Built with modern stack (Vite + React + Electron)

------------------------------------------------------------------------

## 🖼 Example TXT Export Output

    1 - Netflix - (netflix.com):

    1) Email: example@gmail.com
       Pass: strongpassword123

    2) Username: john_doe
       Pass: mybackup123

Clean. Structured. Human-readable.

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Vite\
-   React (SWC)\
-   Electron\
-   electron-builder (NSIS installer)\
-   PapaParse (CSV parsing)\
-   TypeScript

------------------------------------------------------------------------

## 📦 Installation (Development)

Clone the repository:

``` bash
git clone https://github.com/yourusername/keysort.git
cd keysort
```

Install dependencies:

``` bash
npm install
```

Run frontend only:

``` bash
npm run dev
```

Run Electron in development:

``` bash
npm run electron:dev
```

------------------------------------------------------------------------

## 🏗 Build Desktop App (Windows)

``` bash
npm run electron:build
```

Build output will be generated inside:

    release/

Includes: - win-unpacked/ - .exe - .msi installer

------------------------------------------------------------------------

## 📁 Project Structure

    keysort/
    ├── electron/          # Electron main process
    ├── src/               # React frontend
    ├── public/            # Static assets
    ├── dist/              # Vite production build
    ├── release/           # Electron build output
    ├── vite.config.ts
    ├── electron-builder.json
    └── package.json

------------------------------------------------------------------------

## 🔐 Privacy

KeySort runs completely locally.

-   No external API calls\
-   No cloud sync\
-   No tracking\
-   No data collection

All processing happens offline on your machine.

------------------------------------------------------------------------

## ⚠️ Disclaimer

This tool is intended for organizing password export files.

Always: - Store exported password files securely\
- Delete temporary exports after use\
- Use encrypted storage for backups

------------------------------------------------------------------------

## 👤 Author

Built by BlazeStacks.

------------------------------------------------------------------------

## 📄 License

MIT License
