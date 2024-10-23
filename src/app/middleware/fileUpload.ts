import { Request } from "express";
import fs from "fs";
import multer from "multer";

const fileUpload = (uploadDirectory: string) => {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
      cb(null, uploadDirectory);
    },
    filename: function (req: Request, file, cb) {
      const parts = file.originalname.split(".");
      let extension;
      if (parts.length > 1) {
        extension = "." + parts.pop();
      }
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        parts.shift()!.replace(/\s+/g, "_") + "-" + uniqueSuffix + extension
      );
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2000000, // 2 MB limit
    },
    // fileFilter: function (req: Request, file, cb) {
    //   // Allowed image types
    //   const allowedMimeTypes = [
    //     "image/png",
    //     "image/jpg",
    //     "image/jpeg",
    //     "image/gif",
    //     "image/webp",
    //     "image/bmp",
    //     "image/tiff",
    //     "image/tif",
    //     "image/svg",
    //     "image/svg+xml",
    //   ];

    //   // Check if the file type is allowed
    //   if (allowedMimeTypes.includes(file.mimetype)) {
    //     cb(null, true); // Accept the file
    //   } else {
    //     // Reject the file and send a friendly error message
    //     //@ts-ignore
    //     cb(new Error("Only png, jpg, jpeg, svg formats are allowed"), false);
    //   }
    // },
  });

  return upload;
};

export default fileUpload;
