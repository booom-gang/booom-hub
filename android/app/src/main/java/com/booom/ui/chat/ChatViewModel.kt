package com.booom.ui.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.booom.data.local.SessionManager
import com.booom.domain.model.Message
import com.booom.domain.repository.ChatSocketRepository
import com.booom.domain.repository.MessageRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val messageRepository: MessageRepository,
    private val socketRepository: ChatSocketRepository,
    private val sessionManager: SessionManager,
    private val authRepository: com.booom.domain.repository.AuthRepository
) : ViewModel() {

    val currentUser = authRepository.currentUser.stateIn(
        scope = viewModelScope,
        started = kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages = _messages.asStateFlow()

    val connectionState = socketRepository.connectionState
    val typingUsers = socketRepository.typingUsers
    val onlineUserIds = socketRepository.onlineUserIds

    init {
        loadHistory()
        observeSocketMessages()
        connectSocket()
    }

    private fun connectSocket() {
        viewModelScope.launch {
            sessionManager.token.collect { token ->
                token?.let { socketRepository.connect(it) }
            }
        }
    }

    private fun loadHistory() {
        viewModelScope.launch {
            messageRepository.getMessages(50)
                .onSuccess { _messages.value = it }
        }
    }

    private fun observeSocketMessages() {
        viewModelScope.launch {
            socketRepository.messages.collect { newMessage ->
                if (_messages.value.none { it._id == newMessage._id }) {
                    _messages.value = _messages.value + newMessage
                }
            }
        }
    }

    fun sendMessage(text: String) {
        if (text.isNotBlank()) {
            socketRepository.sendMessage(text)
        }
    }

    fun deleteMessage(id: String) {
        viewModelScope.launch {
            messageRepository.deleteMessage(id)
                .onSuccess {
                    _messages.value = _messages.value.filter { it._id != id }
                }
        }
    }

    fun startTyping() = socketRepository.startTyping()
    fun stopTyping() = socketRepository.stopTyping()

    override fun onCleared() {
        socketRepository.disconnect()
        super.onCleared()
    }
}
