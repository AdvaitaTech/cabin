use actix_web::{App, HttpServer};
use server::configure_api;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(move || App::new().configure(configure_api))
        .bind(("localhost", 8080))?
        .run()
        .await
}
