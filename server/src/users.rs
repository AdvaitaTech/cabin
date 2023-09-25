use actix_web::{web, HttpResponse, Responder};
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

async fn sign_up(form: web::Form<FormData>) -> impl Responder {
    println!("Hello");
    println!("{} {}", form.username, form.password);
    HttpResponse::Ok().body("Signed up!")
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
