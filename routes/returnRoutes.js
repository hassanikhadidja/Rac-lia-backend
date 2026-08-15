const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const returns = require("../controlles/returnController");

router.get("/", Auth, isAdmin, returns.getReturns);
router.post("/", upload.single("picture"), returns.createReturn);
router.patch("/:id", Auth, isAdmin, upload.single("picture"), returns.updateReturn);
router.delete("/:id", Auth, isAdmin, returns.deleteReturn);

module.exports = router;
