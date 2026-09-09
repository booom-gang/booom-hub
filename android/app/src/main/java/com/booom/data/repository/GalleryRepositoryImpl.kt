package com.booom.data.repository

import com.booom.data.remote.api.MediaApi
import com.booom.domain.model.GalleryResponse
import com.booom.domain.repository.GalleryRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GalleryRepositoryImpl @Inject constructor(
    private val mediaApi: MediaApi
) : GalleryRepository {

    override suspend fun getGallery(page: Int, limit: Int): Result<GalleryResponse> = try {
        Result.success(mediaApi.getGallery(page, limit))
    } catch (e: Exception) {
        Result.failure(e)
    }

    override suspend fun deleteGalleryItem(id: String): Result<Unit> = try {
        mediaApi.deleteGalleryItem(id)
        Result.success(Unit)
    } catch (e: Exception) {
        Result.failure(e)
    }
}
