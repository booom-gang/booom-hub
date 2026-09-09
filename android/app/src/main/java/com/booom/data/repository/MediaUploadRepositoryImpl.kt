package com.booom.data.repository

import com.booom.data.remote.api.*
import com.booom.domain.repository.MediaUploadRepository
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MediaUploadRepositoryImpl @Inject constructor(
    private val mediaApi: MediaApi,
    private val userApi: UserApi
) : MediaUploadRepository {

    private val uploadClient = OkHttpClient()

    override suspend fun uploadGalleryImage(file: File): Result<String> = try {
        val presigned = mediaApi.getPresignedUrl(
            PresignedUrlRequest(file.name, "image/webp", "gallery-image")
        )
        
        val request = Request.Builder()
            .url(presigned.uploadUrl)
            .put(file.asRequestBody("image/webp".toMediaTypeOrNull()))
            .build()
            
        val response = uploadClient.newCall(request).execute()
        if (response.isSuccessful) {
            mediaApi.registerGalleryMedia(
                RegisterMediaRequest("image", presigned.fileKey, file.length())
            )
            Result.success(presigned.publicUrl)
        } else {
            mediaApi.cleanupR2(CleanupRequest(presigned.fileKey))
            Result.failure(Exception("Upload failed: ${response.code}"))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun uploadProfilePicture(file: File): Result<String> = try {
        val presigned = mediaApi.getPresignedUrl(
            PresignedUrlRequest(file.name, "image/webp", "profile-picture")
        )
        
        val request = Request.Builder()
            .url(presigned.uploadUrl)
            .put(file.asRequestBody("image/webp".toMediaTypeOrNull()))
            .build()
            
        val response = uploadClient.newCall(request).execute()
        if (response.isSuccessful) {
            userApi.updateMe(UserUpdate(profile_picture = presigned.fileKey))
            Result.success(presigned.publicUrl)
        } else {
            mediaApi.cleanupR2(CleanupRequest(presigned.fileKey))
            Result.failure(Exception("Upload failed: ${response.code}"))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
