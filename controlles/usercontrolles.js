const isValidEmail = require("../middlewares/emailvalidator");
const passwordvalidator = require("../middlewares/passwordvalidator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");
const { toFrontendUser } = require("../utils/mappers");

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: cloudinary.UPLOAD_FOLDER }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

function parseOptionalBirthday(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const min = new Date(1900, 0, 1);
  if (d > now || d < min) return null;
  return d;
}

function normalizeRole(role) {
  const map = {
    Admin: "admin",
    Manager: "manager",
    Support: "support",
    Customer: "client",
    admin: "admin",
    manager: "manager",
    support: "support",
    client: "client",
  };
  return map[role] || "client";
}

exports.Adduser = async (req, res) => {
  try {
    const { email, name, password, birthday, phone } = req.body;
    if (req.body.role && !req.user) {
      return res.status(400).json({ msg: "Not auth !!" });
    }

    const ValidEmail = isValidEmail(email);
    if (!ValidEmail) {
      return res.status(400).json({ msg: "Should be format email" });
    }

    const Matcheduser = await User.findOne({ email: String(email).toLowerCase() });
    if (Matcheduser) {
      return res.status(400).json({ msg: "Email exist please login" });
    }

    if (!passwordvalidator(password)) {
      return res.status(400).json({ msg: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const birthdayDate = parseOptionalBirthday(birthday);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userKey: req.body.userKey || req.body.id || `user-${Date.now()}`,
      name: name || "",
      email: String(email).toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      points: Number(req.body.points) || 0,
      status: req.body.status || "active",
      role: req.user?.role === "admin" && req.body.role ? normalizeRole(req.body.role) : "client",
      ...(birthdayDate ? { birthday: birthdayDate } : {}),
    });

    return res.status(201).json({ msg: "Register success", user: toFrontendUser(user) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existUser = await User.findOne({ email: String(email).toLowerCase() });
    if (!existUser) {
      return res.status(400).json({ msg: "Bad credential !" });
    }

    const existpassword = await bcrypt.compare(password, existUser.password);
    if (!existpassword) {
      return res.status(400).json({ msg: "Bad credential !" });
    }

    const jwt = require("jsonwebtoken");
    const payload = { _id: existUser._id };
    const token = jwt.sign(payload, process.env.secretKey);

    return res.status(200).json({
      msg: "login success",
      token,
      user: toFrontendUser(existUser),
    });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    return res.status(200).json(toFrontendUser(req.user));
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users.map(toFrontendUser));
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const update = {};
    const { name, phone, address, wilaya, commune, birthday } = req.body;
    if (name != null) update.name = String(name).trim();
    if (phone != null) update.phone = String(phone).trim();
    if (address != null) update.address = String(address).trim();
    if (wilaya != null) update.wilaya = String(wilaya).trim();
    if (commune != null) update.commune = String(commune).trim();
    if (birthday != null) {
      const d = birthday ? new Date(birthday) : null;
      update.birthday = d && !Number.isNaN(d.getTime()) ? d : null;
    }
    if (req.file?.buffer) {
      update.avatar = await uploadOne(req.file.buffer);
    } else if (req.body.avatar != null) {
      update.avatar = String(req.body.avatar).trim();
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.status(200).json({ msg: "Update success", user: toFrontendUser(user) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.UpdateUSER = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.password;
    delete body.email;
    if (body.role != null) body.role = normalizeRole(body.role);
    if (body.points != null) body.points = Number(body.points) || 0;

    const key = req.params.id;
    const user = await User.findOneAndUpdate(
      { $or: [{ userKey: key }, ...( /^[a-f\d]{24}$/i.test(key) ? [{ _id: key }] : []) ] },
      body,
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.status(202).json({ msg: "Update success", user: toFrontendUser(user) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
