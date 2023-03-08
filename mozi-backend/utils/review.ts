import { MyContext } from "../server";
import { determineRole, getToken } from "./token";
import { Review, Token, User } from "./types";
import { getCurrentUser } from "./user";

export function getReviews(_:any, context:MyContext):Promise<Review[]> {
  const sql = "SELECT * FROM review";
  return new Promise((resolve, reject) => {
    context.db.all(sql, [], (err: any, rows: Review[]) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function getReviewById(id:string, context:MyContext):Promise<Review> {
  const sql = `SELECT * FROM review WHERE review.id = ?`;
  console.log(id)
  return new Promise((resolve, reject) => {
    context.db.get(sql,[id], (err: any, rows: Review) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function getReviewsOfUserForMovie(user_id:string, movie_id:string, context:MyContext):Promise<Review[]> {
  const sql = `SELECT * FROM review WHERE review.user_id = ? AND review.movie_id = ?`;
  return new Promise((resolve, reject) => {
    context.db.all(sql, [user_id,movie_id], (err: any, rows: Review[]) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function getReviewsOfMovie(movie_id:string, context:MyContext):Promise<Review[]> {
  const sql = `SELECT * FROM review WHERE review.movie_id = ?`;
  return new Promise((resolve, reject) => {
    context.db.all(sql,[movie_id], (err:any, rows:Review[]) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function createReview(review:Review, context:MyContext):Promise<Review> {
  const sql = `INSERT INTO review (id,rating,description,movie_id,user_id)
    VALUES (?,?,?,?,?)`;
  return new Promise((resolve, reject) => {
    context.db.run(sql,[review.id,review.rating,review.description,review.movie.id,review.user.id], (err:any) => {
      if (err) {
        reject(err);
      }
      resolve(review);
    });
  });
}

export async function updateReview(review:Review, context:MyContext):Promise<Review> {
  const user:User = await getCurrentUser(context)
  const token:Token = await getToken(user, context);
  if (!token) throw new Error("No Token");
  if (token.token === context.req.headers['auth-token']) {
    const updatedReview = await getReviewById(review.id, context);
    const returnReview = {
      ...review,
      movie_id: updatedReview.movie.id,
      user_id: updatedReview.user.id,
    };
    const sql = `UPDATE review SET rating=?, description=? WHERE review.id = ?`;
    return new Promise((resolve, reject) => {
      context.db.run(
        sql,
        [review.rating, review.description, review.id],
        (err:any) => {
          if (err) {
            reject(err);
          }
          resolve(returnReview);
        }
      );
    });
  }throw new Error("Unauthorized!");
}

export async function deleteReview(id:string, context:MyContext):Promise<Review> {
  const user:User = await getCurrentUser(context)
  const token:Token = await getToken(user, context);
  if (!token) throw new Error("No Token");
  const role = await determineRole(context);
  if(role === undefined) throw new Error("Role not found")
  if (
    token.token === context.req.headers['auth-token'] ||
    role.role === "admin"
  ) {
    const review = await getReviewById(id, context);
    const sql = `DELETE FROM review WHERE review.id = ?`;
    return new Promise((resolve, reject) => {
      context.db.run(sql,[review.id], (err:any) => {
        if (err) {
          reject(err);
        }
        resolve(review);
      });
    });
  }
  throw new Error("Unauthorized!");
}