package com.booom.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Message(
    val _id: String,
    val user_id: String,
    val sender_name: String,
    val message_text: String,
    val timestamp: String
)
