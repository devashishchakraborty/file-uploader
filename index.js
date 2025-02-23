import express from "express";
import passport from "./config/passport.js";
import sessionConfig from "./config/session.js";
import path from "path";
import indexRouter from "./routes/indexRouter.js";
import authRouter from "./routes/authRouter.js";
import vaultRouter from "./routes/vaultRouter.js";

const app = express();
const port = process.env.PORT || 3000;

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(sessionConfig);
app.use(passport.session());

app.use("/", authRouter);
app.use("/", indexRouter);
app.use(
  "/vault",
  (req, res, next) => (req.user ? next() : res.redirect("/")),
  vaultRouter
);

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
  console.error(err);
  // We can now specify the `err.statusCode` that exists in our custom error class and if it does not exist it's probably an internal server error
  res.status(err.statusCode || 500).render("404", { message: err.message });
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
