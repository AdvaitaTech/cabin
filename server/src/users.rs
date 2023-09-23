use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize)]
struct FormData {
    username: String,
    password: String,
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

#[cfg(test)]
mod tests {
    use actix_web::{test, App};

    use super::*;

    #[actix_web::test]
    async fn sign_up_incorrect() {
        let app = test::init_service(App::new().service(routes::get())).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("username", "testing@example.com"),
                ("password", "testing123"),
            ]))
            .to_request();
        let resp = test::call_and_read_body(&app, req).await;
        assert_eq!(resp, actix_web::web::Bytes::from_static(b"Signed up!"));
    }
}
