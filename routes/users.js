const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const {    
    getAllUsers,
    getUserDetails,
    create,
    createNewUser,
    updateUser,
    deleteUser,
    } = require('../controllers/userController')

router.get("/", ensureAuthenticated, getAllUsers );

router.post("/", ensureAuthenticated, createNewUser);

router.get("/add", ensureAuthenticated, create);

router.post("/update/:id", ensureAuthenticated, updateUser);

router.post("/delete/:id", ensureAuthenticated, deleteUser);

router.get("/:id", ensureAuthenticated, getUserDetails);

module.exports = router;