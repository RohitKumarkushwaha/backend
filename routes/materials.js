const express = require("express");
const router = express.Router();
const Material = require("../models/Material");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Utility function to parse colors
const parseColors = (colors) => {
  if (Array.isArray(colors)) {
    return colors;
  } else if (typeof colors === "string") {
    return colors.split(",").map((color) => color.trim());
  }
  return [];
};

// GET all materials (excluding image data)
router.get("/", async (req, res) => {
  try {
    const materials = await Material.find().select("-imageUrl");
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific material by ID (including image data)
router.get("/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new material (with image upload or image URL)
router.post("/", upload.single("image"), async (req, res) => {
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.imageUrl;

  const material = new Material({
    name: req.body.name,
    technology: req.body.technology,
    colors: parseColors(req.body.colors),
    pricePerGram: req.body.pricePerGram,
    imageUrl: imageUrl,
  });

  try {
    const newMaterial = await material.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a material's details (with optional image update)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });

    material.name = req.body.name || material.name;
    material.technology = req.body.technology || material.technology;
    material.colors = req.body.colors
      ? parseColors(req.body.colors)
      : material.colors;
    material.pricePerGram = req.body.pricePerGram || material.pricePerGram;
    material.imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl || material.imageUrl;

    const updatedMaterial = await material.save();
    res.json(updatedMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a material by ID
router.delete("/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });

    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
