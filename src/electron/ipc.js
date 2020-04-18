const { ipcMain, app } = require("electron");
const spawn = require("cross-spawn");
const child_process = require("child_process");
const { MERGE_CONFIG_TOOL_PATH } = require("./const");
const os = require("os");

let lastChildProcess;

const initIPC = () => {
  ipcMain.on("merge-merge", (event, arg) => {
    if (lastChildProcess) {
      lastChildProcess.kill();
      lastChildProcess = null;
    }

    let cmd = "ffmpeg";
    let env = {
      ...process.env,
      PATH: "/usr/local/bin:" + child_process.execSync("echo $PATH").toString(),
    };

    if (os.platform() == "win32") {
      cmd = MERGE_CONFIG_TOOL_PATH;
    }

    lastChildProcess = spawn(
      cmd,
      ["-y", "-i", `concat:${arg.input}`, "-c", "copy", arg.output],
      {
        env: env,
      }
    );

    lastChildProcess.stdout.on("data", (data) => {
      event.reply("merge-merge-result", {
        type: "stdout",
        data: data.toString(),
      });
    });
    lastChildProcess.stderr.on("data", (data) => {
      event.reply("merge-merge-result", {
        type: "stderr",
        data: data.toString(),
      });
    });
    lastChildProcess.on("error", (data) => {
      event.reply("merge-merge-result", {
        type: "err",
        data: data.toString(),
      });
    });
  });

  app.on("before-quit", () => {
    lastChildProcess && lastChildProcess.kill();
  });
};
module.exports = initIPC;
