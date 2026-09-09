package com.booom.domain.repository

import com.booom.domain.model.Event
import com.booom.data.remote.api.EventRequest

interface EventRepository {
    suspend fun getEvents(month: Int, year: Int): Result<List<Event>>
    suspend fun createEvent(request: EventRequest): Result<Event>
    suspend fun updateEvent(id: String, request: EventRequest): Result<Event>
    suspend fun deleteEvent(id: String): Result<Unit>
}
