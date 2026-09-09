package com.booom.data.remote.api

import com.booom.domain.model.Event
import kotlinx.serialization.Serializable
import retrofit2.http.*

interface EventApi {
    @GET("events")
    suspend fun getEvents(
        @Query("month") month: Int,
        @Query("year") year: Int
    ): List<Event>

    @POST("events")
    suspend fun createEvent(@Body request: EventRequest): Event

    @PATCH("events/{id}")
    suspend fun updateEvent(@Path("id") id: String, @Body request: EventRequest): Event

    @DELETE("events/{id}")
    suspend fun deleteEvent(@Path("id") id: String)
}

@Serializable
data class EventRequest(
    val title: String,
    val description: String? = null,
    val date: String
)
