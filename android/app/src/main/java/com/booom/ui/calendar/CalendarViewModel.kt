package com.booom.ui.calendar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.booom.domain.model.Event
import com.booom.domain.repository.EventRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

@HiltViewModel
class CalendarViewModel @Inject constructor(
    private val eventRepository: EventRepository
) : ViewModel() {

    private val _events = MutableStateFlow<List<Event>>(emptyList())
    val events = _events.asStateFlow()

    private val _currentDate = MutableStateFlow(Calendar.getInstance())
    val currentDate = _currentDate.asStateFlow()

    init {
        loadEvents()
    }

    fun loadEvents() {
        val calendar = _currentDate.value
        val month = calendar.get(Calendar.MONTH) + 1 // 1-based
        val year = calendar.get(Calendar.YEAR)
        
        viewModelScope.launch {
            eventRepository.getEvents(month, year)
                .onSuccess { _events.value = it }
        }
    }

    fun nextMonth() {
        _currentDate.value = (_currentDate.value.clone() as Calendar).apply { add(Calendar.MONTH, 1) }
        loadEvents()
    }

    fun previousMonth() {
        _currentDate.value = (_currentDate.value.clone() as Calendar).apply { add(Calendar.MONTH, -1) }
        loadEvents()
    }
}
