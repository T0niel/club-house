const { body, validationResult } = require('express-validator');

const getSingupPage = (req, res) => {
  res.render('signup');
};

const postSignUpPage = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('signup', { errors: errors.array() });
    return;
  }

  res.redirect('/');
};

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

module.exports = {
  getSingupPage,
  postSignUpPage: [signUpFormSchema, postSignUpPage]
};
