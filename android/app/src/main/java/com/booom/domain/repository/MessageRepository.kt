package com.booom.domain.repository

import com.booom.domain.model.Message

interface MessageRepository {
    suspend fun getMessages(limit: Int, before: String? = null): Result<List<Message>>
    suspend fun deleteMessage(id: String): Result<Unit>
}
