package com.booom.ui.calendar

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import java.text.SimpleDateFormat
import java.util.*
import androidx.compose.runtime.*

@Composable
fun CalendarScreen(
    viewModel: CalendarViewModel = hiltViewModel()
) {
    val events by viewModel.events.collectAsState()
    val currentDate by viewModel.currentDate.collectAsState()
    var selectedDay by remember { mutableStateOf<Int?>(null) }
    val monthFormat = SimpleDateFormat("MMMM yyyy", Locale.getDefault())
    val firstDay = (currentDate.clone() as Calendar).apply { set(Calendar.DAY_OF_MONTH, 1) }
    val leadingDays = (firstDay.get(Calendar.DAY_OF_WEEK) + 5) % 7
    val daysInMonth = currentDate.getActualMaximum(Calendar.DAY_OF_MONTH)
    val calendarCells = (1..leadingDays).map { 0 } + (1..daysInMonth).toList()
    val eventDays = events.mapNotNull { runCatching { SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(it.date)?.let { date -> Calendar.getInstance().apply { time = date }.get(Calendar.DAY_OF_MONTH) } }.getOrNull() }.toSet()
    val selectedEvents = selectedDay?.let { day -> events.filter { it.date.startsWith("${currentDate.get(Calendar.YEAR)}-${String.format("%02d", currentDate.get(Calendar.MONTH) + 1)}-${String.format("%02d", day)}") } } ?: emptyList()

    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.previousMonth() }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Previous Month")
            }
            Text(
                text = monthFormat.format(currentDate.time),
                style = MaterialTheme.typography.headlineSmall
            )
            IconButton(onClick = { viewModel.nextMonth() }) {
                Icon(Icons.Default.ArrowForward, contentDescription = "Next Month")
            }
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            listOf("M", "T", "W", "T", "F", "S", "S").forEach { day ->
                Text(day, modifier = Modifier.width(42.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.labelSmall)
            }
        }
        LazyVerticalGrid(columns = GridCells.Fixed(7), modifier = Modifier.fillMaxWidth().heightIn(max = 340.dp), userScrollEnabled = false, contentPadding = PaddingValues(vertical = 8.dp)) {
            items(calendarCells) { day ->
                if (day == 0) Spacer(Modifier.size(42.dp)) else {
                    val selected = selectedDay == day
                    Box(modifier = Modifier.padding(3.dp).size(42.dp).background(if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp)).clickable { selectedDay = day }, contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(day.toString(), color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface, style = MaterialTheme.typography.bodySmall)
                            if (day in eventDays) Text("•", color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.primary, lineHeight = 8.sp)
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(if (selectedDay == null) "Select a day" else "Events on ${monthFormat.format(currentDate.time)} ${selectedDay}", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(8.dp))
        if (selectedEvents.isEmpty()) Text("No events for this day", color = MaterialTheme.colorScheme.onSurfaceVariant)
        else selectedEvents.forEach { event -> EventItem(event) }
    }
}

@Composable
fun EventItem(event: com.booom.domain.model.Event) {
    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = event.title, style = MaterialTheme.typography.titleMedium)
            Text(text = event.date, style = MaterialTheme.typography.bodySmall)
            event.description?.let {
                Text(text = it, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}
