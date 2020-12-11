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

const productsPhotoFilePath = path.join(
  __dirname,
  "../../../public/img/products"
);

router.get("/:id", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath);
    const product = productsDB.filter(
      (product) => product.ID === req.params.id
    );
    if (product.length > 0) {
      res.send(product);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const productsDB = await readDB(productsFilePath);
    if (req.query && req.query.name) {
      const filteredProducts = productsDB.filter(
        (product) =>
          product.hasOwnProperty("name") &&
          product.name.toLowerCase() === req.query.name.toLowerCase()
      );
      res.send(filteredProducts);
    } else {
      res.send(productsDB);
    }
  } catch (error) {
    next(error);
  }
});
router.post(
  "/",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("short name")
      .exists()
      .withMessage("Insert a name please!"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const productsDB = await readDB(productsFilePath);
        const newProduct = {
          ...req.body,
          ID: uniqid(),
          modifiedAt: new Date(),
        };

        productsDB.push(newProduct);

        await writeDB(productsFilePath, productsDB);

        res.status(201).send({ id: newProduct.ID });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const productsDB = readDB(productsFilePath);
    const newDb = productsDB.filter((user) => user.ID !== req.params.id);
    await writeDB(productsFilePath, newDb);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const productsDB = readFile("projects.json");
    const newDb = productsDB.filter((project) => project.ID !== req.params.id);

    const modifiedProduct = {
      ...req.body,
      ID: req.params.id,
      modifiedAt: new Date(),
    };

    newDb.push(modifiedProduct);
    await writeDB(productsFilePath, newDb);

    res.send({ id: modifiedProduct.ID });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// "_id": "5d318e1a8541744830bef139", //SERVER GENERATED
//     "name": "app test 1",  //REQUIRED
//     "description": "somthing longer", //REQUIRED
//     "brand": "nokia", //REQUIRED
//     "imageUrl": "https://drop.ndtv.com/TECH/product_database/images/2152017124957PM_635_nokia_3310.jpeg?downsize=*:420&output-quality=80",
//     "price": 100, //REQUIRED
//     "category": "smartphones"
//     "createdAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
//     "updatedAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
