import { Router } from "express";
import vaultController from "../controllers/vaultController.js";
const vaultRouter = Router();

vaultRouter.get("/", vaultController.vaultHomeGet);
vaultRouter.get("/:folderName(*)", vaultController.vaultFolderGet);

vaultRouter.post("/new-folder", vaultController.createFolder);
vaultRouter.post("/:folderName(*)/new-folder", vaultController.createFolder);

vaultRouter.post("/file-upload", vaultController.uploadFilePost);
vaultRouter.post("/:folderName(*)/file-upload", vaultController.uploadFilePost);


export default vaultRouter;
