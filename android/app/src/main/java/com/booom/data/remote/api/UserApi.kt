package com.booom.data.remote.api

import com.booom.domain.model.User
import retrofit2.http.*

interface UserApi {
    @GET("users")
    suspend fun getUsers(): List<User>

    @GET("users/me")
    suspend fun getMe(): User

    @PATCH("users/me")
    suspend fun updateMe(@Body updates: Map<String, @Contextual Any>): User

    @DELETE("users/me/profile-picture")
    suspend fun deleteProfilePicture(): User

    @DELETE("users/me")
    suspend fun deleteAccount()
}
