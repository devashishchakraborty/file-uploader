import { Router } from "express";
const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  if (req.user) res.redirect("/vault");
  else res.render("index");
});

export default indexRouter;
