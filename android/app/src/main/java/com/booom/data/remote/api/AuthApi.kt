package com.booom.data.remote.api

import com.booom.domain.model.User
import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
}

@Serializable
data class LoginRequest(
    val masterPassword: String,
    val username: String
)

@Serializable
data class LoginResponse(
    val token: String,
    val user: User
)
