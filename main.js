const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false, // ✅ Dev only
    },
  });

  if (!app.isPackaged) {
    // Development
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools(); // ✅ OK for dev
  } else {
    // Production
    const indexPath = path.join(__dirname, "build", "index.html");
    win.loadFile(indexPath);
    // ❌ DO NOT open DevTools in production
  }

  // 🔒 Block inspect shortcuts in production
  if (app.isPackaged) {
    win.webContents.on("before-input-event", (event, input) => {
      if (
        (input.control && input.shift && input.key.toLowerCase() === "i") ||
        input.key === "F12"
      ) {
        event.preventDefault();
      }
    });
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
