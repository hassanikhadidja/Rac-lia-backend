const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const hero = require("../controlles/webPicController");

// Backward-compatible /hero routes (same as /webpic)
router.get("/", hero.getPublicWebPics);
router.post("/", Auth, isAdmin, upload.single("file"), hero.createWebPic);
router.patch("/:id", Auth, isAdmin, upload.single("file"), hero.updateWebPic);
router.delete("/:id", Auth, isAdmin, hero.deleteWebPic);

module.exports = router;
