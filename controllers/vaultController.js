import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import CustomNotFoundError from "../errors/CustomNotFoundError.js";
import { upload } from "../middlewares/multer.middleware.js";
import { decodeFilename } from "../utils/decodeFilename.js";
import fs from "fs";
import {
  uploadOnCloudinary,
  downloadFromCloudinary,
  deleteFromCloudinary
} from "../utils/cloudinary.js";

const prisma = new PrismaClient();

const validateFolderName = [
  body("folderName")
    .trim()
    .isString()
    .withMessage("Folder name must be a string")
    .isLength({ min: 1, max: 255 })
    .withMessage("Folder name must be between 1 and 255 characters")
    .matches(/^[a-zA-Z0-9_\-.]+$/)
    .withMessage(
      "Folder name can only contain letters, numbers, underscores, hyphens, and dots"
    )
    .escape()
    // Checking if folderName already exists
    .custom(async (value, { req }) => {
      const parentFolderId = +req.params.folderId || null;
      const folder = await prisma.folder.findFirst({
        where: {
          parent_id: parentFolderId,
          name: value,
        },
      });
      if (folder) throw new Error("Folder Name Already Exists");
    }),
];

const vaultHomeGet = async (req, res) => {
  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: {
        creator_id: req.user.id,
        parent_id: null, // Fetch only root folders (no parent)
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.file.findMany({
      where: {
        uploader_id: req.user.id,
        folder_id: null, // Fetch only files not in any folder
      },
      select: {
        id: true,
        name: true,
        mimetype: true,
      },
    }),
  ]);

  res.render("vault", { user: req.user, files: files, folders: folders });
};

const vaultFolderGet = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const currentFolder = await prisma.folder.findUnique({
    where: {
      id: +folderId,
      creator_id: req.user.id,
    },
    include: {
      files: {
        select: {
          id: true,
          name: true,
          mimetype: true,
        },
      },
      parent: {
        select: {
          id: true,
          name: true,
          parent_id: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!currentFolder) {
    throw new CustomNotFoundError("Folder Not found!");
  }

  const folders = currentFolder.children;
  const files = currentFolder.files;

  res.render("vault", {
    user: req.user,
    files: files,
    folders: folders,
    currentFolder: currentFolder,
  });
});

const createFolder = [
  validateFolderName,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("vault", {
        user: req.user,
        errors: errors.array(),
      });
    }

    const { folderName } = req.body;
    await prisma.folder.create({
      data: {
        name: folderName,
        parent_id: +req.params.folderId || null,
        creator_id: req.user.id,
      },
    });
    res.redirect(`/vault/${req.params.folderId || ""}`);
  },
];

const editFolder = [
  validateFolderName,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("vault", {
        errors: errors.array(),
      });
    }

    const { folderName } = req.body;
    const updateUser = await prisma.folder.update({
      where: {
        id: +req.params.folderId,
      },
      data: {
        name: folderName,
      },
    });
    res.redirect(`/vault/${updateUser.parent_id || ""}`);
  },
];

const deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  const folder = await prisma.folder.delete({
    where: {
      id: +folderId,
    },
  });
  res.redirect(`/vault/${folder.parent_id || ""}`);
};

const uploadFile = [
  upload.single("uploadedFile"),
  async (req, res) => {
    const folderId = +req.params.folderId || null;
    const uploadedFile = await uploadOnCloudinary(req.file.path);
    await prisma.file.create({
      data: {
        name: decodeFilename(req.file.originalname),
        mimetype: req.file.mimetype,
        url: uploadedFile.secure_url,
        uploader_id: req.user.id,
        size: req.file.size,
        folder_id: folderId,
      },
    });
    res.redirect(`/vault/${folderId || ""}`);
  },
];

const vaultFileGet = async (req, res) => {
  const { fileId } = req.params;
  const file = await prisma.file.findUnique({
    where: {
      id: +fileId,
    },
    include: {
      uploader: true,
    },
  });
  res.render("file", { user: req.user, file: file });
};

const downloadFile = async (req, res) => {
  const file = await prisma.file.findUnique({
    where: {
      id: +req.params.fileId,
    },
  });

  const outputFilePath = "./public/downloads/" + Date.now() + file.name;
  const fileStream = await downloadFromCloudinary(file.url, outputFilePath);
  // Handle the finish event
  fileStream.on("finish", () => {
    res.download(outputFilePath, file.name, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Could not download the file.");
      }

      // Delete the file after it has been downloaded
      fs.unlink(outputFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      });
    });
  });
};

const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  const file = await prisma.file.delete({
    where: {
      id: +fileId,
    },
  });
  await deleteFromCloudinary(file.url)
  res.redirect(`/vault/${file.folder_id || ""}`);
};

export default {
  vaultHomeGet,
  vaultFolderGet,
  createFolder,
  editFolder,
  deleteFolder,
  vaultFileGet,
  uploadFile,
  downloadFile,
  deleteFile,
};
