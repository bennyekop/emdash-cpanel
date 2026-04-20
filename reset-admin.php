<?php
$dbPath = __DIR__ . '/data.db';

// Check if database exists
if (!file_exists($dbPath)) {
    fwrite(STDERR, "Error: Database file not found at: {$dbPath}\n");
    exit(1);
}

try {
    $db = new SQLite3($dbPath);
} catch (Exception $e) {
    fwrite(STDERR, "Error: Could not open database. " . $e->getMessage() . "\n");
    exit(1);
}


$result = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
if (!$result) {
    fwrite(STDERR, "Error: Users table not found. This doesn't appear to be an EmDash database.\n");
    exit(1);
}


$userCount = $db->querySingle("SELECT COUNT(*) as count FROM users");
echo "Found {$userCount} user(s) in database.\n";


$deleteResult = $db->exec("DELETE FROM users");

if ($deleteResult) {
    echo "SUCCESS: All users have been deleted.\n";
    
    // Also reset the setup_complete flag
    $db->exec("DELETE FROM options WHERE name = 'emdash:setup_complete'");
    echo "SUCCESS: Setup flag has been reset.\n";
    
    echo "\nNext steps:\n";
    echo "1. Delete this file (reset-admin.php) immediately!\n";
    echo "2. Go to /_emdash/admin/setup\n";
    echo "3. Register a new admin account with passkey for your domain\n";
} else {
    fwrite(STDERR, "Error: Failed to delete users. Please check database permissions.\n");
    exit(1);
}

// Close database
$db->close();
exit(0);
?>
