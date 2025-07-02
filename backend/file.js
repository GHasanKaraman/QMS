const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs-extra");
const sharp = require("sharp");

const IMGS_DIR = path.join(__dirname, "imgs");
const MAX_FILES_PER_FOLDER = 500;

const upload = multer({ storage: multer.memoryStorage() });

async function getLastFolderIndex() {
  await fs.ensureDir(IMGS_DIR);
  const folders = await fs.readdir(IMGS_DIR);

  const numericFolders = folders
    .map((name) => parseInt(name))
    .filter((num) => !isNaN(num))
    .sort((a, b) => a - b);

  return numericFolders.length ? numericFolders[numericFolders.length - 1] : 0;
}

async function ensureFolderWithSpace(numNewFiles) {
  let folderIndex = await getLastFolderIndex();
  let folderPath = path.join(IMGS_DIR, `${folderIndex}`);

  let count = 0;
  if (await fs.pathExists(folderPath)) {
    count = (await fs.readdir(folderPath)).length;
  } else {
    await fs.ensureDir(folderPath);
  }

  // If not enough space for all new files, create a new folder
  if (count + numNewFiles > MAX_FILES_PER_FOLDER) {
    folderIndex += 1;
    folderPath = path.join(IMGS_DIR, `${folderIndex}`);
    await fs.ensureDir(folderPath);
  }

  return folderPath;
}

const handleUpload = [
  upload.any(),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        req.savedImages = []; // no files uploaded, continue gracefully
        return next();
      }

      const savedPaths = [];

      for (const file of req.files) {
        const folderPath = await ensureFolderWithSpace(1); // check one-by-one
        const fileName = uuid.v4() + path.extname(file.originalname);
        const filePath = path
          .join(folderPath, fileName)
          .replace(/\.[^/.]+$/, ".jpeg");
        const thumbnailName = `thumbnail-${fileName}`;
        const thumbnailPath = path
          .join(folderPath, thumbnailName)
          .replace(/\.[^/.]+$/, ".jpeg");

        await sharp(file.buffer)
          .rotate()
          .resize(1920)
          .toFormat("jpeg")
          .jpeg({ quality: 75 })
          .toFile(filePath);

        await sharp(file.buffer)
          .rotate()
          .resize(200)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(thumbnailPath);

        savedPaths.push({
          folderIndex: path.basename(folderPath),
          fileName: fileName.replace(/\.[^/.]+$/, ".jpeg"),
        });
      }

      req.savedImages = savedPaths;
      next();
    } catch (err) {
      console.error("Image upload failed:", err);
      res.status(500).send("Image upload failed");
    }
  },
];

/*

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var fileIndex = 0;
    const totalNumber = getCount("./imgs");
    fileIndex = totalNumber;
    if (!fs.existsSync("./imgs/" + totalNumber)) {
      fs.mkdirSync("./imgs/" + totalNumber);
    } else {
      const totalImage = fs.readdirSync("./imgs/" + totalNumber).length;
      if (totalImage > 500) {
        fileIndex += 1;
      }
    }
    const dest = `./imgs/${fileIndex}`;
    fs.access(dest, function (error) {
      if (error) {
        return fs.mkdir(dest, (error) => cb(error, dest));
      } else {
        return cb(null, dest);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });*/

module.exports = handleUpload;
