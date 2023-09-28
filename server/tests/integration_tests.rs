use actix_web::test::TestRequest;
use async_trait;
use server::users::SignUpResponse;
use std::{collections::HashMap, env};
use test_context::{test_context, AsyncTestContext};

struct MyContext {}

#[async_trait::async_trait]
impl AsyncTestContext for MyContext {
    async fn setup() -> MyContext {
        env::set_var("RUST_ENV", "test");
        MyContext {}
    }

    async fn teardown(self) {}
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};
    use jsonwebtoken::{
        decode, encode, get_current_timestamp, DecodingKey, EncodingKey, Header, Validation,
    };
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

    #[test_context(MyContext)]
    #[actix_web::test]
    async fn sign_up_then_login(_ctx: &mut MyContext) {
        let app = test::init_service(App::new().configure(configure_api)).await;
        let secret = env::var("SECRET").unwrap();
        let req = test::TestRequest::post()
            .uri("/users/sign_up")
            .set_form(HashMap::from([
                ("email", "testing3@example.com"),
                ("password", "testing@123"),
                ("confirm", "testing@123"),
            ]))
            .to_request();
        let resp: SignUpResponse = test::call_and_read_body_json(&app, req).await;
        let token1 = decode::<Claims>(
            &resp.session,
            &DecodingKey::from_secret(&secret.as_ref()),
            &Validation::default(),
        )
        .unwrap();
        assert_eq!(resp.session.is_empty(), false);
        assert_ne!(resp.session.len(), 0);
        let req = test::TestRequest::post()
            .uri("/users/login")
            .set_form(HashMap::from([
                ("email", "testing3@example.com"),
                ("password", "testing@123"),
            ]))
            .to_request();
        let resp2: SignUpResponse = test::call_and_read_body_json(&app, req).await;
        let token2 = decode::<Claims>(
            &resp2.session,
            &DecodingKey::from_secret(&secret.as_ref()),
            &Validation::default(),
        )
        .unwrap();
        assert_eq!(token1.claims.sub, token2.claims.sub);
    }
}

#[cfg(test)]
mod journal_tests {
    use super::*;
    use actix_web::{
        test::{call_and_read_body_json, call_service, init_service},
        App,
    };
    use server::{
        configure_api,
        entries::{AddEntryResponse, ListEntriesResponse},
    };

    #[test_context(MyContext)]
    #[actix_web::test]
    async fn create_entry(_cts: &MyContext) {
        let app = init_service(App::new().configure(configure_api)).await;
        let req = TestRequest::post()
            .uri("/users/login")
            .set_form(HashMap::from([
                ("email", "testing100@example.com"),
                ("password", "testing@123"),
            ]))
            .to_request();
        let token: SignUpResponse = call_and_read_body_json(&app, req).await;
        let req = TestRequest::post()
            .uri("/entries/")
            .insert_header(("Authorization", format!("Bearer {}", token.session)))
            .set_json(HashMap::from([
                ("title", "First entry"),
                ("content", "Wrote something"),
            ]))
            .to_request();
        let resp: AddEntryResponse = call_and_read_body_json(&app, req).await;
        assert_eq!(resp.title, "First entry".to_string());
        assert_eq!(resp.content, "Wrote something".to_string());
        let req = TestRequest::get()
            .uri("/entries/")
            .insert_header(("Authorization", format!("Bearer {}", token.session)))
            .to_request();
        let resp: ListEntriesResponse = call_and_read_body_json(&app, req).await;
        assert_eq!(resp.entries.len(), 1);
        assert_eq!(resp.entries[0].title, "First entry".to_string());
        assert_eq!(resp.entries[0].content, "Wrote something".to_string());
    }

    #[test_context(MyContext)]
    #[actix_web::test]
    async fn save_entry(_cts: &MyContext) {
        let app = init_service(App::new().configure(configure_api)).await;
        let req = TestRequest::post()
            .uri("/users/login")
            .set_form(HashMap::from([
                ("email", "testing101@example.com"),
                ("password", "testing@123"),
            ]))
            .to_request();
        let token: SignUpResponse = call_and_read_body_json(&app, req).await;
        let req = TestRequest::post()
            .uri("/entries/")
            .insert_header(("Authorization", format!("Bearer {}", token.session)))
            .set_json(HashMap::from([
                ("title", "Second entry"),
                ("content", "Wrote something"),
            ]))
            .to_request();
        let entry: AddEntryResponse = call_and_read_body_json(&app, req).await;
        let req = TestRequest::put()
            .uri(&format!("/entries/{}", entry.id)[..])
            .insert_header(("Authorization", format!("Bearer {}", token.session)))
            .set_json(HashMap::from([("content", "Wrote something else")]))
            .to_request();
        call_service(&app, req).await;
        let req = TestRequest::get()
            .uri("/entries/")
            .insert_header(("Authorization", format!("Bearer {}", token.session)))
            .to_request();
        let resp: ListEntriesResponse = call_and_read_body_json(&app, req).await;
        assert_eq!(resp.entries.len(), 1);
        assert_eq!(resp.entries[0].title, "Second entry".to_string());
        assert_eq!(resp.entries[0].content, "Wrote something else".to_string());
    }
}
