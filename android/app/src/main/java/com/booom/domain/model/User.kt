package com.booom.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val _id: String,
    val username: String,
    val profile_picture: String? = null,
    val about: String = "",
    val hobbies: List<String> = emptyList(),
    val joined_at: String
)
