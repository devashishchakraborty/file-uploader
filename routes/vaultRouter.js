import { Router } from "express";
import vaultController from "../controllers/vaultController.js";
const vaultRouter = Router();

vaultRouter.get("/", vaultController.vaultHomeGet);
vaultRouter.get("/:folderId", vaultController.vaultFolderGet);
vaultRouter.get("/:folderId/delete", vaultController.vaultFolderDelete);

vaultRouter.post("/new-folder", vaultController.createFolder);
vaultRouter.post("/:folderId/new-folder", vaultController.createFolder);

vaultRouter.post("/file-upload", vaultController.uploadFilePost);
vaultRouter.post("/:folderId/file-upload", vaultController.uploadFilePost);

vaultRouter.post("/:folderId/edit-folder", vaultController.editFolder)

export default vaultRouter;
