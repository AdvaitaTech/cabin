use server::users::{routes, SignUpResponse};
use std::collections::HashMap;

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};

    #[actix_web::test]
    async fn sign_up_incorrect() {
        let app = test::init_service(App::new().service(routes::get())).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("username", "testing@example.com"),
                ("password", "testing123"),
                ("confirm", "fail"),
            ]))
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_client_error());
    }

    #[actix_web::test]
    async fn sign_up_correct() {
        let app = test::init_service(App::new().service(routes::get())).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("username", "testing@example.com"),
                ("password", "testing123"),
                ("confirm", "testing@123"),
            ]))
            .to_request();
        let resp: server::users::SignUpResponse = test::call_and_read_body_json(&app, req).await;
        assert_eq!(resp.session.is_empty(), false);
        assert_ne!(resp.session.len(), 0);
    }

    #[actix_web::test]
    async fn sign_up_then_login() {
        let app = test::init_service(App::new().service(routes::get())).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("username", "testing@example.com"),
                ("password", "testing123"),
                ("confirm", "testing@123"),
            ]))
            .to_request();
        let resp: SignUpResponse = test::call_and_read_body_json(&app, req).await;
        assert_eq!(resp.session.is_empty(), false);
        assert_ne!(resp.session.len(), 0);
        let req = test::TestRequest::post()
            .uri("/users/login")
            .set_form(HashMap::from([
                ("username", "testing@example.com"),
                ("password", "testing123"),
            ]))
            .to_request();
        let resp2: SignUpResponse = test::call_and_read_body_json(&app, req).await;
        assert_eq!(resp2.session, resp.session);
    }
}
