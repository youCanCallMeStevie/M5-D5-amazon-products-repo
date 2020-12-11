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

// "_id": "123455", //SERVER GENERATED
// "comment": "A good book but definitely I don't like many parts of the plot", //REQUIRED
// "rate": 3, //REQUIRED, max 5
// "elementId": "5d318e1a8541744830bef139", //REQUIRED
// "createdAt": "2019-08-01T12:46:45.895Z" // SERVER GENERATED

module.exports = router;
