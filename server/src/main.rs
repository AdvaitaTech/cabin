use actix_web::{App, HttpServer};
use server;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    server::load_environment();
    HttpServer::new(|| {
        App::new()
            .service(server::hello)
            .service(server::echo)
            .service(server::users::routes::get())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
