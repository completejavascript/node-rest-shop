const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
  Product.find()
    .select("name price _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            request: {
              type: "GET",
              url: `http://localhost:3000/products/${doc._id}`
            }
          }
        })
      }

      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', (req, res, next) => {
  const { name, price } = req.body;

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name,
    price
  });

  product
    .save()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'Created a product',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result.id,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/${result._id}`
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .select("name price _id")
    .exec()
    .then(doc => {
      console.log("From database: ", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/`
          }
        });
      } else {
        res.status(404).json({
          message: "No valid entry found for provided ID"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Product.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Product updated",
        request: {
          type: "GET",
          url: `http://localhost:3000/products/${id}`
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;

  Product.deleteOne({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product deleted",
        request: {
          type: "POST",
          url: `http://localhost:3000/products`,
          body: { name: 'String', price: "Number"}
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;