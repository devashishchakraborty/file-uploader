import { Router } from "express";
import vaultController from "../controllers/vaultController.js";
const vaultRouter = Router();

vaultRouter.get("/", vaultController.vaultHomeGet);
vaultRouter.get("/:folderId", vaultController.vaultFolderGet);

vaultRouter.post("/new-folder", vaultController.createFolderPost);

export default vaultRouter;
