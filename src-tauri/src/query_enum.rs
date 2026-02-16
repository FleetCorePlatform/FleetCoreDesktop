use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(untagged)]
pub enum QueryValue {
    String(String),
    Number(i64),
}