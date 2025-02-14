import { Router } from "express";
import vaultController from "../controllers/vaultController.js";
const vaultRouter = Router();

vaultRouter.get("/", vaultController.vaultHomeGet);
vaultRouter.get("/:folderName(*)", vaultController.vaultFolderGet);

vaultRouter.post("/:folderName(*)/new-folder", vaultController.createFolderPost);

export default vaultRouter;
