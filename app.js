const express = require('express');
const router = require('./routers');
const app = express()
const session = require('express-session')
const port = 3000

app.use(express.urlencoded({ extended: true }));
app.use('/', express.static("public"))
app.use('/dashboard', express.static("public"))
app.use('/dashboard/company', express.static("public"))

app.set("view engine", "ejs");
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
//router
app.use('/', router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})