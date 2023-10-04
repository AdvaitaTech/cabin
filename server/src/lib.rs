use actix_files::{Files, NamedFile};
use actix_web::{
    error,
    web::{self, ServiceConfig},
    Error, HttpRequest, HttpResponse,
};
use awc::Client;
use dotenv::{dotenv, from_filename};
use errors::ApiError;
use std::env;
use tokio_postgres::NoTls;
use url::Url;
pub mod entries;
pub mod errors;
pub mod users;

pub fn load_environment() {
    let environment = env::var("RUST_ENV").unwrap_or_else(|_| "".to_string());
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
        pub frontend_server: String,
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
    let environment = env::var("RUST_ENV").unwrap_or_else(|_| "".to_string());
    if environment == "production" {
        cfg.app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(Client::default()))
            .app_data(web::FormConfig::default().error_handler(|_err, _req| {
                println!("got error {:#}", _err);
                ApiError::BadClientData.into()
            }))
            .service(users::routes::get())
            .service(entries::routes::get())
            .route("", web::get().to(render_index))
            .route("/", web::get().to(render_index))
            .service(Files::new("/public", "."));
    } else {
        cfg.app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(Client::default()))
            .app_data(web::FormConfig::default().error_handler(|_err, _req| {
                println!("got error {:#}", _err);
                ApiError::BadClientData.into()
            }))
            .service(users::routes::get())
            .service(entries::routes::get())
            .route("", web::get().to(proxy_frontend))
            .route("/", web::get().to(proxy_frontend))
            .route("/{url:.*}", web::get().to(proxy_frontend));
    }
}

use ::config::Config;

async fn render_index() -> Result<NamedFile, std::io::Error> {
    Ok(NamedFile::open("public/index.html")?)
}

async fn proxy_frontend(
    payload: web::Payload,
    client: web::Data<Client>,
    req: HttpRequest,
) -> Result<HttpResponse, Error> {
    let frontend = env::var("FRONTEND_SERVER").unwrap();
    let mut proxy = Url::parse(&frontend).unwrap();
    proxy.set_path(req.uri().path());
    proxy.set_query(req.uri().query());

    println!("Path is {:?}", proxy.as_str());
    let res = client
        .request_from(proxy.as_str(), req.head())
        .no_decompress()
        .send_stream(payload)
        .await
        .map_err(error::ErrorInternalServerError)?;
    let mut resp = HttpResponse::build(res.status());
    for (header_name, header_value) in res.headers().iter().filter(|(h, _)| *h != "connection") {
        resp.insert_header((header_name.clone(), header_value.clone()));
    }

    Ok(resp.streaming(res))
}
