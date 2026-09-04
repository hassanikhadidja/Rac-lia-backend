const express = require("express");
const router = express.Router();
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const boutique = require("../controlles/boutiqueController");

router.get("/", boutique.getBoutiques);
router.post("/", Auth, isAdmin, boutique.addBoutique);
router.patch("/:id", Auth, isAdmin, boutique.updateBoutique);
router.delete("/:id", Auth, isAdmin, boutique.deleteBoutique);

module.exports = router;
