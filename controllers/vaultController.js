import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import CustomNotFoundError from "../errors/CustomNotFoundError.js";
import multer from "multer";

const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

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
    select: {
      name: true,
    },
  });
  const files = await prisma.file.findMany({
      where: {
        uploader_id: req.user.id,
        folder_id: null,
      },
      select: {
        name: true,
        mimetype: true
      }
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
      select: {
        id: true,
      },
    })
  ).at(0);

  if (!currentFolder) {
    throw new CustomNotFoundError("Folder Not found!");
  }

  const folders = await prisma.folder.findMany({
    where: {
      creator_id: req.user.id,
      name: {
        startsWith: `${folderName}/`, // Equivalent to `LIKE 'currentFolder.name/%'`
        not: {
          contains: `${folderName}/` + "%/", // Equivalent to `NOT LIKE 'currentFolder.name/%/%'`
        },
      },
    },
  });

  const files = await prisma.file.findMany({
    where: {
      uploader_id: req.user.id,
      folder_id: currentFolder.id,
    },
  });

  res.render("vault", {
    files: files,
    folders: folders,
    currentFolderArr: folderName.split("/"),
  });
});

const createFolder = [
  validateFolderName,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("vault", {
        currentFolderArr: req.params.folderName.split("/") || [],
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
    const folderName = req.params.folderName || "";
    const folderId = folderName
      ? (
          await prisma.folder.findMany({
            select: {
              id: true,
            },
            where: {
              name: folderName,
              creator_id: req.user.id,
            },
          })
        ).at(0).id
      : null;

    await prisma.file.create({
      data: {
        name: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        path: req.file.path,
        uploader_id: req.user.id,
        folder_id: folderId,
      },
    });
    console.log(req.file);
    res.redirect(`/vault/${folderName}`);
  },
];

export default {
  vaultHomeGet,
  vaultFolderGet,
  createFolder,
  uploadFilePost,
};
