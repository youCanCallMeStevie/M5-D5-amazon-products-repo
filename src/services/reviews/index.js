const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const multer = require("multer");
// const { writeFile, createReadStream } = require("fs-extra");
const { check, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../../lib/utilities");
const upload = multer({});



const reviewFilePath = path.join(__dirname, "reviews.json");
const reviewAsString = fs.readFileSync(reviewFilePath).toString();
const reviewsArray = JSON.parse(reviewAsString);

const productsFilePath = path.join(__dirname, "../products/products.json");


// "_id": "123455", //SERVER GENERATED
// "comment": "A good book but definitely I don't like many parts of the plot", //REQUIRED
// "rate": 3, //REQUIRED, max 5
// "elementId": "5d318e1a8541744830bef139", //REQUIRED
// "createdAt": "2019-08-01T12:46:45.895Z" // SERVER GENERATED



//1. Get All reviews
router.get("/", async (req, res, next) => {
  try {
    let reviewsDB = await readDB(reviewFilePath);
    console.log(req.query)
   
    if (Object.keys(req.query).length>0  ) {
        console.log('here')
        for(key in req.query) {
            reviewsDB = reviewsDB.filter(review => review[key].toString()===req.query[key].toString())
            console.log(reviewsDB)
        }
      res.send(reviewsDB);
    } else {
      res.send(reviewsDB);
    }
  } catch (error) {
    next(error);
  }
});

//2. Get specific review
router.get("/:id", async (req, res, next) => {
  try {
    const reviews = await readDB(reviewFilePath);
    const review = reviews.filter(review => review._id === req.params.id);
    if (review.length > 0) {
      console.log(review);
      res.send(review);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

//adding a review

router.post(
  "/",
  [
    check("comment")
      .isLength({ min: 5 })
      .withMessage("Your review must be longer than 5 characters")
      .exists()
      .withMessage("What did you think of the product?"),
    check("rate")
      .isInt()
      .exists()
      .withMessage("Give it a star rating from 1 to 5"),
    check("elementId").exists().withMessage("Product id you are reviewing"),
  ],

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const productsDB = await readDB(productsFilePath);
      const exists = productsDB.find(
        product => product._id === req.body.elementId
      );
      console.log(exists, errors)
      if (errors.isEmpty()) {
        if (exists) {
        const reviewDB = await readDB(reviewFilePath)
          const newReview = {
            ...req.body,
            createdAt: new Date(),
            _id: uniqid(),
          };
          reviewDB.push(newReview);
          writeDB(reviewFilePath, reviewDB);
          res.status(201).send(newReview);
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//editing a review

router.put("/:id", async (req, res, next) => {
  try {
    const reviewsDB = await readDB(reviewFilePath);

    const updatedReview = reviewsDB.map(review =>
              review._id === req.params.id
                ? { ...review,...req.body, elementId: review.elementId, modifiedAt: new Date() }
                : review
            );
    await writeDB(reviewFilePath, updatedReview);

    res.send(updatedReview);
  } catch (error) {
    next(error);
  }
});

//deleting a review

router.delete("/:id", async (req, res, next) => {
  try {
    const reviews = await readDB(reviewFilePath);
    const filteredReviews = reviews.filter(
      review => review._id !== req.params.id
    );
    await writeDB(reviewFilePath, filteredReviews);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


module.exports = router;
