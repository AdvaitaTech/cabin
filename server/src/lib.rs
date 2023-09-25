use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use dotenv::{dotenv, from_filename};
use std::env;
pub mod errors;
pub mod users;

pub fn load_environment() {
    let environment = env::var("RUST_ENV").unwrap_or_else(|_| "".to_string());
    if cfg!(test) {
        from_filename(".env.test").ok();
    } else if environment == "production" {
        from_filename(".env.production").ok();
    } else {
        from_filename(".env.development").ok();
    }
    dotenv().ok();
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello World!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[cfg(test)]
mod tests {
    use actix_web::{http::header::ContentType, test, App};

    use super::*;

    #[actix_web::test]
    async fn test_hello() {
        let app = test::init_service(App::new().service(hello)).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .to_request();
        let resp = test::call_and_read_body(&app, req).await;
        assert_eq!(resp, actix_web::web::Bytes::from_static(b"Hello World!"));
    }

    #[actix_web::test]
    async fn test_echo() {
        let app = test::init_service(App::new().service(echo)).await;
        let message = String::from("wl!");
        let req = test::TestRequest::post()
            .uri("/echo")
            .set_payload(message.clone())
            .to_request();
        let resp = test::call_and_read_body(&app, req).await;
        assert_eq!(resp, message.as_bytes());
    }
}
