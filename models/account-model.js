const pool = require('../database/');

/* ********************
* Register New Account
********************* */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    } catch (error) {
        return error.message;
    }
}

async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const emailResult = await pool.query(sql, [account_email]);
        return emailResult.rows[0];
    } catch (error) {
        return error.message;
    }
}


// Return Account Data Using Email Address
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching email found.");
    }
}

async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
            [account_id]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching ID found.");
    }
}

async function updateAccountInfo(account_firstname, account_lastname, account_email, account_id) {
    const sql = "UPDATE account SET account_firstname = $2, account_lastname = $3, account_email = $4 WHERE account_id = $1 RETURNING *";
    const dataArr = [account_id, account_firstname, account_lastname, account_email];
    try {
        const result = await pool.query(sql, dataArr);
        return result.rows[0];
    } catch (error) {
        return new Error("Update failed.");
    }
}

async function updateAccountPassword(new_password, account_id) {
    const sql = `UPDATE account SET account_password = '${new_password}' WHERE account_id = ${account_id}`;
    try {
        pool.query(sql);
        return "success";
    } catch (error) {
        return new Error("Update failed.");
    }
}

async function addOffer(account_id, inv_id, offer_amount) {
    const newOffer = `${inv_id};${offer_amount};PENDING`;
    const currentOffers = await getOfferHistoryById(account_id);
    let fullOffers;
    if (currentOffers[0].account_offers) {
        fullOffers = `${newOffer}||` + currentOffers[0].account_offers;
    }
    else {
        fullOffers = newOffer;
    }

    const sql = `UPDATE account SET account_offers=$2 WHERE account_id = $1`;
    const dataArr = [account_id, fullOffers];
    try {
        const results = await pool.query(sql, dataArr);
        return results;
    } catch(error) {
        return new Error("Failed adding offer.");
    }   
}

async function getOfferHistoryById(account_id) {
    const sql = `SELECT account_offers FROM account WHERE account_id = $1`;
    const results = await pool.query(sql, [account_id]);
    return results.rows;
}

module.exports = {registerAccount , checkExistingEmail, getAccountByEmail, getAccountById, updateAccountInfo, updateAccountPassword, addOffer, getOfferHistoryById };