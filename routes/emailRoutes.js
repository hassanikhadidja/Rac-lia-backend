const express = require("express");
const router = express.Router();
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const email = require("../controlles/emailController");

router.get("/", Auth, isAdmin, email.getEmails);
router.post("/", email.upsertEmail);
router.patch("/:id", Auth, isAdmin, email.updateEmail);
router.delete("/:id", Auth, isAdmin, email.deleteEmail);

module.exports = router;
