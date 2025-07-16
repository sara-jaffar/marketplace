const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

router.get("/", (req, res) => {
  res.send("do i work?");
});

// SIGN UP VIEW
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

// PST A NEWW USER ID TO THE DATABASE WHEN THE FORM IS SUBMITTED
router.post('/sign-up', async (req, res) => {

    console.log(req.body)
    const userInDatabase = await User.findOne({ username: req.body.username })
    if(userInDatabase) {
        return res.send('Username already taken.')
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Password and Confirm Password must match");
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;
    const user = await User.create(req.body);
    req.session.user = {
        username: user.username,
        _id: user._id,
    }
    req.session.save(() => {
        res.redirect('/');
    }) 
    
})

router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    console.log(userInDatabase)
    if (!userInDatabase) {
        return res.send("Login failed. Please try again.");
    }
    const vaildPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
    if(!vaildPassword) {
        return res.send('Login failed. please try again.')
    }
    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
    }
    req.session.save(() => {
        res.redirect('/');
    }) 
});

// SIGN OUT VIEW
router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})

module.exports = router;

