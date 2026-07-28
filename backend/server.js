const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Route Optimization is running");
});

/**
 * AMBIL SEMUA LOKASI
 */
app.get("/route_optimization", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM locations"
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * UPDATE STATUS PAKET
 */
app.put("/route_optimization/:id/status", async (req, res) => {

  try {

    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      "UPDATE locations SET status=$1 WHERE id=$2",
      [status, id]
    );

    res.json({
      success: true,
      message: "Status berhasil diupdate"
    });

  } catch (err) {

    res.status(500).json(err);

  }

});

/**
 * SIMPAN HISTORY
 */
app.post("/route_history", async (req, res) => {

  try {

    const {
      total_titik,
      total_jarak
    } = req.body;

    await db.query(
      `
      INSERT INTO route_history
      (
        total_titik,
        total_jarak
      )
      VALUES ($1,$2)
      `,
      [
        total_titik,
        total_jarak
      ]
    );

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json(err);

  }

});

/**
 * LIHAT HISTORY
 */
app.get("/route_history", async (req, res) => {

  try {

    const result = await db.query(
      `
      SELECT *
      FROM route_history
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (err) {

    res.status(500).json(err);

  }

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});