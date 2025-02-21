import { Router } from "express";
import vaultController from "../controllers/vaultController.js";
const vaultRouter = Router();

vaultRouter.get("/", vaultController.vaultHomeGet);
vaultRouter.get("/:folderId", vaultController.vaultFolderGet);
vaultRouter.post("/new-folder", vaultController.createFolder);
vaultRouter.post("/:folderId/new-folder", vaultController.createFolder);
vaultRouter.post("/:folderId/edit-folder", vaultController.editFolder);
vaultRouter.post("/:folderId/delete", vaultController.deleteFolder);

vaultRouter.get("/file/:fileId", vaultController.vaultFileGet);
vaultRouter.get('/file/:fileId/download', vaultController.downloadFile)
vaultRouter.post("/file-upload", vaultController.uploadFile);
vaultRouter.post("/:folderId/file-upload", vaultController.uploadFile);
vaultRouter.post("/file/:fileId/delete", vaultController.deleteFile);


export default vaultRouter;
