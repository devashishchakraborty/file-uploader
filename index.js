import express from "express";
import passport from "./config/passport.js";
import sessionConfig from "./config/session.js";
import path from "path";
import { fileURLToPath } from "url";
import indexRouter from "./routes/indexRouter.js";
import authRouter from "./routes/authRouter.js";
import vaultRouter from "./routes/vaultRouter.js";

// Get __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(sessionConfig);
app.use(passport.session());

app.use(
  "/vault",
  (req, res, next) => (req.user ? next() : res.redirect("/")),
  vaultRouter
);
app.use("/", authRouter);
app.use("/", indexRouter);

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
  console.error(err);
  // We can now specify the `err.statusCode` that exists in our custom error class and if it does not exist it's probably an internal server error
  res.status(err.statusCode || 500).render("404", { message: err.message });
});

app.listen(3000, () => console.log("app listening on port 3000!"));
