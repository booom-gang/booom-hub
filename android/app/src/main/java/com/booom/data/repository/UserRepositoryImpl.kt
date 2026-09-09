package com.booom.data.repository

import com.booom.data.remote.api.UserApi
import com.booom.data.remote.api.UserUpdate
import com.booom.domain.model.User
import com.booom.domain.repository.UserRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserRepositoryImpl @Inject constructor(
    private val userApi: UserApi
) : UserRepository {

    override suspend fun getUsers(): Result<List<User>> = try {
        Result.success(userApi.getUsers())
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun getMe(): Result<User> = try {
        Result.success(userApi.getMe())
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun updateMe(updates: UserUpdate): Result<User> = try {
        Result.success(userApi.updateMe(updates))
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun deleteProfilePicture(): Result<User> = try {
        Result.success(userApi.deleteProfilePicture())
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun deleteAccount(): Result<Unit> = try {
        userApi.deleteAccount()
        Result.success(Unit)
    } catch (e: Exception) {
        Result.failure(e)
    }
}
