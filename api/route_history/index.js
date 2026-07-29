const db = require("../lib/db");

module.exports = async (req, res) => {

    try {

        if (req.method === "GET") {

            const result = await db.query(
                `
                SELECT *
                FROM route_history
                ORDER BY created_at DESC
                `
            );

            return res.json(result.rows);

        }

        if (req.method === "POST") {

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

            return res.json({
                success: true
            });

        }

        res.status(405).json({
            message: "Method not allowed"
        });

    } catch (err) {

    console.error(err);

    return res.status(500).json({
        error: err.message,
        code: err.code,
        detail: err.detail,
        hint: err.hint
    });

}

};