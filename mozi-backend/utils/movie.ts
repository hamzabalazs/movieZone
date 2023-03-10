import { MyContext } from "../server";
import { CreateMovieInput, DbMovie, Movie, UpdateMovieInput } from "./types";

export function getMovies(_:any, context:MyContext):Promise<Movie[]> {
  const sql = "SELECT * FROM movie";
  return new Promise((resolve, reject) => {
    context.db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function getMovieById(id:string, context:MyContext):Promise<Movie> {
  const sql = `SELECT * FROM movie WHERE movie.id = ?`;
  return new Promise((resolve, reject) => {
    context.db.get(sql,[id], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function createMovie(movie:Movie, context:MyContext):Promise<DbMovie> {
  const sql = `INSERT INTO movie (id,title,description,poster,release_date,category_id) VALUES (?,?,?,?,?,?)`;
  const returnMovie:DbMovie = {
    id:movie.id,
    title:movie.title,
    description:movie.description,
    poster:movie.poster,
    release_date:movie.release_date,
    category_id:movie.category.id,
    rating:movie.rating,
  }
  return new Promise((resolve, reject) => {
    context.db.run(sql,[movie.id,movie.title,movie.description,movie.poster,movie.release_date,movie.category.id], err => {
      if (err) {
        reject(err);
      }
      resolve(returnMovie);
    });
  });
}

export function updateMovie(movie:UpdateMovieInput, context:MyContext):Promise<UpdateMovieInput> {
  const sql = `UPDATE movie SET title = ?,
    description = ?,
    poster = ?, 
    release_date = ?, 
    category_id=? WHERE movie.id = ?`;
  return new Promise((resolve, reject) => {
    context.db.run(sql,[movie.title,movie.description,movie.poster,movie.release_date,movie.category_id,movie.id], err => {
      if (err) {
        reject(err);
      }
      resolve(movie);
    });
  });
}

export async function deleteMovie(id:string, context:MyContext):Promise<Movie> {
  const movie = await getMovieById(id, context);
  if(movie === undefined){
    throw new Error("Movie not found!")
  }
  const sql = `DELETE FROM movie WHERE movie.id = ?`;
  return new Promise((resolve, reject) => {
    context.db.run(sql,[id], err => {
      if (err) {
        reject(err);
      }
      resolve(movie);
    });
  });
}

