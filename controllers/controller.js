const bcrypt = require('bcryptjs');
const axios = require('axios')
const { Account, Company, Investment, Profile, Wallet } = require('../models')
let { formatRupiah } = require('../helpers');
const { Op } = require('sequelize');

class Controller {
    static showLandingPage(req, res) {
        res.render('landingpagetest')
    }
    static showRegisterForm(req, res) {
        let { errors } = req.query
        res.render('register', { errors })
    }

    static showLoginForm(req, res) {
        let { message, message2 } = req.query
        res.render('login', { message, message2 })
    }

    static async postRegisterForm(req, res) {
        try {
            let { username, password, email, phoneNumber, name, address, confirmpassword } = req.body
            // console.log(username, password, email);
            let profilePicture = "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"

            let newAccount = await Account.create({ username, email, password, role: "user" });
            await Wallet.create({ AccountId: newAccount.id })
            await Profile.create({ name, phoneNumber, address, profilePicture, AccountId: newAccount.id })
            console.log(newAccount);
            let message = "Successfully registered, please login to continue."

            res.redirect(`/login?message=${message}`)
        } catch (error) {
            if (error.name === "SequelizeValidationError") {
                let errors = error.errors.map(err => err.message)
                res.redirect(`/register?errors=${errors}`)
            } else {
                res.send(error)

            }
        }
    }
    static async postLoginForm(req, res) {
        try {
            let { password, email } = req.body
            let dataUser = await Account.findAll({
                include: Profile,
                where: {
                    email: email
                }
            })
            if (dataUser.length === 0) {
                let message = "Wrong credentials"
                res.redirect(`/login?message2=${message}`)
                // res.send("Account not found")

            } else {
                // let hashed = dataUser[0].password
                // let result = Account.checkPassword(password, hashed)
                let result = dataUser[0].checkPassword(password)
                // console.log(dataUser[0]);
                if (result) {
                    // let newOTP = await Account.generateOTP(dataUser[0])
                    // axios.post('https://wisender.my.id/send-message', {
                    //     "api_key": "iIUJHciePwMhjiMZe6XzL4zbLJUi4nQl",
                    //     "sender": "6282120032073",
                    //     "number": `${dataUser[0].Profile.phoneNumber}`,
                    //     "message": `OTP code for ${dataUser[0].Profile.name}: ${newOTP}`
                    //   })
                    //   .then(function (response) {
                    //     // console.log(response);
                    //   })
                    //   .catch(function (error) {
                    //     console.log(error);
                    //   });
                    res.redirect(`/otp?id=${dataUser[0].id}`)

                } else {

                    let message = "Wrong credentials"
                    res.redirect(`/login?message2=${message}`)

                }
            }

            // res.redirect('/register')
        } catch (error) {
            res.send(error)
        }
    }

    static async showDashboard(req, res, next) {
        try {
            console.log(req.session);

            let dataUser = await Account.findByPk(req.session.userId, {
                include: [Profile, Wallet, Investment, Company]
            })
            let data = await Company.findAll()
            let totalInvestment = 0
            let jumlah = 0
            dataUser.Companies.forEach(perCompany => {
                jumlah = perCompany.price * perCompany.Investment.amount
                totalInvestment += jumlah
            })
            console.log(dataUser.Companies);
            res.render('dashboard', { data, dataUser, totalInvestment, formatRupiah })
        } catch (error) {
            res.send(error)
        }
    }
    static logoutUser(req, res) {
        try {
            req.session.destroy(function (err) {
                // res.send(req.session)
                res.redirect('/login')
            })
        } catch (error) {
            res.send(error)
        }
    }
    static async companyDetail(req, res) {
        try {
            let { id } = req.params
            let { userId } = req.session
            let { errors } = req.query
            let dataUser = await Account.findByPk(req.session.userId, {
                include: Profile
            })
            let companyData = await Company.findByPk(+id)
            let investmentData = await Investment.findOne({
                where: {
                    CompanyId: +id,
                    AccountId: +userId
                }
            })
            if (!investmentData) {
                investmentData = { amount: 0 }
            }
            // console.log(companyData);
            res.render('companyDetail', { dataUser, company: companyData, errors, investmentData, formatRupiah })
        } catch (error) {
            res.send(error)
        }
    }
    static showOtpForm(req, res) {
        try {
            let { id, message } = req.query
            res.render('otpForm', { id, message })
        } catch (error) {
            res.send(error)
        }
    }
    static async postOtpForm(req, res) {
        try {
            let { id, otp } = req.body
            let dataUser = await Account.findByPk(+id)
            console.log(dataUser, id, otp, '<< postOtpForm');
            let result = dataUser.checkOTP(otp)
            if (result) {
                req.session.userId = dataUser.id
                req.session.role = dataUser.role
                res.redirect('/')
            } else {
                let message = "OTP salah"
                res.redirect(`/otp?id=${id}&message=${message}`)
            }

        } catch (error) {
            res.send(error)
        }
    }
    static async buySellCompany(req, res) {
        try {
            console.log(req.body);
            let userId = req.session.userId
            let { share, companyId, option } = req.body
            let companyData = await Company.findByPk(+companyId)
            let userData = await Account.findByPk(+userId, {
                include: [Wallet, Investment]
            })

            if (option === "buy") {
                if (share * companyData.price > userData.Wallets[0].ballance) {
                    let message = "Not enough funds"
                    res.redirect(`/dashboard/company/${companyId}?errors=${message}`)
                } else {
                    console.log(userData.Investments);
                    let totalAmount = share * companyData.price
                    // console.log(totalAmount, userData.Wallets[0].ballance);
                    userData.Wallets[0].ballance = userData.Wallets[0].ballance - totalAmount
                    // console.log(userData.Wallets[0]);
                    await userData.Wallets[0].save()

                    if (userData.Investments.length === 0) {
                        await Investment.create({ CompanyId: +companyId, AccountId: +userId, amount: +share })
                    } else {
                        let found = false
                        let investmentFound
                        userData.Investments.forEach(perInvest => {
                            if (perInvest.CompanyId === +companyId && perInvest.AccountId === +userId) {
                                found = true
                                investmentFound = perInvest
                            }
                        })
                        if (found) {
                            share = +share
                            console.log(investmentFound.amount + share);
                            investmentFound.amount = investmentFound.amount + share
                            investmentFound.save()
                        } else {
                            await Investment.create({ CompanyId: +companyId, AccountId: +userId, amount: +share })
                        }
                        // console.log(investmentFound);
                    }

                    // await Investment.create({CompanyId: +companyId, AccountId: +userId, amount: +share})
                    let message = "Success buy"
                    res.redirect(`/dashboard/company/${companyId}?errors=${message}`)
                }

            } else if (option === "sell") {
                if (userData.Investments.length === 0) {
                    let message = "You don't have any investment"
                    res.redirect(`/dashboard/company/${companyId}?errors=${message}`)
                } else {
                    let found = false
                    let investmentFound
                    userData.Investments.forEach(perInvest => {
                        if (perInvest.CompanyId === +companyId && perInvest.AccountId === +userId) {
                            found = true
                            investmentFound = perInvest
                        }
                    })
                    if (!found) {
                        let message = "You don't have any investment"
                        res.redirect(`/dashboard/company/${companyId}?errors=${message}`)
                    } else {
                        if (investmentFound.amount < share) {
                            let message = "Insufficient amount of share(s)"
                            res.redirect(`/dashboard/company/${companyId}?errors=${message}`)
                        } else {
                            investmentFound.amount -= share
                            await investmentFound.save()
                            userData.Wallets[0].ballance += share * companyData.price
                            await userData.Wallets[0].save()
                            let message = "Successfully sold"
                            res.redirect(`/dashboard/company/${companyId}?errors=${message}`)
                        }
                    }

                }
            }

            // res.redirect('/dashboard/company')
        } catch (error) {
            console.log(error);
            res.send(error)
        }
    }
    static async showDashboardAdmin(req, res) {
        try {
            let userData = await findByPk(req.session.userId, {
                include: Profile
            })
            let data
            let { deleted, search } = req.query
            if (search) {
                data = await Company.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                })
            } else {
                data = await Company.findAll()
            }

            res.render('dashboardAdmin', { data, deleted, userData })
        } catch (error) {
            res.send(error)
        }
    }
    static async deleteCompany(req, res) {
        try {
            let { id } = req.params
            await Investment.destroy({
                where: {
                    CompanyId: +id
                }
            })
            let deletedCompany = await Company.findByPk(+id)
            let companyName = deletedCompany.name
            await deletedCompany.destroy()
            res.redirect(`/dashboardAdmin?deleted=${companyName}`)
        } catch (error) {
            res.send(error)
        }
    }
    static async showProfile(req, res) {
        res.render('profile')
    }
}

module.exports = Controller