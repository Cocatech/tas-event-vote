<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Data files
define('DATA_DIR', __DIR__ . '/../data/');
define('EVENT_FILE', DATA_DIR . 'event.json');
define('PARTICIPANTS_FILE', DATA_DIR . 'participants.json');
define('CANDIDATES_FILE', DATA_DIR . 'candidates.json');
define('VOTES_FILE', DATA_DIR . 'votes.json');

// Initialize data files
function initializeDataFiles() {
    if (!file_exists(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }

    if (!file_exists(EVENT_FILE)) {
        $default_event = [
            'name' => 'Event Vote',
            'max_participants' => 100,
            'description' => '',
            'status' => 'setup', // setup, running, closed
            'created_at' => date('Y-m-d H:i:s')
        ];
        file_put_contents(EVENT_FILE, json_encode($default_event, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    if (!file_exists(PARTICIPANTS_FILE)) {
        file_put_contents(PARTICIPANTS_FILE, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    if (!file_exists(CANDIDATES_FILE)) {
        file_put_contents(CANDIDATES_FILE, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    if (!file_exists(VOTES_FILE)) {
        file_put_contents(VOTES_FILE, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

// Load JSON file
function loadJSON($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Save JSON file
function saveJSON($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Response helper
function response($code, $message, $data = null) {
    http_response_code($code);
    $response = [
        'success' => $code >= 200 && $code < 300,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

initializeDataFiles();
?>
