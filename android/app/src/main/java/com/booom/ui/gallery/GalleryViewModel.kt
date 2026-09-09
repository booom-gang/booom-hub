package com.booom.ui.gallery

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.booom.domain.model.Media
import com.booom.domain.repository.GalleryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GalleryViewModel @Inject constructor(
    private val galleryRepository: GalleryRepository
) : ViewModel() {

    private val _state = MutableStateFlow<GalleryUiState>(GalleryUiState.Loading)
    val state = _state.asStateFlow()

    private var currentPage = 1
    private var isLastPage = false

    init {
        loadGallery()
    }

    fun loadGallery(refresh: Boolean = false) {
        if (refresh) {
            currentPage = 1
            isLastPage = false
        }
        if (isLastPage && !refresh) return

        viewModelScope.launch {
            if (refresh) _state.value = GalleryUiState.Loading
            
            galleryRepository.getGallery(currentPage, 24)
                .onSuccess { response ->
                    val currentItems = if (refresh) emptyList() else (_state.value as? GalleryUiState.Success)?.items ?: emptyList()
                    _state.value = GalleryUiState.Success(currentItems + response.items)
                    isLastPage = currentPage >= response.totalPages
                    currentPage++
                }
                .onFailure {
                    if (refresh || _state.value is GalleryUiState.Loading) {
                        _state.value = GalleryUiState.Error(it.message ?: "Failed to load gallery")
                    }
                }
        }
    }

    fun deleteItem(id: String) {
        viewModelScope.launch {
            galleryRepository.deleteGalleryItem(id)
                .onSuccess {
                    val current = _state.value as? GalleryUiState.Success
                    current?.let {
                        _state.value = GalleryUiState.Success(it.items.filter { item -> item._id != id })
                    }
                }
        }
    }
}

sealed class GalleryUiState {
    object Loading : GalleryUiState()
    data class Success(val items: List<Media>) : GalleryUiState()
    data class Error(val message: String) : GalleryUiState()
}
