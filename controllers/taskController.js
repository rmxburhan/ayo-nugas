const Task = require("../models/taskModel");
const User = require("../models/userModel");

const getAllTask = async (req,res) => {
    let tasks;
    if (req.user.isadmin == 1) {
      tasks = await Task.find({}).sort({ createdAt: "desc" })
    } else {
      tasks = await Task.find({user: req.user.id}).sort({ createdAt: "desc" })
    }
    res.render('tasks/index', {
      title: "Tasks list",
      tasks: tasks,
      message: '',
      user: {
        name: req.user.name,
        isadmin: req.user.isadmin
      }
    })
}

const createTask = async (req, res) => {
    let user;
    let dateNow = new Date().toISOString().split('T')[0]
    // Validate date 

    if (req.body.date < dateNow) {
        res.redirect('/tasks/add')
        return
    }
    
    if (req.body.isadmin == 1) {
      user = req.body.user
    } else {
      user = req.user._id
    }

    const task = await Task.create(
      {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        user: user,
      },
      async (err) => {
        if (err) {
          const users = await User.find({})
  
          res.render("tasks/add_task", {
            title: "Add new task",
            task: {
                title: req.body.title,
                description: req.body.description,
                date: req.body.date
            },
            message: {
                type: "danger",
                message: err.message
            },
            users: users,
            user: {
                name: req.user.name,
                isAdmin: req.user.isAdmin
            }
          })
        } else {
          req.session.message = {
            type: "success",
            message: "Task added successfully",
          };
          res.redirect("/tasks");
        }
      }
    );      
}

const getTaskForm = async (req,res) => {
    const users = await User.find();

    res.render("tasks/add_task", {
      title: "Add new task",
      task: new Task(),
      users: users,
      message: '',
      user: {
        name: req.user.name,
        isadmin: req.user.isadmin
      }
    });
}

const deleteTask = async (req,res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      res.session.message = {
          type: "danger",
          message: "Task gagal dihapus"
      }
      res.redirect('/tasks')
    } else {
      req.session.message = {
          type: "success",
          message: "Task berhasil dihapus"
      }
      res.redirect("/tasks");
    }
}

const updateTask = async (req,res) => {  
    const id = req.params.id
    if (req.user.isadmin == 0) {
      if (id != req.user.id) {
        return
      }
    }
    const taskUpdating = await Task.findByIdAndUpdate(id, {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      user: req.body.user
    }, (err) => {
      if (err) {
        res.render('tasks/edit_task', {
          title: "Edit task",
          task: {
            title: req.body.title,
            description: req.body.description,
          },
          message: {
            type: "danger",
            message: err.message
          },
          users: async() => {
            await User.find()
          },
          user: {
              name: req.user.name,
              isAdmin: req.user.isAdmin
          }
        })
      } else {
        req.session.message = {
          type: "success",
          message: "Task berhasil diupdate"
        }
        res.redirect('/tasks')
      }
    })
}

const updateStatusTask = async (req, res) => {
    const id = req.params.id
    let dateNow = new Date().toISOString().split('T')[0]
    const getTaskDate = await Task.findOne({_id: id})
    if (getTaskDate.date.toISOString().split('T')[0] != dateNow) {
        res.redirect('/dashboard')
        return
    }

    const updateStatus = await Task.findByIdAndUpdate(id, {
      status: 1
    })
    if (updateStatus) {
      req.session.message = {
        type: "success",
        message: "Status berhasil diubah"
      }
      res.redirect('/dashboard')
    } else {
      req.session.message = {
        type: "danger",
        message: "Error!"
      }
      res.redirect('/dashboard')
    }
}

const reactiveTask = async (req,res) => {
    const id = req.params.id
    let dateNow = new Date().toISOString().split('T')[0]

    const getTaskDate = await Task.findById(id)
    
    if (getTaskDate.date.toISOString().split('T')[0] != dateNow) {
        res.redirect('/dashboard')
        return
    }
    
    const updateStatus = await Task.findByIdAndUpdate(id, {
      status: 0
    })
    if (updateStatus) {
      res.redirect('/dashboard') 
    }   
}

const getTaskDetail = async (req,res) => {
    let id = req.params.id;
    Task.findById(id, async(err, task) => {
      if (err) {
        res.redirect("/");
      } else {
        if (task == null) {
          res.redirect("/");
        } else {
          const users = await User.find()
          res.render("tasks/edit_task", {
            title: "Edit task",
            task: task,
            users:users,
            user: {
              name: req.user.name,
              isadmin: req.user.isadmin
            },
            message: ''
          });
        }
      }
    });
}

module.exports = {
    getAllTask,
    createTask,
    getTaskForm,
    deleteTask,
    updateTask,
    updateStatusTask,
    reactiveTask,
    getTaskDetail,
}