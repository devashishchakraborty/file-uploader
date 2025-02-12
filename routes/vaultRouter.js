import { Router } from "express";
import vaultController from "../controllers/vaultController.js";
const vaultRouter = Router();

vaultRouter.get("/", (req, res) => {
  res.locals.user = req.user;
  res.locals.currentDirectoryName = "";
  res.render("vault");
});

// vaultRouter.get("/folderId?", (req, res) => {
//   const { folderId } = req.params;
//   res.render("vault");
// });

vaultRouter.post("/new-folder", vaultController.createFolderPost);

export default vaultRouter;
