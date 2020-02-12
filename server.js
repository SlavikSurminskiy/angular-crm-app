const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;

const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const http = require('http').Server(app);
http.listen(PORT, () => {
  console.error(`Server listening on port ${PORT}`);
});

// connect to mongoDB
const DB_URL = process.env.MONGOBD_URL;
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('DB CONNECTED'));


const Users = require('./server/Schemas/User');

app.post('/api/registration', (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password
  } = req.body;

  Users.findOne({email}).then(userExist => {
    if(!userExist) {
      bcrypt.genSalt(10)
      .then((salt, err) => bcrypt.hash(password, salt))
      .then((hash, err) => {
        const user = new Users({ firstName, lastName, email, password: hash });
        return user.save();
      })
      .then((user, err) => {
        res.send({message: 'User was saved', isSaved: true});
      })
    } else {
      res.send({message: 'User with this email already saved', isSaved: false});
    }
  })
});

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader.split(' ')[1];
  if(token) {
    const secretKey = process.env.WEB_TOKEN_KEY;
    jwt.verify(token, secretKey, (err, data) => {
      if(err) {
        res.set('token-valid', false);
        res.sendStatus(401);
      } else {
        res.set('token-valid', true);
        next();
      }
    })
  } else {
    res.set('token-valid', false);
    res.sendStatus(401);
  }
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  Users.findOne({email}).then(user => {
    if(user) {
      bcrypt.compare(password, user.password)
      .then(isPasswordCorrect => {
        if(isPasswordCorrect) {
          const secretKey = process.env.WEB_TOKEN_KEY;
          jwt.sign({userEmail: user.email}, secretKey, { expiresIn: '1h' }, (err, token) => {
            res.send({
              loginSuccess: true,
              message: 'Login success',
              token,
              user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
              },
            })
          })
        } else {
          res.send({message: 'Wrong password, please try again', loginSuccess: false})
        }
      });
    } else {
      res.send({message: 'User with this email not found', loginSuccess: false})
    }
  })
})

app.get('/api/verifytoken', verifyToken, (req, res) => {
  res.sendStatus(201);
})
