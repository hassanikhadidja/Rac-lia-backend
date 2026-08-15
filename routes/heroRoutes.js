const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const hero = require("../controlles/heroSlideController");

router.get("/", hero.getPublicSlides);
router.post("/", Auth, isAdmin, upload.single("file"), hero.createSlide);
router.patch("/:id", Auth, isAdmin, upload.single("file"), hero.updateSlide);
router.delete("/:id", Auth, isAdmin, hero.deleteSlide);

module.exports = router;
