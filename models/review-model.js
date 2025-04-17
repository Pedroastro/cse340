const pool = require("../database/")

async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `SELECT * FROM public.review WHERE inv_id = $1 ORDER BY review_date DESC`
    return await pool.query(sql, [inv_id])
  } catch (error) {
    console.error("getReviewsByInventoryId error " + error)
  }
}

async function addReview(review_screenname, review_text, inv_id, account_id) {
  try {
    const sql = `INSERT INTO public.review (review_screenname, review_text, inv_id, account_id) VALUES ($1, $2, $3, $4) RETURNING *`
    return await pool.query(sql, [review_screenname, review_text, inv_id, account_id])
  } catch (error) {
    console.error("addReview error " + error)
  }
}

async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT * FROM public.review WHERE account_id = $1 ORDER BY review_date DESC`
    return await pool.query(sql, [account_id])
  } catch (error) {
    console.error("getReviewsByAccountId error " + error)
  }
}

async function getReviewById(review_id) {
  try {
    const sql = `SELECT * FROM public.review WHERE review_id = $1`
    return await pool.query(sql, [review_id])
  } catch (error) {
    console.error("getReviewById error " + error)
  }
}

async function updateReview(review_screenname, review_text, review_id) {
  try {
    const sql = `UPDATE public.review SET review_screenname = $1, review_text = $2 WHERE review_id = $3 RETURNING *`
    return await pool.query(sql, [review_screenname, review_text, review_id])
  } catch (error) {
    console.error("updateReview error " + error)
  }
}

async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM public.review WHERE review_id = $1 RETURNING *`
    return await pool.query(sql, [review_id])
  } catch (error) {
    console.error("deleteReview error " + error)
  }
}

module.exports = { getReviewsByInventoryId, addReview, getReviewsByAccountId, getReviewById, updateReview, deleteReview }