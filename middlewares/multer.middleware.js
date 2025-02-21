import path from "path";
import multer from "multer";
import { decodeFilename } from "../utils/decodeFilename.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    const filename = decodeFilename(file.originalname);
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage: storage });
