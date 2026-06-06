const express = require("express");
const router = express.Router();
const controlles = require("../controlles/productcontrolles");
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", controlles.GetProducts);
router.get("/:idOrSlug", controlles.GetOneProduct);

router.post("/", upload.array("files", 10), Auth, isAdmin, controlles.AddProduct);
router.patch("/:idOrSlug", upload.array("files", 10), Auth, isAdmin, controlles.UpdateProduct);
router.delete("/:idOrSlug", Auth, isAdmin, controlles.DeleteProduct);

module.exports = router;
