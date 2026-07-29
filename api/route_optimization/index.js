const db = require("../lib/db");

module.exports = async (req, res) => {

    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    try {

        const result = await db.query(
            "SELECT * FROM locations"
        );

        res.status(200).json(result.rows);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};