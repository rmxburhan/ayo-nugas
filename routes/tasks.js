const express = require("express");
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth')
const {
  getAllTask,
  createTask,
  getTaskForm,
  deleteTask,
  updateTask,
  updateStatusTask,
  reactiveTask,
  getTaskDetail,
} = require('../controllers/taskController')

router.get("/", ensureAuthenticated, getAllTask );

router.post("/", ensureAuthenticated, createTask);

router.get("/add", ensureAuthenticated, getTaskForm);

router.post('/delete/:id', ensureAuthenticated, deleteTask)

router.post('/update/status/:id', ensureAuthenticated, updateStatusTask)

router.post('/update/:id', ensureAuthenticated,updateTask)

router.post('/reactive/status/:id', ensureAuthenticated, reactiveTask)

router.get('/:id', ensureAuthenticated, getTaskDetail)

module.exports = router;
