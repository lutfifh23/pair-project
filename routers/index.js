const express = require('express')
const Controller = require('../controllers/controller')
const router = express.Router()

const isLoggedIn = function (req, res, next) {
    if (!req.session.userId) {
        const error = "You need to be logged in"
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
}
const isAdmin = function (req, res, next) {
    if (req.session.role !== "admin") {
        const error = "You need to be admin to access this page"
        res.redirect(`/?error=${error}`)
    } else {
        next()
    }
}

router.get('/', Controller.showLandingPage)
router.get('/register', Controller.showRegisterForm)
router.post('/register', Controller.postRegisterForm)
router.get('/login', Controller.showLoginForm)
router.post('/login', Controller.postLoginForm)
router.get('/otp', Controller.showOtpForm)
router.post('/otp', Controller.postOtpForm)
router.get('/logout', Controller.logoutUser)

router.post('/company/:id/interact', Controller.buySellCompany)
router.get('/dashboard/company/:id', isLoggedIn, Controller.companyDetail)
router.get('/dashboard/profile', Controller.showProfile)
router.get('/dashboard', isLoggedIn, Controller.showDashboard)
router.get('/dashboardAdmin', isLoggedIn, Controller.showDashboardAdmin)
router.get('/company/delete/:id', isLoggedIn, Controller.deleteCompany)

module.exports = router