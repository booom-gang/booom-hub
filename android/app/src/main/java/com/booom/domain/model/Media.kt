package com.booom.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Media(
    val _id: String,
    val user_id: UserMin? = null,
    val media_type: String,
    val file_key: String,
    val thumbnail_key: String? = null,
    val file_size_bytes: Long,
    val created_at: String,
    val proxy_url: String? = null
)

@Serializable
data class UserMin(
    val _id: String,
    val username: String,
    val profile_picture: String? = null
)

@Serializable
data class GalleryResponse(
    val items: List<Media>,
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int
)
