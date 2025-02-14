import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import CustomNotFoundError from "../errors/CustomNotFoundError.js";
import multer from "multer";

const prisma = new PrismaClient();
const upload = multer({ dest: "../uploads/" });

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
      const parentFolderName = req.params.folderName || "";
      const folder = (
        await prisma.folder.findMany({
          where: {
            creator_id: req.user.id,
            name:
              parentFolderName.length !== 0
                ? parentFolderName + "/" + value
                : value,
          },
        })
      )[0];
      if (folder) throw new Error("Folder Name Already Exists");
    }),
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
  res.render("vault", { files: files, folders: folders, currentFolderArr: [] });
};

const vaultFolderGet = asyncHandler(async (req, res) => {
  if (req.path.endsWith("/") && req.path.length > 1) {
    return res.redirect(301, req.path.slice(0, -1));
  }

  const { folderName } = req.params;
  const currentFolder = (
    await prisma.folder.findMany({
      where: {
        name: folderName,
        creator_id: req.user.id,
      },
    })
  ).at(0);

  if (!currentFolder) {
    throw new CustomNotFoundError("Folder Not found!");
  }

  const folders = await prisma.$queryRaw`
  SELECT * FROM "Folder" WHERE creator_id = ${req.user.id} AND name LIKE ${currentFolder.name} || '/%' AND name NOT LIKE ${currentFolder.name} || '/%/%'
  `;

  const files = await prisma.file.findMany({
    where: {
      uploader_id: req.user.id,
      folder_id: currentFolder.id,
    },
  });

  res.render("vault", {
    files: files,
    folders: folders,
    currentFolderArr: currentFolder.name.split("/"),
  });
});

const createFolderPost = [
  validateFolderName,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("vault", {
        errors: errors.array(),
      });
    }

    const parentFolderName = req.params.folderName || "";
    const { folderName } = req.body;
    await prisma.folder.create({
      data: {
        name:
          parentFolderName.length !== 0
            ? parentFolderName + "/" + folderName
            : folderName,
        creator_id: req.user.id,
      },
    });
    res.redirect(`/vault/${parentFolderName}`);
  },
];

const uploadFilePost = [
  upload.single("uploadedFile"),
  async (req, res) => {
    console.log(req.file, req.body);
    res.redirect("/vault");
  },
];

export default {
  vaultHomeGet,
  vaultFolderGet,
  createFolderPost,
  uploadFilePost,
};
