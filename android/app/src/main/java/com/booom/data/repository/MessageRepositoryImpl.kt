package com.booom.data.repository

import com.booom.data.remote.api.MessageApi
import com.booom.domain.model.Message
import com.booom.domain.repository.MessageRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MessageRepositoryImpl @Inject constructor(
    private val messageApi: MessageApi
) : MessageRepository {

    override suspend fun getMessages(limit: Int, before: String?): Result<List<Message>> = try {
        Result.success(messageApi.getMessages(limit, before))
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun deleteMessage(id: String): Result<Unit> = try {
        messageApi.deleteMessage(id)
        Result.success(Unit)
    } catch (e: Exception) {
        Result.failure(e)
    }
}
