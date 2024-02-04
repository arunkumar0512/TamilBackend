import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "vistors",
  },
});

const UserModel = mongoose.model("users", UserSchema);
export default UserModel;
