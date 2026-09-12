package app.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Light = lightColorScheme(
    primary = Color(0xFF0B5FFF),
    onPrimary = Color.White,
    surface = Color.White,
    onSurface = Color(0xFF101114),
    background = Color(0xFFF6F7FB),
    error = Color(0xFFD7263D),
)

private val Dark = darkColorScheme(
    primary = Color(0xFF7BB0FF),
    onPrimary = Color(0xFF001A41),
    surface = Color(0xFF101114),
    onSurface = Color(0xFFE8EAF0),
    background = Color(0xFF0A0B0E),
    error = Color(0xFFFF6B7A),
)

@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) Dark else Light,
        content = content,
    )
}