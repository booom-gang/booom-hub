package com.booom.data.remote.api

import com.booom.domain.model.User
import kotlinx.serialization.Serializable
import retrofit2.http.*

@Serializable
data class UserUpdate(
    val username: String? = null,
    val about: String? = null,
    val profile_picture: String? = null,
    val hobbies: List<String>? = null
)

interface UserApi {
    @GET("users")
    suspend fun getUsers(): List<User>

    @GET("users/me")
    suspend fun getMe(): User

    @PATCH("users/me")
    suspend fun updateMe(@Body updates: UserUpdate): User

    @DELETE("users/me/profile-picture")
    suspend fun deleteProfilePicture(): User

    @DELETE("users/me")
    suspend fun deleteAccount()
}
