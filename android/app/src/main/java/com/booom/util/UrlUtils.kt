package com.booom.util

import com.booom.BuildConfig

object UrlUtils {
    fun getFullUrl(path: String?): String? {
        if (path == null) return null
        if (path.startsWith("http")) return path
        return "${BuildConfig.PUBLIC_MEDIA_BASE_URL}$path"
    }

    fun getProxiedUrl(path: String?): String? {
        val fullUrl = getFullUrl(path) ?: return null
        return "https://wsrv.nl/?url=$fullUrl&output=webp"
    }
}
