package com.booom.data.repository

import com.booom.data.remote.api.EventApi
import com.booom.data.remote.api.EventRequest
import com.booom.domain.model.Event
import com.booom.domain.repository.EventRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EventRepositoryImpl @Inject constructor(
    private val eventApi: EventApi
) : EventRepository {

    override suspend fun getEvents(month: Int, year: Int): Result<List<Event>> = try {
        Result.success(eventApi.getEvents(month, year))
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun createEvent(request: EventRequest): Result<Event> = try {
        Result.success(eventApi.createEvent(request))
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun updateEvent(id: String, request: EventRequest): Result<Event> = try {
        Result.success(eventApi.updateEvent(id, request))
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun deleteEvent(id: String): Result<Unit> = try {
        eventApi.deleteEvent(id)
        Result.success(Unit)
    } catch (e: Exception) {
        Result.failure(e)
    }
}
