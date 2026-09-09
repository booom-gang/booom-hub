package com.booom.data.remote.api

import com.booom.domain.model.Message
import retrofit2.http.*

interface MessageApi {
    @GET("messages")
    suspend fun getMessages(
        @Query("limit") limit: Int,
        @Query("before") before: String? = null
    ): List<Message>

    @DELETE("messages/{id}")
    suspend fun deleteMessage(@Path("id") id: String)
}
