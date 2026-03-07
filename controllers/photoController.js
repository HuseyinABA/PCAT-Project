const Photo = require('../models/Photo');
const fs = require('fs');

exports.getAllPhotos = async (req, res) => {
  // Sayfalama (Pagination) Ayarları
  const page = req.query.page || 1; // Eğer URL'de sayfa yoksa varsayılan olarak 1. sayfayı aç
  const photosPerPage = 3; // Her sayfada kaç fotoğraf gösterileceğini belirliyoruz (Temaya uygun olması için 3 ideal)

  // Veritabanındaki toplam fotoğraf sayısını buluyoruz
  const totalPhotos = await Photo.find().countDocuments();

  // Fotoğrafları sayfa numarasına göre atlayarak (skip) ve sınırlayarak (limit) çekiyoruz
  const photos = await Photo.find({})
    .sort('-dateCreated')
    .skip((page - 1) * photosPerPage)
    .limit(photosPerPage);

  // Verileri index.ejs'ye gönderiyoruz
  res.render('index', {
    photos: photos,
    current: page,
    pages: Math.ceil(totalPhotos / photosPerPage) // Toplam sayfa sayısını yukarı yuvarlayarak buluyoruz
  });
};

exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', {
    photo
  });
};

exports.createPhoto = async (req, res) => {
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadedImage = req.files.image;
  let uploadPath = __dirname + '/../public/uploads/' + uploadedImage.name;

  uploadedImage.mv(uploadPath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadedImage.name,
    });
    res.redirect('/');
  });
};

exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  res.redirect(`/photos/${req.params.id}`);
};

exports.deletePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  let deletedImage = __dirname + '/../public' + photo.image;
  if (fs.existsSync(deletedImage)) {
    fs.unlinkSync(deletedImage);
  }
  await Photo.findByIdAndDelete(req.params.id);
  res.redirect('/');
};