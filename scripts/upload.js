const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const packsDir = path.join(__dirname, "../packs");
let dmgFile = null;

try {
  const files = fs.readdirSync(packsDir);
  for (let file of files) {
    if (path.extname(file).toLowerCase() === ".dmg") {
      dmgFile = path.join(packsDir, file);
      break;
    }
  }
} catch (error) {
  console.error("Error reading the packs directory", error.message);
  process.exit(1);
}

if (!dmgFile) {
  console.log("No .dmg file found in packs directory.");
  process.exit(1);
}

if (dmgFile) {
  const form = new FormData();
  form.append("fileToUpload", fs.createReadStream(dmgFile));

  const config = {
    headers: {
      ...form.getHeaders(),
    },
    onUploadProgress: (progressEvent) => {
      let percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`${percentCompleted}% completed`);
    },
  };

  axios
    .post("http://u.leping.fun/upload", form, config)
    .then((response) => {
      console.log("File uploaded successfully", response.data);
    })
    .catch((error) => {
      console.error(
        "Error uploading file",
        error.response ? error.response.data : error.message
      );
    });
}
