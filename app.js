const express = require('express');
const mongoose = require("mongoose");
const ejs = require('ejs');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const Photo = require('./models/Photo');

const app = express();

// connect DB
mongoose.connect("mongodb://127.0.0.1:27017/pcat-test-db");

//TEMPLATE ENGINE
app.set("view engine", "ejs");

// MIDDLEWARES
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(fileUpload());

//ROUTES
app.get('/', async (req, res) => {
  // Fotoğrafları tarihe göre azalan şekilde sıralıyoruz
  const photos = await Photo.find({}).sort('-dateCreated');
  res.render('index', {
    photos
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.get("/photos/:id", async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render("photo", {
    photo
  });
});

app.post("/photos", async (req, res) => {
  // Yüklenen dosyaların kaydedileceği klasör
  const uploadDir = 'public/uploads';

  // Eğer uploads klasörü yoksa oluştur
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Yüklenen dosyayı al ve yolunu belirle
  let uploadedImage = req.files.image;
  let uploadPath = __dirname + '/public/uploads/' + uploadedImage.name;

  // Dosyayı ilgili yola taşı ve ardından veritabanına kaydet
  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadedImage.name,
    });
    res.redirect('/');
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı...`);
});