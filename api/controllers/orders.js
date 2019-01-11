const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            quantity: doc.quantity,
            product: doc.product,
            request: {
              type: 'GET',
              url: `http://localhost:3000/orders/${doc._id}`
            }
          }
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    })
}

exports.orders_create_order = (req, res, next) => {
  const { productId, quantity } = req.body;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: quantity,
        product: productId
      });

      return order.save();
    })
    .then(result => {
      console.log(result);

      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          quantity: result.quantity,
          product: result.product
        },
        request: {
          type: "GET",
          url: `http://localhost:3000/orders/${result._id}`
        }
      })
    })
    .catch(err => {
      console.log(err);

      res.status(500).json({
        error: err
      });
    });
}

exports.orders_get_order = (req, res, next) => {
  Order.findById(req.params.orderId)
    .select('product quantity _id')
    .populate('product', 'name price _id')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order Not Found"
        });
      }

      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: "http://localhost:3000/orders"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    })
}

exports.orders_delete_order = (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: 'POST',
          url: "http://localhost:3000/orders",
          body: {
            productId: "ObjectID",
            quantity: "Number"
          }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    })
}