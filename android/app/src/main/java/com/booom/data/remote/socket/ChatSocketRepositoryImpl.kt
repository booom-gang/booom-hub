package com.booom.data.remote.socket

import android.util.Log
import com.booom.BuildConfig
import com.booom.domain.model.Message
import com.booom.domain.repository.ChatSocketRepository
import com.booom.domain.repository.ConnectionState
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.serialization.json.Json
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatSocketRepositoryImpl @Inject constructor(
    private val json: Json
) : ChatSocketRepository {

    private var socket: Socket? = null

    private val _connectionState = MutableStateFlow(ConnectionState.DISCONNECTED)
    override val connectionState = _connectionState.asStateFlow()

    private val _typingUsers = MutableStateFlow<Map<String, Boolean>>(emptyMap())
    override val typingUsers = _typingUsers.asStateFlow()

    private val _onlineUserIds = MutableStateFlow<List<String>>(emptyList())
    override val onlineUserIds = _onlineUserIds.asStateFlow()

    override val messages: Flow<Message> = callbackFlow {
        val messageHandler = { args: Array<Any> ->
            val data = args[0] as JSONObject
            try {
                val message = json.decodeFromString<Message>(data.toString())
                trySend(message)
            } catch (e: Exception) {
                Log.e("ChatSocket", "Error decoding message", e)
            }
        }

        socket?.on("message:new", messageHandler)
        awaitClose { socket?.off("message:new", messageHandler) }
    }

    override fun connect(token: String) {
        if (socket?.connected() == true) return

        val options = IO.Options.builder()
            .setAuth(mapOf("token" to token))
            .build()

        socket = IO.socket(BuildConfig.SOCKET_BASE_URL, options)

        socket?.on(Socket.EVENT_CONNECT) {
            _connectionState.value = ConnectionState.CONNECTED
        }

        socket?.on(Socket.EVENT_DISCONNECT) {
            _connectionState.value = ConnectionState.DISCONNECTED
        }

        socket?.on(Socket.EVENT_CONNECT_ERROR) {
            _connectionState.value = ConnectionState.ERROR
        }

        socket?.on("presence:update") { args ->
            val data = args[0] as JSONObject
            val ids = mutableListOf<String>()
            val jsonArray = data.getJSONArray("onlineUserIds")
            for (i in 0 until jsonArray.length()) {
                ids.add(jsonArray.getString(i))
            }
            _onlineUserIds.value = ids
        }

        socket?.on("typing:update") { args ->
            val data = args[0] as JSONObject
            val username = data.getString("username")
            val isTyping = data.getBoolean("isTyping")
            val current = _typingUsers.value.toMutableMap()
            current[username] = isTyping
            _typingUsers.value = current
        }

        socket?.connect()
    }

    override fun disconnect() {
        socket?.disconnect()
        socket = null
        _connectionState.value = ConnectionState.DISCONNECTED
    }

    override fun sendMessage(text: String) {
        val data = JSONObject().apply {
            put("message_text", text)
        }
        socket?.emit("message:send", data)
    }

    override fun startTyping() {
        socket?.emit("typing:start")
    }

    override fun stopTyping() {
        socket?.emit("typing:stop")
    }
}
