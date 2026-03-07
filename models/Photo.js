const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Şema (Schema) oluşturma
const PhotoSchema = new Schema({
  title: String,
  description: String,
  image: String,
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Modeli oluşturma
const Photo = mongoose.model("Photo", PhotoSchema);

// Modeli diğer dosyalarda (app.js gibi) kullanabilmek için dışa aktarma
module.exports = Photo;