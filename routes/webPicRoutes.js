const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const webPic = require("../controlles/webPicController");

router.get("/", webPic.getPublicWebPics);
router.get("/active", webPic.getActiveWebPic);
router.post("/", Auth, isAdmin, upload.single("file"), webPic.createWebPic);
router.patch("/:id", Auth, isAdmin, upload.single("file"), webPic.updateWebPic);
router.delete("/:id", Auth, isAdmin, webPic.deleteWebPic);

module.exports = router;
