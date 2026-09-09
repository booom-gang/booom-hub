package com.booom.domain.repository

import com.booom.domain.model.Message
import kotlinx.coroutines.flow.Flow

interface ChatSocketRepository {
    val messages: Flow<Message>
    val typingUsers: Flow<Map<String, Boolean>>
    val onlineUserIds: Flow<List<String>>
    val connectionState: Flow<ConnectionState>

    fun connect(token: String)
    fun disconnect()
    fun sendMessage(text: String)
    fun startTyping()
    fun stopTyping()
}

enum class ConnectionState {
    CONNECTED, DISCONNECTED, CONNECTING, ERROR
}
