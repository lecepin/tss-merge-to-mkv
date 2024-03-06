const path = require("path");
const os = require("os");
const mkdirp = require("mkdirp");
const { app } = require("electron");

const appPath = app.getAppPath();
const asarPath =
  appPath.indexOf("app.asar") > -1
    ? appPath.substring(0, appPath.indexOf("app.asar"))
    : appPath;
const HOME_PATH = path.join(os.homedir(), ".tss-merge-to-mkv");

mkdirp.sync(HOME_PATH);

module.exports = {
  MERGE_CONFIG_TOOL_PATH: path.join(asarPath, "./public/tool.exe"),
  MERGE_CONFIG_TOOL_MAC_PATH: path.join(asarPath, "./public/mac-tool"),
  MERGE_CONFIG_ICO: path.join(asarPath, "./public/icon/32.ico"),
  ASAR_PATH: asarPath,
  HOME_PATH,
  TMP_FILE_LIST: path.join(HOME_PATH, ".tss-m-t-m-file-list.txt"),
};
