package com.booom.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Main : Screen("main")
    
    // Bottom bar items
    object Home : Screen("home")
    object Gallery : Screen("gallery")
    object Chat : Screen("chat")
    object Calendar : Screen("calendar")
    object Settings : Screen("settings")
}
