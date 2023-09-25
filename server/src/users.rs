use actix_web::{web, HttpResponse, Responder};
// use error::ApiError;
use crate::errors;
use serde::Deserialize;

#[derive(Deserialize)]
struct FormData {
    username: String,
    password: String,
    confirm: String,
}

#[derive(Deserialize)]
pub struct SignUpResponse {
    pub session: String,
}

async fn sign_up(form: web::Form<FormData>) -> Result<HttpResponse, errors::ApiError> {
    if form.password != form.confirm {
        Err(errors::ApiError::BadClientData)
    } else {
        Ok(HttpResponse::Ok().body("Signed up!"))
    }
}

// #[get("/sign_in")]
// async fn sign_in() -> impl Responder {
//     HttpResponse::Ok().body("Signed in!")
// }
//
pub mod routes {
    use super::sign_up;
    use actix_web::{web, Scope};

    pub fn get() -> Scope {
        web::scope("/users").route("/sign_up", web::post().to(sign_up))
    }
}
