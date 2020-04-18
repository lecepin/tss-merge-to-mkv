const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const initIPC = require("./ipc");
const { MERGE_CONFIG_ICO } = require("./const");

const path = require("path");
const url = require("url");

let mainWindow;

app.commandLine.appendSwitch("--no-proxy-server");

function createWindow() {
  try {
    electron.Menu.setApplicationMenu(null);
  } catch (error) {}

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    maximizable: false,
    icon: MERGE_CONFIG_ICO,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: !!process.env.ELECTRON_START_URL,
    },
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "/web/index.html"),
      protocol: "file:",
      slashes: true,
    });
  mainWindow.loadURL(startUrl);
  process.env.ELECTRON_START_URL && mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

initIPC();
