package com.booom.domain.repository

import com.booom.domain.model.User
import com.booom.data.remote.api.UserUpdate

interface UserRepository {
    suspend fun getUsers(): Result<List<User>>
    suspend fun getMe(): Result<User>
    suspend fun updateMe(updates: UserUpdate): Result<User>
    suspend fun deleteProfilePicture(): Result<User>
    suspend fun deleteAccount(): Result<Unit>
}
