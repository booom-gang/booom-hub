package com.booom.domain.repository

import com.booom.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val currentUser: Flow<User?>
    val isAuthenticated: Flow<Boolean>
    
    suspend fun login(masterPassword: String, username: String): Result<User>
    suspend fun logout()
}
