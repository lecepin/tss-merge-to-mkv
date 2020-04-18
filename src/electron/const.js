const path = require("path");
const { app } = require("electron");

const appPath = app.getAppPath();
const asarPath =
  appPath.indexOf("app.asar") > -1
    ? appPath.substring(0, appPath.indexOf("app.asar"))
    : appPath;

module.exports = {
  MERGE_CONFIG_TOOL_PATH: path.join(asarPath, "./public/tool.exe"),
  MERGE_CONFIG_ICO: path.join(asarPath, "./public/icon/32.ico"),
};
