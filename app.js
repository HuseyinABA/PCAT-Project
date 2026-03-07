const express = require('express');
const mongoose = require("mongoose");
const ejs = require('ejs');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override'); // Yeni paketimiz
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
// method-override middleware'i (Formlardaki ?_method parametresini yakalar)
app.use(methodOverride('_method', {
  methods: ['POST', 'GET']
}));

//ROUTES
app.get('/', async (req, res) => {
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
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadedImage = req.files.image;
  let uploadPath = __dirname + '/public/uploads/' + uploadedImage.name;

  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadedImage.name,
    });
    res.redirect('/');
  });
});

// Güncelleme Sayfasını Gösterme Rotası
app.get('/photos/edit/:id', async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  res.render('edit', {
    photo
  });
});

// Güncelleme İşlemini Gerçekleştirme Rotası (PUT)
app.put('/photos/:id', async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  res.redirect(`/photos/${req.params.id}`);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı...`);
});