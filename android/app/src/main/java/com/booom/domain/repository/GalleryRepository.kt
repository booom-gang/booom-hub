package com.booom.domain.repository

import com.booom.domain.model.GalleryResponse

interface GalleryRepository {
    suspend fun getGallery(page: Int, limit: Int): Result<GalleryResponse>
    suspend fun deleteGalleryItem(id: String): Result<Unit>
}
