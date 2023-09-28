use actix_web::{
    http::header,
    web::{Data, Json, Path},
    HttpResponse,
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use deadpool_postgres::{Client, Pool};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use tokio_postgres::types::ToSql;

use crate::{errors::ApiError, users::Claims};

#[derive(Serialize, Deserialize)]
pub struct CreateEntryRequest {
    pub title: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SaveEntryRequest {
    pub title: Option<String>,
    pub content: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct JournalEntry {
    pub id: String,
    pub title: String,
    pub content: String,
}

#[derive(Deserialize, Serialize)]
pub struct ListEntriesResponse {
    pub entries: Vec<JournalEntry>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AddEntryResponse {
    pub id: String,
    pub title: String,
    pub content: String,
}

async fn create(
    journal: Json<CreateEntryRequest>,
    auth: BearerAuth,
    pool: Data<Pool>,
) -> Result<HttpResponse, ApiError> {
    let secret = env::var("SECRET").unwrap();
    let token = match decode::<Claims>(
        &auth.token(),
        &DecodingKey::from_secret(&secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(v) => Ok(v),
        Err(_e) => Err(ApiError::Unauthorized),
    }
    .unwrap();
    let email = token.claims.sub;
    let client: Client = pool.get().await.map_err(ApiError::DbError)?;
    println!(
        "trying to insert into server {} {} {}",
        journal.title, journal.content, email
    );
    let select = "INSERT INTO journals(title, entry, author) VALUES ($1, $2, (SELECT id FROM users WHERE email=$3)) RETURNING id,title,entry;";
    let entries = match client
        .query(select, &[&journal.title, &journal.content, &email])
        .await
    {
        Ok(v) => Ok(v),
        Err(err) => {
            println!("Error in db call: {:?}", err);
            Err(ApiError::InternalError)
        }
    }
    .unwrap();
    if entries.len() == 0 {
        Err(ApiError::BadClientData)
    } else {
        let entry = &entries[0];
        let id: i64 = entry.get(0);
        let title: String = entry.get(1);
        let content: String = entry.get(2);
        Ok(HttpResponse::Ok().json(AddEntryResponse {
            id: id.to_string(),
            title,
            content,
        }))
    }
}

async fn list(auth: BearerAuth, pool: Data<Pool>) -> Result<HttpResponse, ApiError> {
    let client: Client = pool.get().await.map_err(ApiError::DbError)?;
    let secret = env::var("SECRET").unwrap();
    let token = match decode::<Claims>(
        &auth.token(),
        &DecodingKey::from_secret(&secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(v) => Ok(v),
        Err(_e) => Err(ApiError::Unauthorized),
    }
    .unwrap();
    let email = token.claims.sub;
    let select =
        "SELECT id, title, entry FROM journals WHERE author=(SELECT id from USERS WHERE email=$1);";
    let rows = match client.query(select, &[&email]).await {
        Ok(v) => Ok(v),
        Err(err) => {
            println!("Error in db call: {:?}", err);
            Err(ApiError::InternalError)
        }
    }
    .unwrap();
    let journals: Vec<JournalEntry> = rows
        .iter()
        .map(|r| JournalEntry {
            id: r.get::<usize, i64>(0).to_string(),
            title: r.get(1),
            content: r.get(2),
        })
        .collect();
    Ok(HttpResponse::Ok().json(ListEntriesResponse { entries: journals }))
}

async fn save(
    path: Path<i64>,
    auth: BearerAuth,
    pool: Data<Pool>,
    journal: Json<SaveEntryRequest>,
) -> Result<HttpResponse, ApiError> {
    let user_id = path.into_inner();
    let client: Client = pool.get().await.map_err(ApiError::DbError)?;
    let secret = env::var("SECRET").unwrap();
    let token = match decode::<Claims>(
        &auth.token(),
        &DecodingKey::from_secret(&secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(v) => Ok(v),
        Err(_e) => Err(ApiError::Unauthorized),
    }
    .unwrap();
    let email = token.claims.sub;
    let mut update = String::from("UPDATE journals SET ");
    let mut args: Vec<&(dyn ToSql + Sync)> = Vec::new();
    let content = journal.content.to_owned().unwrap_or("".to_string());
    let title = journal.title.to_owned().unwrap_or("".to_string());
    if journal.title == None && journal.content == None {
        return Err(ApiError::BadClientData);
    } else if journal.title == None {
        args.push(&content);
        update.push_str("entry=$1 WHERE id=$2 AND author=(SELECT id from users WHERE email=$3);");
    } else if journal.content == None {
        args.push(&title);
        update.push_str("title=$1 WHERE id=$2 AND author=(SELECT id from users WHERE email=$3);");
    } else {
        args.push(&title);
        args.push(&content);
        update.push_str(
            "title=$1, entry=$2 WHERE id=$3 AND author=(SELECT id from users WHERE email=$4);",
        );
    }
    args.push(&user_id);
    args.push(&email);
    println!("executing save query {} {:?}", update, args);
    match client.query(&update, &args[..]).await {
        Ok(v) => {
            println!("updated journal {:?}", v);
            Ok(v)
        }
        Err(err) => {
            println!("Error in db call: {:?}", err);
            Err(ApiError::InternalError)
        }
    }
    .unwrap();
    Ok(HttpResponse::Ok().json({}))
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
