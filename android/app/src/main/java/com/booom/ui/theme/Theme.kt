package com.booom.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFFF9800), // Warm Orange
    secondary = Color(0xFFFFB74D),
    tertiary = Color(0xFFFFE0B2)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFFFF9800), // Warm Orange
    secondary = Color(0xFFF57C00),
    tertiary = Color(0xFFFFE0B2)
)

@Composable
fun BOOOMTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
