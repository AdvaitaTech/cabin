use actix_web::{
    error,
    http::{header::ContentType, StatusCode},
    HttpResponse,
};
use deadpool_postgres::PoolError;
use derive_more::Display;

#[derive(Debug, Display)]
pub enum ApiError {
    #[display(fmt = "Internal Error")]
    InternalError,

    #[display(fmt = "Bad Request")]
    BadClientData,

    #[display(fmt = "Server Timeout")]
    Timeout,

    #[display(fmt = "Server Error")]
    DbError(PoolError),

    #[display(fmt = "Unauthorized")]
    Unauthorized,

    #[display(fmt = "Access Forbidden")]
    Forbidden,
}

impl std::error::Error for ApiError {}

impl error::ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code())
            .insert_header(ContentType::html())
            .body(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        match *self {
            ApiError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::BadClientData => StatusCode::BAD_REQUEST,
            ApiError::Timeout => StatusCode::GATEWAY_TIMEOUT,
            ApiError::DbError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
            ApiError::Forbidden => StatusCode::FORBIDDEN,
        }
    }
}
