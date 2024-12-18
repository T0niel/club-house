const { body, validationResult } = require('express-validator');
const {
  insertUser,
  findUser,
  findUserById,
} = require('../db/queries/userQueries');
const bcrypt = require('bcryptjs');
const util = require('util');
const passport = require('passport');
const {
  getClubByName,
  insertClubMember,
} = require('../db/queries/clubQueries');
const LocalStrategy = require('passport-local').Strategy;

const hashAsync = util.promisify(bcrypt.hash);
const compareAsync = util.promisify(bcrypt.compare);

//Sign up logic starts here
const getSingupPage = (req, res) => {
  res.render('signup');
};

const postSignUpPage = [
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('signup', { errors: errors.array() });
        return;
      }

      const { first_name, last_name, email, password } = req.body;

      const exists = await findUser(email);
      if (exists) {
        res.render('signup', {
          errors: [{ msg: 'User with this email exists' }],
        });
        return;
      }

      const hashedPassword = await hashAsync(password, 10);

      const result = await insertUser(
        first_name,
        last_name,
        email,
        hashedPassword,
        2
      );
      const generalClub = await getClubByName('general');
      if (generalClub) {
        await insertClubMember(generalClub.id, result.id);
      }
      next();
    } catch (e) {
      next(e);
    }
  },
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
  }),
];

const signUpFormSchema = [
  body('email')
    .notEmpty()
    .withMessage('Email must be provided')
    .isEmail()
    .withMessage('Email is not valid'),
  body('first_name')
    .notEmpty()
    .withMessage('First name must be provided')
    .isAlpha()
    .withMessage('First name must contain characters only')
    .isLength({ min: 3 })
    .withMessage('First name must be at least 3 characters')
    .isLength({ max: 20 })
    .withMessage('First name must be at maxiumum of 20 characters'),
  body('last_name')
    .notEmpty()
    .withMessage('Last name must be provided')
    .isAlpha()
    .withMessage('Last name must contain characters only')
    .isLength({ min: 3 })
    .withMessage('Last name must be at least 3 characters')
    .isLength({ max: 20 })
    .withMessage('Last name must be at maxiumum of 20 characters'),
  body('password')
    .notEmpty()
    .withMessage('password not provided')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.confirm_password) {
        throw new Error('Confirm Password does not match Password');
      }
      return true;
    }),
  body('confirm_password')
    .notEmpty()
    .withMessage('confirm password not provided'),
];

//Login logic starts here

const postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, options) => {
    if (err) {
      res.render('login', {
        errors: [{ msg: 'An error happened while login you in' }],
      });
      return;
    }

    if (!user) {
      res.render('login', { errors: [{ msg: options.message }] });
      return;
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err); // Handle any error during the login process
      }
      return res.redirect('/'); // Redirect to the home page on success
    });
  })(req, res, next);
};

const getLoginPage = (req, res) => {
  res.render('login');
};

passport.use(
  new LocalStrategy(
    {
      passwordField: 'password',
      usernameField: 'email',
    },
    async (email, password, done) => {
      try {
        const user = await findUser(email);

        if (!user) {
          done(false, null, {message: 'Incorrect email or password'});
          return;
        }

        if(user.user_status_id == 2){
          done(false, null, {message: 'User banned'});
          return;
        }

        const match = await compareAsync(password, user.password);
        if (!match) {
          done(false, null, { message: 'Incorrect email or password' });
          return;
        }

        done(false, user);
      } catch (e) {
        done(e);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(false, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    done(false, user);
  } catch (e) {
    done(e);
  }
});

//logout logic

const postLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
};

module.exports = {
  getSingupPage,
  postSignUp: [signUpFormSchema, postSignUpPage],
  postLogin,
  getLoginPage,
  postLogout,
};
