import { UploadedFile } from "express-fileupload";
import path from "path";
import config from "config";
import fs from "fs";
const domain = process.env.DOMAIN || config.get<string>("domain");

export const storeFile = (
  folderName: string,
  file: UploadedFile,
  fileType: string = "images"
) => {
  const name = `${Date.now()}${Math.round(Math.random() * 1e4)}__${file.name}`;
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "static",
    fileType,
    folderName,
    name
  );
  file.mv(filePath);

  return `${domain}/static/${fileType}/${folderName}/${name}`;
};

export const restoreFile = (
  folderName: string,
  file: UploadedFile,
  oldFile: string | null,
  fileType: string = "images"
) => {
  const fileName = `${Date.now()}${Math.round(Math.random() * 1e4)}__${
    file.name
  }`;

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "static",
    fileType,
    folderName,
    fileName
  );
  if (oldFile && oldFile.startsWith(domain)) {
    const oldImagePath = path.join(
      __dirname,
      "..",
      "..",
      "static",
      fileType,
      folderName,
      oldFile.split("/").pop() || ""
    );
    fs.unlinkSync(oldImagePath);
  }

  file.mv(filePath);

  return `${domain}/static/${fileType}/${folderName}/${fileName}`;
};
