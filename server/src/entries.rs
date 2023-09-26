use actix_web::HttpResponse;
use serde::{Deserialize, Serialize};

use crate::errors::ApiError;

#[derive(Serialize, Deserialize)]
pub struct JournalEntry {
    pub title: String,
    pub content: String,
}

#[derive(Deserialize, Serialize)]
pub struct ListEntriesResponse {
    pub entries: Vec<JournalEntry>,
}

pub struct AddEntryResponse {
    pub id: String,
    pub title: String,
    pub content: String,
}

async fn create() -> Result<HttpResponse, ApiError> {
    Ok(HttpResponse::Ok().body({}))
}

async fn list() -> Result<HttpResponse, ApiError> {
    Ok(HttpResponse::Ok().body({}))
}

async fn save() -> Result<HttpResponse, ApiError> {
    Ok(HttpResponse::Ok().body({}))
}

pub mod routes {
    use super::*;
    use actix_web::{web, Scope};

    pub fn get() -> Scope {
        web::scope("/entries")
            .route("/", web::post().to(create))
            .route("/", web::get().to(list))
            .route("/{id}", web::put().to(save))
    }
}
