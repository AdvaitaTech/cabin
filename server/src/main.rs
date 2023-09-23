use actix_web::{get, post, App, HttpResponse, HttpServer, Responder};
use users::routes;
pub mod users;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello World!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(echo)
            .service(routes::get())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
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
