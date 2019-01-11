const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
  const { email, password } = req.body;

  User.find({ email })
    .exec()
    .then(users => {
      if (users.length > 0) {
        return res.status(409).json({
          message: "Mail exists"
        });
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        }

        const user = new User({
          _id: mongoose.Types.ObjectId(),
          email,
          password: hash
        });

        user
          .save()
          .then(result => {
            console.log(result);
            res.status(201).json({
              message: 'User created'
            });
          })
          .catch(err => {
            res.status(500).json({
              error: err
            });
          });
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
}

exports.user_login = (req, res, next) => {
  const { email, password } = req.body;

  User
    .find({ email })
    .exec()
    .then(users => {
      if (users.length < 1) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }

      bcrypt.compare(password, users[0].password, function (err, result) {
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          });
        }

        if (result) {
          const token = jwt.sign({
            email: users[0].email,
            userId: users[0]._id
          },
            process.env.JWT_KEY,
            {
              expiresIn: '1h'
            }
          );

          return res.status(200).json({
            message: 'Auth successful',
            token
          });
        }

        return res.status(401).json({
          message: 'Auth failed'
        });
      });
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      })
    })
}

exports.user_delete = (req, res, next) => {
  User
    .remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    }).catch(err => {
      res.status(500).json({
        error: err
      });
    })
}