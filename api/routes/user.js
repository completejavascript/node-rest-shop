const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
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
});

router.delete('/:userId', (req, res, next) => {
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
});

module.exports = router;