import path from "path";
import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import CustomNotFoundError from "../errors/CustomNotFoundError.js";
import multer from "multer";

const prisma = new PrismaClient();
const decodeFilename = filename => Buffer.from(filename, 'latin1').toString('utf8');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/'); // Ensure 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    const filename = decodeFilename(file.originalname)
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    cb(null, `${baseName}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storage });

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

const uploadFilePost = [
  upload.single("uploadedFile"),
  async (req, res) => {
    const folderId = +req.params.folderId || null;

    await prisma.file.create({
      data: {
        name: decodeFilename(req.file.originalname),
        mimetype: req.file.mimetype,
        path: req.file.path,
        uploader_id: req.user.id,
        size: req.file.size,
        folder_id: folderId,
      },
    });
    console.log(req.file);
    res.redirect(`/vault/${folderId || ""}`);
  },
];

const deleteFolder = async (req, res) => {
  const folderId = +req.params.folderId;
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    select: {
      parent_id: true,
    },
  });
  const parentId = folder.parent_id || "";
  await prisma.folder.delete({
    where: {
      id: folderId,
    },
  });
  res.redirect(`/vault/${parentId}`);
};

const vaultFileGet = async (req, res) => {
  const { fileId } = req.params;
  const file = await prisma.file.findUnique({
    where: {
      id: +fileId
    },
    include: {
      uploader: true,
    }
  })
  res.render("file", { file: file });
};

export default {
  vaultHomeGet,
  vaultFolderGet,
  createFolder,
  editFolder,
  deleteFolder,
  vaultFileGet,
  uploadFilePost,
};
