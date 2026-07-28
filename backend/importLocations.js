require("dotenv").config();

const XLSX = require("xlsx");
const { Pool } = require("pg");

const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function importExcel() {

  const workbook = XLSX.readFile("data_pengiriman.xlsx");

  for (const sheetName of workbook.SheetNames) {

    console.log(`Import ${sheetName}`);

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {

      await db.query(
        `
        INSERT INTO locations
        (
          nama,
          desa,
          rt,
          rw,
          latitude,
          longitude,
          status
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7
        )
        `,
        [
          row.nama,
          row.desa || sheetName,
          row.rt,
          row.rw,
          row.latitude,
          row.longitude,
          "belum"
        ]
      );

    }

  }

  console.log("Import selesai");

  await db.end();

}

importExcel().catch(console.error);