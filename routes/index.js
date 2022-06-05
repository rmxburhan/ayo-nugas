const express = require("express");
const router = express.Router();
const Task = require("../models/taskModel");
const mongoose = require("mongoose");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const passport = require("passport");
const User = require("../models/userModel");
const {login,
  proccessLogin,
  proccessLogout,
  setupFirstUser} = require('../controllers/userController')

router.get('/', (req,res) => {
  res.redirect('/login')
})
  
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const userRole = req.user.isadmin;
  if (userRole == 1) {
    const jumlahUser = await User.find({}).count();
    const jumlahTask = await Task.find({}).count();

    // Mengambil data user yang baru ditambahkan
    const users = await User.find({}).sort({ createdAt: "desc" }).limit(5);
    // Mengambil data task yang baru ditambahkan
    const tasks = await Task.find({}).sort({ createdAt: "desc" }).limit(5);

    //
    res.render("dashboard-admin", {
      user: req.user,
      tasks: tasks,
      jumlah: { 
        jumlahUser: jumlahUser,
        jumlahTask: jumlahTask
      },
      users: users,
    });
  } else {
    const dateNow = new Date().toISOString().split("T")[0];
    const tasks = await Task.find({
      user: req.user.id,
      date: new Date(dateNow.toString()),
    }).sort({ createdAt: "desc" });
    const belum = await Task.find({
      user: req.user.id,
      date: new Date(dateNow.toString()),
      status: 0,
    }).count();
    const jumlah = await Task.find({
      user: req.user.id,
      date: new Date(dateNow.toString()),
    }).count();
    res.render("dashboard", {
      title: "Task hari ini",
      tasks: tasks,
      jumlah: {
        jumlah: jumlah,
        belum: belum,
      },
      user: {
        name: req.user.name,
      },
    });
  }
});

router.get('/login', forwardAuthenticated, login)

router.post('/login', forwardAuthenticated, proccessLogin)

router.get("/logout", ensureAuthenticated, proccessLogout);

router.get("/setup", setupFirstUser);


module.exports = router;
