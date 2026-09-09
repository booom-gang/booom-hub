package com.booom.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Event(
    val _id: String,
    val title: String,
    val description: String? = null,
    val date: String,
    val created_by: UserMin,
    val created_at: String
)
