package com.booom.data.repository

import com.booom.data.local.SessionManager
import com.booom.data.remote.api.AuthApi
import com.booom.data.remote.api.LoginRequest
import com.booom.domain.model.User
import com.booom.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    private val sessionManager: SessionManager
) : AuthRepository {

    override val currentUser: Flow<User?> = sessionManager.user
    
    override val isAuthenticated: Flow<Boolean> = sessionManager.token.map { it != null }

    override fun login(masterPassword: String, username: String): Result<User> {
        return try {
            val response = authApi.login(LoginRequest(masterPassword, username))
            sessionManager.saveSession(response.token, response.user)
            Result.success(response.user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun logout() {
        sessionManager.clearSession()
    }
}
