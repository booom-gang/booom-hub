package com.booom.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.booom.domain.model.User
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "session")

class SessionManager(private val context: Context) {
    private val tokenKey = stringPreferencesKey("jwt_token")
    private val userKey = stringPreferencesKey("user_data")

    val token: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[tokenKey]
    }

    val user: Flow<User?> = context.dataStore.data.map { preferences ->
        preferences[userKey]?.let { Json.decodeFromString<User>(it) }
    }

    suspend fun saveSession(token: String, user: User) {
        context.dataStore.edit { preferences ->
            preferences[tokenKey] = token
            preferences[userKey] = Json.encodeToString(user)
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { preferences ->
            preferences.remove(tokenKey)
            preferences.remove(userKey)
        }
    }
}
