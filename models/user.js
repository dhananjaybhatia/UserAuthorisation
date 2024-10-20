import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/minipost");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profileimage: {
    type: String,
    default: "default.png",
  },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

const user = mongoose.model("user", userSchema);

export default user;
