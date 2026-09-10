package com.booom.ui.chat

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.booom.domain.model.Message

@Composable
fun ChatScreen(
    viewModel: ChatViewModel = hiltViewModel()
) {
    val messages by viewModel.messages.collectAsState()
    val typingUsers by viewModel.typingUsers.collectAsState(initial = emptyMap())
    val connectionState by viewModel.connectionState.collectAsState(initial = com.booom.domain.repository.ConnectionState.DISCONNECTED)
    val currentUser by viewModel.currentUser.collectAsState()
    var text by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp)) {
        Text("Chat 💬", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(top = 20.dp, bottom = 12.dp))

        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).padding(horizontal = 8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            items(messages) { message ->
                MessageBubble(
                    message = message,
                    isOwner = message.user_id == currentUser?._id,
                    onDelete = { viewModel.deleteMessage(message._id) }
                )
            }
        }

        val typingList = typingUsers.filter { it.value }.keys.toList()
        if (typingList.isNotEmpty()) {
            Text(
                text = "${typingList.joinToString(", ")} is typing...",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).navigationBarsPadding().imePadding(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = text,
                onValueChange = { 
                    text = it
                    if (it.isNotEmpty()) viewModel.startTyping() else viewModel.stopTyping()
                },
                modifier = Modifier.weight(1f),
                placeholder = { Text("write something...") },
                shape = RoundedCornerShape(22.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                maxLines = 4
            )
            IconButton(onClick = {
                viewModel.sendMessage(text)
                text = ""
                viewModel.stopTyping()
            }) {
                Icon(Icons.Default.Send, contentDescription = "Send")
            }
        }
    }
}

@Composable
fun MessageBubble(
    message: Message,
    isOwner: Boolean,
    onDelete: () -> Unit
) {
    val alignment = if (isOwner) Alignment.End else Alignment.Start
    val containerColor = if (isOwner) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface

    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = alignment) {
        Card(
            modifier = Modifier.fillMaxWidth(0.82f),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = containerColor),
            border = if (isOwner) null else androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
        ) {
            Column(modifier = Modifier.padding(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = message.sender_name, style = MaterialTheme.typography.labelLarge, color = if (isOwner) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.primary)
                    if (isOwner) {
                        IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(16.dp))
                        }
                    }
                }
                Text(text = message.message_text, color = if (isOwner) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                Text(
                    text = message.timestamp, 
                    style = MaterialTheme.typography.labelSmall, 
                    modifier = Modifier.align(Alignment.End),
                    color = if (isOwner) MaterialTheme.colorScheme.onPrimary.copy(alpha = .7f) else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
