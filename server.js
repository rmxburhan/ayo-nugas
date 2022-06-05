const express = require('express')
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')
const passport = require('passport')
const flash = require('connect-flash')
const port = process.env.PORT || 3000
const methodOverride = require('method-override')
const app = express()
const session = require('express-session')
const colors = require('colors')


// Connect to database
connectDB()

// Passport config
require('./config/passport')(passport)

// Set template engine
app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: true,
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Flash
app.use(flash())

app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
  })

const indexRouter = require('./routes/index')
const userRouter = require('./routes/users')
const taskRouter = require('./routes/tasks')

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/tasks', taskRouter)

app.listen(port, () => {
    console.log(`Server is running at port : ${port}`)
  })