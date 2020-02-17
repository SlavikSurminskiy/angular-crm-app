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
  useUnifiedTopology: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('DB CONNECTED'));


const Users = require('./server/Schemas/User');
const Category = require('./server/Schemas/Category');

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
  res.status(201);
  res.send();
})

app.post('/api/createCategory', verifyToken, (req, res) => {
  const { name, limit } = req.body;

  Category.findOne({name}).then(categoryExist => {
    if(!categoryExist) {
      const category = new Category({ name, limit });
      category.save().then((savedCategory) => {
        res.send({
          message: 'Category was saved',
          isSaved: true,
          savedCategory: savedCategory.toObject({versionKey: false})
        });
      });
    } else {
      res.send({message: 'Category already exist', isSaved: false});
    }
  })
})

app.get('/api/categories', verifyToken, (req, res) => {
  Category.find({}).select('-__v').then(categories => {
    res.send(categories);
  })
})

app.post('/api/updateCategory', verifyToken, async (req, res) => {
  const { name, limit, selectedCategory: id } = req.body;
  Category.findOne({name, _id: {$ne: id}}).then(categoryExist => {
    if(categoryExist) {
      res.send({
        message: 'Category with this name already exist',
        isUpdated: false,
      })
    } else {
      Category.findByIdAndUpdate(id, {name, limit}, {new: true}).then(updatedCategory => {
        res.send({
          message: 'Category was updated',
          isUpdated: true,
          updatedCategory: updatedCategory.toObject({versionKey: false})
        })
      })
    }
  });

})
