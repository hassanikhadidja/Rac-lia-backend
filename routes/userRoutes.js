const express = require('express');
const router = express.Router();
const usercontrolles=require("../controlles/usercontrolles");
const { Auth } = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');

router.post("/register",usercontrolles.Adduser)
router.post("/login",usercontrolles.Login)

router.get("/getcurrentuser", Auth, usercontrolles.getUser);
router.patch("/me", Auth, usercontrolles.updateMyProfile);

router.get("/", Auth, isAdmin, usercontrolles.getUsers);

router.patch("/:id",Auth,usercontrolles.UpdateUSER)


module.exports=router