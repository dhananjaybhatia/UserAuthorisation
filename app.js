import dotenv from "dotenv";
import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import userModel from "./models/user.js";
import postModel from "./models/post.js";
import jwt from "jsonwebtoken";
import upload from "./config/multerConfig.js";
import path from "path";
import { fileURLToPath } from "url";
import user from "./models/user.js";

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

//register user
app.post("/register", async (req, res) => {
  let { username, name, email, age, password } = req.body;

  // Check if the user exists
  let user = await userModel.findOne({ email: email });
  if (user) {
    return res.send("User already registered");
  }

  // If the user doesn't exist, create a new one
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create the new user
    let createdUser = await userModel.create({
      username: username,
      name: name,
      age: age,
      email: email,
      password: hash,
    });

    // Generate JWT token using the newly created user ID
    let token = jwt.sign(
      { email: createdUser.email, userid: createdUser._id },
      "secret"
    );

    // Set the token in cookies
    res.cookie("token", token);

    // Send response
    res.send("registered");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred during registration");
  }
});

// login user
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let loginUser = await userModel.findOne({ email: email });
  if (!loginUser) res.send("Something went wrong..");

  bcrypt.compare(password, loginUser.password, (error, result) => {
    if (result) {
      let token = jwt.sign(
        { email: loginUser.email, userid: loginUser._id },
        "secret"
      );
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send("Invalid request.");
  }
};

// Ensure the middleware is declared before the route
app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("post");
  let upperCaseName = user.name.toUpperCase();
  res.render("profile", {
    user: { ...user._doc, name: upperCaseName }, // Pass user information to the template
  });
});

app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});
app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.profileimage = req.file.filename;
  await user.save();
  console.log(user);
  res.redirect("/profile");
});

// like
app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  res.redirect("/profile");
});

// edit
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});
// update post
app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/profile");
});

// delete
app.get("/delete/:id", isLoggedIn, async (req, res) => {
  await postModel.findOneAndDelete({ _id: req.params.id });

  res.redirect("/profile");
});

//log-out
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

//write a post
app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  // Destructure content from request body
  let { content } = req.body;
  // Create the post associated with the user
  let post = await postModel.create({
    user: user._id,
    content: content,
  });

  // Add the post's ID to the user's posts array
  user.post.push(post._id);

  // Save the user after updating the posts array
  await user.save();

  // Redirect to the profile page
  res.redirect("/profile");
});

// multer
app.get("/test", (req, res) => {
  res.render("test");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
