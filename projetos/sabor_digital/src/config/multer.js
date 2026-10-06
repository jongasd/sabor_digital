const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../middlewares/appError");

// Garante que a pasta de uploads exista
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads", "produtos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Nome único para evitar colisões; extensão em minúsculo
    const sufixo = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, sufixo + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const permitidos = ["image/jpeg", "image/png", "image/jpg"];
  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Apenas imagens JPEG, JPG ou PNG são permitidas.", 400));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
