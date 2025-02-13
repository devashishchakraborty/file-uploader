import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

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
    .escape(),
];

const vaultHomeGet = async (req, res) => {
  res.locals.user = req.user;
  const folders = await prisma.folder.findMany({
    where: {
      creator_id: req.user.id,
      name: {
        not: {
          contains: "/",
        },
      },
    },
  });
  const files = await prisma.file.findMany({
    where: {
      uploader_id: req.user.id,
      folder_id: null,
    },
  });
  res.render("vault", { files: files, folders: folders });
};

const vaultFolderGet = async (req, res) => {
  const { folderId } = req.params;
  const currentFolder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  folders = await prisma.folder.findMany({
    where: {
      creator_id: req.user.id,
      name: {
        startsWith: currentFolder.name + "/",
      },
    },
  });
  files = await prisma.file.findMany({
    where: {
      uploader_id: req.user.id,
      folder_id: req.params.folderId,
    },
  });

  res.locals.currentFolderName = currentFolder.name;
  res.render("vault", { files: files, folders: folders });
};

const createFolderPost = [
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
        creator_id: req.user.id,
      },
    });
    res.redirect('/');
  },
];

export default {
  vaultHomeGet,
  vaultFolderGet,
  createFolderPost,
};
