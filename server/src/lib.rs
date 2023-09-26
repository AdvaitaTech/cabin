use actix_web::{
    get, post,
    web::{self, ServiceConfig},
    HttpResponse, Responder,
};
use dotenv::{dotenv, from_filename};
use errors::ApiError;
use std::env;
use tokio_postgres::NoTls;
pub mod entries;
pub mod errors;
pub mod users;

pub fn load_environment() {
    let environment = env::var("RUST_ENV").unwrap_or_else(|_| "".to_string());
    println!("env is {environment}");
    if environment.eq("test") {
        from_filename(".env.test").ok();
    } else if environment == "production" {
        from_filename(".env.production").ok();
    } else {
        from_filename(".env.development").ok();
    }
    dotenv().ok();
}

mod config {
    use serde::Deserialize;
    #[derive(Debug, Default, Deserialize)]
    pub struct ExampleConfig {
        pub server_addr: String,
        pub secret: String,
        pub pg: deadpool_postgres::Config,
    }
}
pub fn create_db_pool() -> deadpool_postgres::Pool {
    let config_ = Config::builder()
        .add_source(::config::Environment::default())
        .build()
        .unwrap();

    let config: config::ExampleConfig = config_.try_deserialize().unwrap();

    config.pg.create_pool(None, NoTls).unwrap()
}

pub fn configure_api(cfg: &mut ServiceConfig) {
    load_environment();
    let pool = create_db_pool();
    cfg.app_data(web::Data::new(pool.clone()))
        .app_data(web::FormConfig::default().error_handler(|_err, _req| {
            println!("got error {:#}", _err);
            ApiError::BadClientData.into()
        }))
        .service(hello)
        .service(echo)
        .service(users::routes::get());
}

use ::config::Config;

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
