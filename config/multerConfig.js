import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// set up diskstorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, name) => {
      const fn = name.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

const upload = multer({ storage: storage });
export default upload;

// export upload variable
