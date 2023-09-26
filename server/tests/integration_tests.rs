use async_trait;
use server::users::SignUpResponse;
use std::{collections::HashMap, env};
use test_context::{test_context, AsyncTestContext};

struct MyContext {}

#[async_trait::async_trait]
impl AsyncTestContext for MyContext {
    async fn setup() -> MyContext {
        println!("setup run");
        env::set_var("RUST_ENV", "test");
        MyContext {}
    }

    async fn teardown(self) {}
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};
    use jsonwebtoken::{decode, DecodingKey, Validation};
    use server::{configure_api, users::Claims};

    #[test_context(MyContext)]
    #[actix_web::test]
    async fn sign_up_failure(_ctx: &mut MyContext) {
        let app = test::init_service(App::new().configure(configure_api)).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("email", "testing@example.com"),
                ("password", "testing123"),
                ("confirm", "fail"),
            ]))
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_client_error());
    }

    #[test_context(MyContext)]
    #[actix_web::test]
    async fn sign_up_success(_ctx: &mut MyContext) {
        let app = test::init_service(App::new().configure(configure_api)).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("email", "testing@example.com"),
                ("password", "testing@123"),
                ("confirm", "testing@123"),
            ]))
            .to_request();
        let resp: SignUpResponse = test::call_and_read_body_json(&app, req).await;
        let secret = env::var("SECRET").unwrap();
        assert_eq!(resp.session.is_empty(), false);
        assert_ne!(resp.session.len(), 0);
        let token = decode::<Claims>(
            &resp.session,
            &DecodingKey::from_secret(&secret.as_ref()),
            &Validation::default(),
        )
        .unwrap();
        assert_eq!(token.claims.sub, "testing@example.com");
    }

    #[test_context(MyContext)]
    #[actix_web::test]
    async fn sign_up_duplicate(_ctx: &mut MyContext) {
        let app = test::init_service(App::new().configure(configure_api)).await;
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("email", "testing1@example.com"),
                ("password", "testing@123"),
                ("confirm", "testing@123"),
            ]))
            .to_request();
        let resp: SignUpResponse = test::call_and_read_body_json(&app, req).await;
        assert_eq!(resp.session.is_empty(), false);
        assert_ne!(resp.session.len(), 0);
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("email", "testing1@example.com"),
                ("password", "testing@123"),
                ("confirm", "testing@123"),
            ]))
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_client_error());
    }

    // #[test_context(MyContext)]
    // #[actix_web::test]
    // async fn sign_up_then_login(_ctx: &mut MyContext) {
    //     let app = test::init_service(App::new().service(routes::get())).await;
    //     let req = test::TestRequest::post()
    //         .uri("/users/sign_up")
    //         .set_form(HashMap::from([
    //             ("email", "testing@example.com"),
    //             ("password", "testing123"),
    //             ("confirm", "testing@123"),
    //         ]))
    //         .to_request();
    //     let resp: SignUpResponse = test::call_and_read_body_json(&app, req).await;
    //     assert_eq!(resp.session.is_empty(), false);
    //     assert_ne!(resp.session.len(), 0);
    //     let req = test::TestRequest::post()
    //         .uri("/users/login")
    //         .set_form(HashMap::from([
    //             ("email", "testing@example.com"),
    //             ("password", "testing123"),
    //         ]))
    //         .to_request();
    //     let resp2: SignUpResponse = test::call_and_read_body_json(&app, req).await;
    //     assert_eq!(resp2.session, resp.session);
    // }
}
