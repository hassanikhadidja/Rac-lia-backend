const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const review = require("../controlles/reviewController");

router.get("/published", review.getPublishedReviews);
router.get("/pending", Auth, isAdmin, review.getPendingReviews);
router.get("/", Auth, isAdmin, review.getAllReviews);
router.post("/", upload.single("photo"), review.addReview);
router.patch("/:id/publish", Auth, isAdmin, review.publishReview);
router.patch("/:id", Auth, isAdmin, upload.single("photo"), review.updateReview);
router.delete("/:id", Auth, isAdmin, review.deleteReview);

module.exports = router;
