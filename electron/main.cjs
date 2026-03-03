const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, "../public/pwa-512x512.png"),
    backgroundColor: "#0f1419",
    titleBarStyle: "default",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In production, load the built files
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    // In dev, load from Vite dev server
    win.loadURL("http://localhost:5174");
  }

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
