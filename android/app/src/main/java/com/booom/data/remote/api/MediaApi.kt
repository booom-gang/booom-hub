package com.booom.data.remote.api

import com.booom.domain.model.GalleryResponse
import kotlinx.serialization.Serializable
import retrofit2.http.*

interface MediaApi {
    @POST("media/presigned-url")
    suspend fun getPresignedUrl(@Body request: PresignedUrlRequest): PresignedUrlResponse

    @POST("media/gallery")
    suspend fun registerGalleryMedia(@Body request: RegisterMediaRequest)

    @POST("media/cleanup-r2")
    suspend fun cleanupR2(@Body request: CleanupRequest)

    @GET("media/gallery")
    suspend fun getGallery(
        @Query("page") page: Int,
        @Query("limit") limit: Int
    ): GalleryResponse

    @DELETE("media/gallery/{id}")
    suspend fun deleteGalleryItem(@Path("id") id: String)
}

@Serializable
data class PresignedUrlRequest(
    val fileName: String,
    val fileType: String,
    val mediaKind: String
)

@Serializable
data class PresignedUrlResponse(
    val uploadUrl: String,
    val fileKey: String,
    val publicUrl: String
)

@Serializable
data class RegisterMediaRequest(
    val media_type: String,
    val file_key: String,
    val file_size_bytes: Long
)

@Serializable
data class CleanupRequest(
    val file_key: String
)
