import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UserModel from "./Models/Users.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ConnectDb from "./Database/dbConfig.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
ConnectDb();

app.listen(4007, () => {
  console.log("Server Is Running");
});

const verifyUser = (req, res, next) => {
  const token = req.cookie.token;
  if (!token) {
    return res.json("Token Is Missing");
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json("Error With Token");
      } else {
        if (decoded.User === "Succes") {
          next();
          // } else {
          //   return res.json("Not Admin");
        }
      }
    });
  }
};
app.get("/home", verifyUser, (req, res) => {
  res.json("Suceesed");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    UserModel.create({ name, email, password: hash })
      .then((user) => res.json({ status: "OK" }))
      .catch((err) => res.json(err));
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign(
            { email: user.email, password: user.password },
            "jwt_secret_key"
          );
          res.cookie("token", token);

          return res.json({ Message: "Success", user: user });
        } else {
          res.json("The Password Is Incorrect");
        }
      });
    } else {
      res.json("No Records Exited");
    }
  });
});

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.send({ status: "not exited" });
    }
    const token = jwt.sign({ id: user._id }, "jwt_secret_key", {});

    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tamil.kani56@gmail.com",
        pass: "jjta wiiv uknp yffg",
      },
    });

    let details = {
      from: "tamil.kani56@gmail.com",
      to: "tamil.kani56@gmail.com",
      subject: "Reset your Password Link",
      text: `http://localhost:5173/reset-password/${user._id}/${token}`,
    };

    mailTransporter.sendMail(details, (err) => {
      if (err) {
        console.log("mail not send");
      } else {
        console.log("mail sent successfully");
      }
    });
  });
});

app.post("/reset-password/:id/:token/:password", (req, res) => {
  const { id, token, password } = req.params;
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ status: "Error with token" });
    } else {
      bcrypt.hash(password, 10).then((hash) => {
        UserModel.findByIdAndUpdate({ _id: id }, { password: hash }).then(
          (u) => {
            res.send({ status: "Success" });
            // .catch((err) => res.send({ status: err }));
          }
        );
      });
    }
  });
});
app.get("/", async (req, res) => {
  // for testing
  try {
    console.log("server working");
    res.status(200).json({ message: "working" });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "error in server side" });
  }
});
