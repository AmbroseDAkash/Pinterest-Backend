const express = require('express');
const router = express.Router();
const userModel = require('./users');
const postmodel = require('./post'); // Corrected the path
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const upload = require('./multer');
const { name } = require('ejs');

// Configure passport-local to use the user model for authentication
passport.use(new LocalStrategy(userModel.authenticate()));

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { nav: false });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { nav: false });
});

/* GET profile page. Requires authentication. */
router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")  
    res.render('profile', { user, nav: true });
  } catch (error) {
    next(error);
  }
});
/* posts show kre k liye*/

router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")  
    res.render('show', { user, nav: true });
  } catch (error) {
    next(error);
  }
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const user = await userModel
  .findOne({ username: req.session.passport.user })
  const posts = await postmodel.find()
  .populate("user")

  res.render("feed",{user,posts,nav:true});
});




/* GET add new post page. Requires authentication. */
router.get('/addnew', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    res.render('addnew', { user, nav: true });
  } catch (error) {
    next(error);
  }
});

/* POST create new post. Requires authentication. */
router.post('/createpost', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postmodel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});

/* POST file upload. Requires authentication. */
router.post('/fileupload', isLoggedIn, upload.single('image'), async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
});

/* Handle registration. */
router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name : req.body.name
  });

  userModel.register(data, req.body.password)
    .then(function(user) {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/profile');
      });
    })
    .catch(function(err) {
      res.render('register', { error: err.message });
    });
});

/* Handle login. */
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  successRedirect: '/profile'
}));

/* Handle logout. */
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

/* Middleware to check if user is logged in. */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
