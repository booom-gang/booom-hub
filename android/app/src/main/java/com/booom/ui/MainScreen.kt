package com.booom.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.booom.navigation.Screen
import com.booom.ui.home.HomeScreen
import com.booom.ui.gallery.GalleryScreen
import com.booom.ui.chat.ChatScreen
import com.booom.ui.calendar.CalendarScreen
import com.booom.ui.settings.SettingsScreen
import com.booom.ui.settings.SettingsViewModel

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val settingsViewModel: SettingsViewModel = androidx.hilt.navigation.compose.hiltViewModel()
    val currentUser by settingsViewModel.currentUser.collectAsState(initial = null)
    val items = listOf(
        BottomNavItem("Home", Screen.Home.route, Icons.Outlined.Home),
        BottomNavItem("Gallery", Screen.Gallery.route, Icons.Outlined.Image),
        BottomNavItem("Chat", Screen.Chat.route, Icons.Outlined.ChatBubbleOutline),
        BottomNavItem("Calendar", Screen.Calendar.route, Icons.Outlined.CalendarMonth),
        BottomNavItem("Settings", Screen.Settings.route, Icons.Outlined.Settings)
    )

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Surface(
                color = MaterialTheme.colorScheme.background,
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().height(64.dp).padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("BOOOM‼️", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleLarge)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { settingsViewModel.logout() }) {
                            Icon(Icons.Outlined.Logout, contentDescription = "Log out", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                        }
                        Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primary, modifier = Modifier.size(34.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(currentUser?.username?.firstOrNull()?.uppercase() ?: "B", color = MaterialTheme.colorScheme.onPrimary, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.background,
                tonalElevation = 0.dp,
                modifier = Modifier.height(72.dp)
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title, modifier = Modifier.size(20.dp)) },
                        label = { Text(item.title, fontSize = 10.sp) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
                        )
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
            composable(Screen.Home.route) {
                HomeScreen(
                    onViewGallery = { navController.navigate(Screen.Gallery.route) },
                    onOpenChat = { navController.navigate(Screen.Chat.route) }
                )
            }
            composable(Screen.Gallery.route) { GalleryScreen() }
            composable(Screen.Chat.route) { ChatScreen() }
            composable(Screen.Calendar.route) { CalendarScreen() }
            composable(Screen.Settings.route) { SettingsScreen() }
        }
    }
}

data class BottomNavItem(val title: String, val route: String, val icon: ImageVector)
