package com.booom.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Orange = Color(0xFFF2792B)
private val DarkBackground = Color(0xFF0D0D0D)
private val DarkSurface = Color(0xFF141414)
private val DarkCard = Color(0xFF161616)
private val DarkText = Color(0xFFF5F0EB)
private val DarkSecondary = Color(0xFFB0A89E)
private val DarkMuted = Color(0xFF6B6360)
private val DarkBorder = Color(0xFF2A2520)

private val DarkColorScheme = darkColorScheme(
    primary = Orange,
    onPrimary = Color.White,
    secondary = DarkSecondary,
    onSecondary = DarkBackground,
    tertiary = DarkCard,
    background = DarkBackground,
    onBackground = DarkText,
    surface = DarkSurface,
    onSurface = DarkText,
    surfaceVariant = DarkCard,
    onSurfaceVariant = DarkSecondary,
    outline = DarkBorder,
    error = Color(0xFFE57373)
)

private val LightColorScheme = lightColorScheme(
    primary = Orange,
    onPrimary = Color.White,
    secondary = Color(0xFF6B6360),
    tertiary = Color(0xFFE8E4DD),
    background = Color(0xFFFAF8F5),
    onBackground = Color(0xFF1A1512),
    surface = Color.White,
    onSurface = Color(0xFF1A1512),
    surfaceVariant = Color(0xFFF2EFE9),
    onSurfaceVariant = Color(0xFF6B6360),
    outline = Color(0xFFE0DBD4),
    error = Color(0xFFE53935)
)

@Composable
fun BOOOMTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}

val Typography = androidx.compose.material3.Typography(
    displayLarge = androidx.compose.ui.text.TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 48.sp,
        lineHeight = 54.sp
    ),
    headlineMedium = androidx.compose.ui.text.TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 30.sp
    ),
    titleLarge = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 20.sp),
    bodyLarge = TextStyle(fontFamily = FontFamily.SansSerif, fontSize = 16.sp),
    bodyMedium = TextStyle(fontFamily = FontFamily.SansSerif, fontSize = 14.sp),
    bodySmall = TextStyle(fontFamily = FontFamily.SansSerif, fontSize = 12.sp),
    labelLarge = TextStyle(fontFamily = FontFamily.SansSerif, fontWeight = FontWeight.Bold, fontSize = 14.sp)
)

val Shapes = androidx.compose.material3.Shapes(
    small = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
    medium = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
    large = androidx.compose.foundation.shape.RoundedCornerShape(24.dp)
)
