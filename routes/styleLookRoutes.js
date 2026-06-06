const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const styleLook = require("../controlles/styleLookController");

router.get("/storefront", styleLook.getStorefrontLooks);
router.get("/", Auth, isAdmin, styleLook.getAllLooks);
router.post("/", Auth, isAdmin, upload.single("file"), styleLook.addLook);
router.patch("/:id", Auth, isAdmin, upload.single("file"), styleLook.updateLook);
router.delete("/:id", Auth, isAdmin, styleLook.deleteLook);

module.exports = router;
