package com.booom.domain.repository

import java.io.File

interface MediaUploadRepository {
    suspend fun uploadGalleryImage(file: File): Result<String>
    suspend fun uploadProfilePicture(file: File): Result<String>
}
