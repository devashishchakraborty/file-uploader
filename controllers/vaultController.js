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

const getItems = async (req, res) => {
  const folders = await prisma.folder.findMany({});
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
    res.redirect(`/vault`);
  },
];

export default {
  createFolderPost,
};
