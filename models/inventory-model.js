const pool = require("../database/");

/* Get All Classification Data */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* Get All Inventory Items and Classification Name by Classification ID */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows;
    } catch(error) {
        console.error("getclassificationsbyid error " + error);
    }
}

async function getInventoryByInvId(inv_id) {
    try {
        const item = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inv_id]
        )
        return item.rows[0];
    } catch(error) {
        console.error("getinventorybyid error " + error);
    }
}

async function checkExistingClass (classification_name) {
    try {
        const sql = "SELECT * FROM classification WHERE classification_name = $1"
        const classification = await pool.query(sql, [classification_name]);
        return classification.rowCount;
    } catch (error) {
        return error.message;
    }
}

async function newClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
        return await pool.query(sql, [classification_name]);
    } catch (error) {
        return error.message;
    }
}

async function newInventory(inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id, inv_image, inv_thumbnail) {
    try {
        const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id, inv_image, inv_thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING inv_id";
        const dataArr = [inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id, inv_image, inv_thumbnail];
        return await pool.query(sql, dataArr);
    } catch (error) {
        return error.message;
    }
}

async function updateInventory(inv_id, inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id) {
    try {
        const sql = "UPDATE public.inventory SET inv_make=$1, inv_model=$2, inv_year=$3, inv_miles=$4, inv_price=$5, inv_color=$6, inv_description=$7, classification_id=$8 WHERE inv_id=$9 RETURNING *";
        const dataArr = [inv_make, inv_model, inv_year, inv_miles, inv_price, inv_color, inv_description, classification_id, inv_id];
        const data = await pool.query(sql, dataArr);
        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error);
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, checkExistingClass, newClassification, newInventory, updateInventory};