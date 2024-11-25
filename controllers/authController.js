const { body, validationResult } = require('express-validator');
const {
  insertUser,
  userExists,
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

      const exists = await userExists(email);
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
    } catch (error) {
      next(error);
    }
  },
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
  }),
];

const postLogin = (req, res, next) => {
  passport.authenticate('local', async (err, user) => {
    try {
      if (err) {
        res.render('login', {
          errors: [{ msg: 'An error happened while login you in' }],
        });
        return;
      }

      if (!user) {
        res.render('login', {
          errors: [{ msg: 'Incorrect email or password' }],
        });
        return;
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
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
          return done(null, false);
        }

        const match = await compareAsync(password, user.password);
        if (!match) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

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
