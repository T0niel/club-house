require('dotenv').config();
const express = require('express');
const indexRouter = require('./routes/indexRouter');
const clubRouter = require('./routes/clubRouter');
const postRouter = require('./routes/postRouter');
const adminRouter = require('./routes/adminRouter');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db/pool');
const passport = require('passport');
const HttpError = require('./errors/httpError');
const isAuth = require('./middlewares/isAuth');
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: new pgSession({
      pool: pool,
      tableName: 'session',
    }),
  })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  const user = req.user;
  if(!user){
    next();
    return;
  }
  if (user.user_role_id == 1) {
    res.locals.isAdminUser = true;
    next();
    return;
  }

  res.locals.isAdminUser = false;
  next();
});

app.use('/', indexRouter);

app.use('/clubs', clubRouter);
app.use('/posts', postRouter);
app.use('/admin', adminRouter);

//Catch all route
app.use((req, res, next) => {
  next(new HttpError('Resource not found', 404));
});

app.use((err, req, res, next) => {
  //Error is not a httpError that is its a runtime error
  if (!err.httpCode) {
    err = new HttpError('Internal server error', 500);
  }

  res.render('error', { message: err.message, errorCode: err.httpCode });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (req, res) => {
  console.log(`Server live in port: ${PORT}`);
});
