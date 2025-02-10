import express from "express";
// import { passport, sessionConfig } from "./config/index.js";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// Get __dirname in ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads") });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// app.use(sessionConfig);
// app.use(passport.session());

app.get("/", (req, res) => res.render("form"));
app.post("/", upload.single('document'), (req, res) => {
  console.log(req.file, req.body)
  res.redirect("/");
});

app.listen(3000, () => console.log("app listening on port 3000!"));
