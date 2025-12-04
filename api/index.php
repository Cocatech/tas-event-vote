<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$endpoint = trim(str_replace('/api/', '', $path), '/');

// Route handling
$parts = explode('/', $endpoint);
$action = $parts[0] ?? '';
$id = $parts[1] ?? null;

// ============= EVENT ENDPOINTS =============
if ($action === 'event') {
    if ($method === 'GET') {
        // Get current event
        $event = loadJSON(EVENT_FILE);
        response(200, 'Event retrieved successfully', $event);
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $event = loadJSON(EVENT_FILE);
        
        $event['name'] = $data['name'] ?? $event['name'];
        $event['description'] = $data['description'] ?? $event['description'];
        $event['max_participants'] = $data['max_participants'] ?? $event['max_participants'];
        
        saveJSON(EVENT_FILE, $event);
        response(200, 'Event updated successfully', $event);
    }
}

// ============= EVENT STATUS ENDPOINTS =============
elseif ($action === 'event-status') {
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $event = loadJSON(EVENT_FILE);
        
        if (in_array($data['status'], ['setup', 'running', 'closed'])) {
            $event['status'] = $data['status'];
            saveJSON(EVENT_FILE, $event);
            response(200, 'Event status updated successfully', $event);
        } else {
            response(400, 'Invalid status');
        }
    }
}

// ============= CANDIDATES ENDPOINTS =============
elseif ($action === 'candidates') {
    if ($method === 'GET') {
        $candidates = loadJSON(CANDIDATES_FILE);
        // Add vote count to each candidate
        $votes = loadJSON(VOTES_FILE);
        foreach ($candidates as &$candidate) {
            $candidate['vote_count'] = 0;
            $candidate['total_points'] = 0;
            foreach ($votes as $vote) {
                if ($vote['candidate_id'] === $candidate['id']) {
                    $candidate['vote_count']++;
                    $candidate['total_points'] += $vote['points'];
                }
            }
        }
        response(200, 'Candidates retrieved successfully', $candidates);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $candidates = loadJSON(CANDIDATES_FILE);
        
        $new_candidate = [
            'id' => uniqid(),
            'name' => $data['name'] ?? '',
            'description' => $data['description'] ?? '',
            'order' => count($candidates) + 1,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $candidates[] = $new_candidate;
        saveJSON(CANDIDATES_FILE, $candidates);
        response(201, 'Candidate created successfully', $new_candidate);
    }
}

elseif ($action === 'candidates' && $method === 'PUT' && $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $candidates = loadJSON(CANDIDATES_FILE);
    
    foreach ($candidates as &$candidate) {
        if ($candidate['id'] === $id) {
            $candidate['name'] = $data['name'] ?? $candidate['name'];
            $candidate['description'] = $data['description'] ?? $candidate['description'];
            $candidate['order'] = $data['order'] ?? $candidate['order'];
            saveJSON(CANDIDATES_FILE, $candidates);
            response(200, 'Candidate updated successfully', $candidate);
        }
    }
    response(404, 'Candidate not found');
}

elseif ($action === 'candidates' && $method === 'DELETE' && $id) {
    $candidates = loadJSON(CANDIDATES_FILE);
    $candidates = array_filter($candidates, fn($c) => $c['id'] !== $id);
    $candidates = array_values($candidates);
    saveJSON(CANDIDATES_FILE, $candidates);
    response(200, 'Candidate deleted successfully');
}

// ============= PARTICIPANTS ENDPOINTS =============
elseif ($action === 'participants') {
    if ($method === 'GET') {
        $participants = loadJSON(PARTICIPANTS_FILE);
        response(200, 'Participants retrieved successfully', $participants);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $event = loadJSON(EVENT_FILE);
        $participants = loadJSON(PARTICIPANTS_FILE);
        
        // NEW: Check if event is closed
        if ($event['status'] === 'closed') {
            response(403, 'Event has ended - registration closed');
        }
        
        // Check max participants
        if (count($participants) >= $event['max_participants']) {
            response(400, 'Maximum participants reached');
        }
        
        // Check if already registered
        foreach ($participants as $p) {
            if ($p['phone'] === $data['phone']) {
                response(400, 'Phone number already registered');
            }
        }
        
        $new_participant = [
            'id' => uniqid(),
            'name' => $data['name'] ?? '',
            'phone' => $data['phone'] ?? '',
            'email' => $data['email'] ?? '',
            'token' => bin2hex(random_bytes(16)),
            'created_at' => date('Y-m-d H:i:s'),
            'voted_at' => null
        ];
        
        $participants[] = $new_participant;
        saveJSON(PARTICIPANTS_FILE, $participants);
        response(201, 'Participant registered successfully', $new_participant);
    }
}

// ============= VOTES ENDPOINTS =============
elseif ($action === 'votes') {
    if ($method === 'GET') {
        $votes = loadJSON(VOTES_FILE);
        response(200, 'Votes retrieved successfully', $votes);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $participants = loadJSON(PARTICIPANTS_FILE);
        $candidates = loadJSON(CANDIDATES_FILE);
        $votes = loadJSON(VOTES_FILE);
        $event = loadJSON(EVENT_FILE);
        
        // NEW: Check if event is closed
        if ($event['status'] === 'closed') {
            response(403, 'Event has ended - no more votes accepted');
        }
        
        // Verify participant token
        $participant = null;
        foreach ($participants as $p) {
            if ($p['token'] === $data['token']) {
                $participant = $p;
                break;
            }
        }
        
        if (!$participant) {
            response(401, 'Invalid token');
        }
        
        // Check if already voted
        foreach ($votes as $v) {
            if ($v['participant_id'] === $participant['id'] && $v['candidate_id'] === $data['candidate_id']) {
                response(400, 'Already voted for this candidate');
            }
        }
        
        // Validate candidate exists
        $candidate_exists = false;
        foreach ($candidates as $c) {
            if ($c['id'] === $data['candidate_id']) {
                $candidate_exists = true;
                break;
            }
        }
        
        if (!$candidate_exists) {
            response(404, 'Candidate not found');
        }
        
        $points = getPointsByLevel($data['level']);
        
        $new_vote = [
            'id' => uniqid(),
            'participant_id' => $participant['id'],
            'candidate_id' => $data['candidate_id'],
            'level' => $data['level'], // 1, 2, or 3
            'points' => $points,
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $votes[] = $new_vote;
        saveJSON(VOTES_FILE, $votes);
        
        // Update participant voted_at
        foreach ($participants as &$p) {
            if ($p['id'] === $participant['id']) {
                $p['voted_at'] = date('Y-m-d H:i:s');
                break;
            }
        }
        saveJSON(PARTICIPANTS_FILE, $participants);
        
        response(201, 'Vote recorded successfully', $new_vote);
    }
}

// ============= RESULTS ENDPOINTS =============
elseif ($action === 'results') {
    if ($method === 'GET') {
        $candidates = loadJSON(CANDIDATES_FILE);
        $votes = loadJSON(VOTES_FILE);
        
        // Calculate points for each candidate
        $results = [];
        foreach ($candidates as $candidate) {
            $total_points = 0;
            $vote_count = 0;
            foreach ($votes as $vote) {
                if ($vote['candidate_id'] === $candidate['id']) {
                    $total_points += $vote['points'];
                    $vote_count++;
                }
            }
            $results[] = [
                'id' => $candidate['id'],
                'name' => $candidate['name'],
                'description' => $candidate['description'],
                'vote_count' => $vote_count,
                'total_points' => $total_points
            ];
        }
        
        // Sort by points descending
        usort($results, fn($a, $b) => $b['total_points'] - $a['total_points']);
        
        response(200, 'Results retrieved successfully', [
            'top_3' => array_slice($results, 0, 3),
            'all_candidates' => $results
        ]);
    }
}

// ============= RESET ENDPOINTS =============
elseif ($action === 'reset-event') {
    if ($method === 'POST') {
        // Clear all data but keep event settings
        $event = loadJSON(EVENT_FILE);
        saveJSON(PARTICIPANTS_FILE, []);
        saveJSON(CANDIDATES_FILE, []);
        saveJSON(VOTES_FILE, []);
        
        response(200, 'Event reset successfully', $event);
    }
}

// ============= DELETE PARTICIPANTS ENDPOINT =============
elseif ($action === 'delete-participants') {
    if ($method === 'POST') {
        // Delete all participants and their votes
        saveJSON(PARTICIPANTS_FILE, []);
        saveJSON(VOTES_FILE, []);
        
        response(200, 'All participants deleted successfully', []);
    }
}

// ============= CLEAR VOTES ONLY =============
elseif ($action === 'clear-votes') {
    if ($method === 'POST') {
        // Delete only votes.json, keep participants.json intact
        saveJSON(VOTES_FILE, []);
        
        // Reset voted_at timestamp for all participants
        $participants = loadJSON(PARTICIPANTS_FILE);
        foreach ($participants as &$p) {
            $p['voted_at'] = null;
        }
        saveJSON(PARTICIPANTS_FILE, $participants);
        
        response(200, 'All votes cleared successfully', []);
    }
}

// ============= DELETE SINGLE PARTICIPANT =============
elseif ($action === 'delete-participant') {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['participant_id'])) {
            response(400, 'Missing participant_id');
        }
        
        $participants = loadJSON(PARTICIPANTS_FILE);
        $votes = loadJSON(VOTES_FILE);
        
        // Find and delete the participant
        $found = false;
        $deleted_participant = null;
        foreach ($participants as $key => $p) {
            if ($p['id'] === $data['participant_id']) {
                $deleted_participant = $p;
                unset($participants[$key]);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            response(404, 'Participant not found');
        }
        
        // Delete all votes for this participant
        $votes = array_filter($votes, function($vote) use ($data) {
            return $vote['participant_id'] !== $data['participant_id'];
        });
        
        // Re-index arrays
        $participants = array_values($participants);
        $votes = array_values($votes);
        
        // Save updated data
        saveJSON(PARTICIPANTS_FILE, $participants);
        saveJSON(VOTES_FILE, $votes);
        
        response(200, 'Participant deleted successfully', [
            'deleted_name' => $deleted_participant['name'],
            'votes_deleted' => count(array_filter(loadJSON(VOTES_FILE), function($v) { return false; }))
        ]);
    }
}

// ============= DEFAULT RESPONSE =============
else {
    response(404, 'Endpoint not found');
}

// Helper function for points calculation
function getPointsByLevel($level) {
    $points = [1 => 15, 2 => 10, 3 => 5];
    return $points[$level] ?? 0;
}
?>
