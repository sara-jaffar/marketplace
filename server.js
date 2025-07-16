const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session')
const MongoStore = require('connect-mongo')
const authController = require("./controllers/auth.js");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");


// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

// MIDDLEWARE 
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    })
  })
);
app.use(passUserToView);


// ROUTES 
app.use("/auth", authController);

app.get("/vip-lounge", isSignedIn, (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`);
});

app.get('/', async (req, res) => {
    res.render('index.ejs', { title: 'My App',  user: req.session.user})
})



const port = process.env.PORT? process.env.PORT : "3000";

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})