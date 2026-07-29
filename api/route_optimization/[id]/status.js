const db = require("../../lib/db");

module.exports = async (req, res) => {

    if (req.method !== "PUT") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }

    try {

        const { id } = req.query;

        const { status } = req.body;

        await db.query(
            "UPDATE locations SET status=$1 WHERE id=$2",
            [status, id]
        );

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};