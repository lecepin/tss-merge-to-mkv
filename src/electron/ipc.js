const { ipcMain, app } = require("electron");
const fs = require("fs");
const spawn = require("cross-spawn");
const child_process = require("child_process");
const {
  MERGE_CONFIG_TOOL_PATH,
  TMP_FILE_LIST,
  MERGE_CONFIG_TOOL_MAC_PATH,
} = require("./const");
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
    } else {
      cmd = MERGE_CONFIG_TOOL_MAC_PATH;
      try {
        fs.accessSync(cmd, fs.constants.X_OK);
        console.log("ffmpeg already has execute permissions");
      } catch (err) {
        try {
          fs.chmodSync(cmd, 0o755);
          console.log("Execute permissions set, running ffmpeg");
        } catch (err) {
          console.error("Error setting execute permissions for ffmpeg:", err);
        }
      }
    }

    fs.writeFileSync(TMP_FILE_LIST, arg.input);
    lastChildProcess = spawn(
      cmd,
      [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        TMP_FILE_LIST,
        "-c",
        "copy",
        "-bsf:a",
        "aac_adtstoasc",
        arg.output,
      ],
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
    lastChildProcess.on("close", () => {
      fs.unlinkSync(TMP_FILE_LIST);
    });
  });

  app.on("before-quit", () => {
    lastChildProcess && lastChildProcess.kill();
  });
};
module.exports = initIPC;
