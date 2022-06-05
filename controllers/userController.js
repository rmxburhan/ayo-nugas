const User = require("../models/userModel");
const Task = require("../models/taskModel");
const passport = require("passport");
const bcrypt = require("bcryptjs");
// Method   GET
// route    /users
const getAllUsers = (req,res) => {
    if (req.user.isadmin == 0) {return res.send('acces denied')}
    User.find({})
      .sort({ createdAt: "desc" })
      .exec(function (err, list_users) {
        if (err) {
          res.json({ message: err.message, type: "danger" });
        } else {
          res.render("users/index", {
            title: "Users list",
            user_list: list_users,
            message: "",
            user: {
              name: req.user.name,
              isadmin: req.user.isadmin,
            },
          });
        }
      });
}

// Method   GET
// route    /users/:id
const getUserDetails = (req,res) => {
  if (req.user.isadmin == 0) {return res.send('acces denied')}

  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) {
      res.redirect("/dashboard");
    } else {
      if (user == null) {
        res.redirect("/dashboard");
      } else {
        res.render("users/edit_user", {
          title: "Edit user",
          userDetails: user,
          message: "",
          user: {
            name: req.user.name,
            isadmin: req.user.isadmin
          }
        });
      }
    }
  });
}

// Method   GET
// route    /users/add
const create = (req,res) => {
    if (req.user.isadmin == 0) {return res.send('acces denied')}

    res.render("users/add_user", {
      title: "Add new user",
      userDetails: new User(),
      message: "",
      user: {
        name: req.user.name,
        isadmin: req.user.isadmin
      },
    });
}

// Method   POST
// route    /users
const createNewUser = async (req,res) => {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        isadmin: req.body.level,
    });

    // Cek user exist
    const usernameExist = await User.findOne({ username: req.body.username });

    if (usernameExist) {
        res.render(`users/add_user`, {
        title: "Add new user",
        userDetails: user,
        message: {
            type: "danger",
            message: "Username exist",
        },
        });
    }

    // Simpan user
    await user.save((err) => {
        if (err) {
        res.render("users/add_user", {
            title: "Add user",
            userDetails: user,
            message: {
            message: err.message,
            type: "danger",
            },
        });
        } else {
        req.session.message = {
            type: "success",
            message: "User added successfully",
        };
        res.redirect("/users");
        }
    });
}

// Method   post
// route    /users/:id
const updateUser = async (req,res) => {
    const id = req.params.id;

    if (req.body.password != "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
      const updateUser = await User.findByIdAndUpdate(id, {
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        isadmin: req.body.level,
      });
  
      if (updateUser) {
        req.session.message = {
          type: "success",
          message: "User updated successfully",
        };
        res.redirect("/users");
      } else {
        req.session.message = {
          type: "danger",
          message: "Fail",
        };
        res.redirect(`users/${id}`);
      }
    } else {
      const updateUser = await User.findByIdAndUpdate(id, {
        name: req.body.name,
        username: req.body.username,
        isadmin: req.body.level,
      });
  
      if (updateUser) {
        req.session.message = {
          type: "success",
          message: "User updated successfully",
        };
        res.redirect("/users");
      } else {
        req.session.message = {
          type: "success",
          message: "Fail",
        };
        res.redirect(`users/${id}`);
      }
    }
}

// Method   DELETE
// route    /users/:id
const deleteUser = async (req,res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.session.message = {
        type: "danger",
        message: "Gagal menghapus user",
      };
      res.redirect("/users");
    } else {
      await Task.deleteMany({ user: user._id });
  
      req.session.message = {
        type: "success",
        message: "User berhasil dihapus",
      };
      res.redirect("/users");
    }
}

// Method   GET
// route    /login
const login = (req,res) => {
    res.render('login')
}

// Method   POST
// route    /login
const proccessLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
      })(req, res, next);
}

// Method   GET
// route    /logout
const proccessLogout = (req,res) => {
    req.logout(function(err) {
        if (err) {
            return next(err)
        }
    });
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
}

const setupFirstUser = async (req, res) => {
  const user = await User.findOne({ username: "admin" });
  if (user) {
    res.redirect("/dashboard");
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    await User.create({
      name: "admin",
      username: "admin",
      password: hashedPassword,
      isadmin: 1,
    });
    res.redirect("/dashboard");
  }
}

module.exports = {
    getAllUsers,
    getUserDetails,
    create,
    createNewUser,
    updateUser,
    deleteUser,
    login,
    proccessLogin,
    proccessLogout,
    setupFirstUser,
}