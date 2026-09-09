package com.booom.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.booom.navigation.Screen

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val items = listOf(
        BottomNavItem("Home", Screen.Home.route, Icons.Default.Home),
        BottomNavItem("Gallery", Screen.Gallery.route, Icons.Default.Image),
        BottomNavItem("Chat", Screen.Chat.route, Icons.Default.Chat),
        BottomNavItem("Calendar", Screen.Calendar.route, Icons.Default.DateRange),
        BottomNavItem("Settings", Screen.Settings.route, Icons.Default.Settings)
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) { Text("Home Screen") } // Placeholder
            composable(Screen.Gallery.route) { Text("Gallery Screen") } // Placeholder
            composable(Screen.Chat.route) { Text("Chat Screen") } // Placeholder
            composable(Screen.Calendar.route) { Text("Calendar Screen") } // Placeholder
            composable(Screen.Settings.route) { Text("Settings Screen") } // Placeholder
        }
    }
}

data class BottomNavItem(val title: String, val route: String, val icon: ImageVector)
