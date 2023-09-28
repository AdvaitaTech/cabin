use crate::errors::ApiError;
use actix_web::{web, HttpResponse};
use deadpool_postgres::Pool;
use jsonwebtoken::{encode, get_current_timestamp, EncodingKey, Header};
use pwhash::bcrypt;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Deserialize)]
struct FormData {
    email: String,
    password: String,
    confirm: String,
}

#[derive(Deserialize)]
struct LoginFormData {
    email: String,
    password: String,
}

#[derive(Deserialize, Serialize)]
pub struct SignUpResponse {
    pub session: String,
}

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: u64,
}

async fn sign_up(
    form: web::Form<FormData>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, ApiError> {
    if form.password != form.confirm {
        Err(ApiError::BadClientData)
    } else {
        let client: deadpool_postgres::Client = pool.get().await.map_err(ApiError::DbError)?;
        let sql = "INSERT INTO users(email, password) VALUES ($1, $2);";
        let claims = Claims {
            sub: form.email.clone(),
            exp: get_current_timestamp() + 43200,
        };
        let secret = env::var("SECRET").unwrap();
        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(&secret.as_ref()),
        )
        .unwrap();
        let password = bcrypt::hash(&form.password.clone()).unwrap();

        match client.query(sql, &[&form.email, &password]).await {
            Ok(_val) => {
                println!("got success {:?}", _val);
                Ok(HttpResponse::Ok().json(SignUpResponse { session: token }))
            }
            Err(_err) => {
                println!("got error {}", _err);
                Err(ApiError::BadClientData)
            }
        }
    }
}

async fn login(
    form: web::Form<LoginFormData>,
    pool: web::Data<Pool>,
) -> Result<HttpResponse, ApiError> {
    let client: deadpool_postgres::Client = pool.get().await.map_err(ApiError::DbError)?;
    let password = bcrypt::hash(&form.password).unwrap();
    let sql = "SELECT * FROM users where (email = $1 AND password = $2);";

    match client.query(sql, &[&form.email, &password]).await {
        Ok(_val) => {
            println!("got login success {:?}", _val);
            let claims = Claims {
                sub: form.email.clone(),
                exp: get_current_timestamp() + 43200,
            };
            let secret = env::var("SECRET").unwrap();
            let token = encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret(&secret.as_ref()),
            )
            .unwrap();
            Ok(HttpResponse::Ok().json(SignUpResponse { session: token }))
        }
        Err(_err) => {
            println!("got login error {}", _err);
            Err(ApiError::BadClientData)
        }
    }
}

pub mod routes {
    use super::*;
    use actix_web::{web, Scope};

    pub fn get() -> Scope {
        web::scope("/users")
            .route("/sign_up", web::post().to(sign_up))
            .route("/login", web::post().to(login))
    }
}
