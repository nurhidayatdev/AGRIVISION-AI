<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 1. Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

/**
 * 2. Reusable function to check if the current user has the required role.
 * 
 * @param array|string $allowed_roles Role(s) allowed to access the page.
 * @param string $redirect_url URL to redirect to if access is denied.
 */
function require_role($allowed_roles, $redirect_url = 'dashboard.php') {
    if (!isset($_SESSION['role'])) {
        header("Location: login.php");
        exit;
    }

    $current_role = $_SESSION['role'];
    
    // Convert string to array if a single role is passed
    if (!is_array($allowed_roles)) {
        $allowed_roles = [$allowed_roles];
    }

    // Check if current role is in the list of allowed roles
    if (!in_array($current_role, $allowed_roles)) {
        // Deny access and redirect
        header("Location: " . $redirect_url . "?error=unauthorized");
        exit;
    }
}

// Example usage (uncomment in actual pages):
// require_role(['Admin Pusat', 'Kadis Provinsi']); 
// Denies access to 'PPL' or 'Staf Kabupaten' for SuperAdmin pages.
?>
