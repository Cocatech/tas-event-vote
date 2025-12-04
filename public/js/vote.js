// API Configuration - dynamically set based on current location
const API_BASE = (() => {
    const host = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? 443 : 80);
    const protocol = window.location.protocol;
    return `${protocol}//${host}:${port}/api`;
})();

// Global state
let currentParticipant = null;
let allCandidates = [];
let userVotes = {}; // { candidateId: level }
let currentEvent = null;

// ============= REGISTRATION FORM =============
document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();

    // Validate
    if (!name || !phone) {
        showErrorMessage('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email })
        });

        const data = await response.json();

        if (data.success) {
            currentParticipant = data.data;
            localStorage.setItem('participantToken', currentParticipant.token);
            proceedToVoting();
        } else {
            // Check if event is closed
            if (data.message.includes('ended')) {
                showEventClosedMessage();
            } else if (data.message.includes('reached')) {
                showEventFullMessage();
            } else {
                showErrorMessage(data.message || 'Registration failed');
            }
        }
    } catch (error) {
        console.error('Error registering:', error);
        showErrorMessage('Error registering. Please try again.');
    }
});

function showErrorMessage(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// ============= LOAD EVENT INFO =============
async function loadEventInfo() {
    try {
        const response = await fetch(`${API_BASE}/event`);
        const data = await response.json();
        if (data.success) {
            currentEvent = data.data;
            
            // CHECK: If event is closed, show message and block voting
            if (currentEvent.status === 'closed') {
                showEventClosedMessage();
                return;
            }
            
            const participants = await fetch(`${API_BASE}/participants`);
            const partData = await participants.json();
            if (partData.success) {
                // Check if event is full
                if (partData.data.length >= currentEvent.max_participants) {
                    showEventFullMessage();
                    return;
                }
                
                const remaining = Math.max(0, currentEvent.max_participants - partData.data.length);
                document.getElementById('participant-count').textContent = 
                    `Spots available: ${remaining} / ${currentEvent.max_participants}`;
            }
        }
    } catch (error) {
        console.error('Error loading event info:', error);
    }
}

// NEW: Show message when event is closed
function showEventClosedMessage() {
    const registrationStep = document.getElementById('registration-step');
    registrationStep.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                <div class="text-6xl mb-4">🔒</div>
                <h1 class="text-3xl font-bold text-red-600 mb-4">Event Closed</h1>
                <p class="text-gray-600 text-lg mb-4">Sorry! The voting event has ended.</p>
                <p class="text-gray-500 mb-6">The administrator has closed this event and no more votes are being accepted.</p>
                <a href="/results" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
                    📊 View Final Results
                </a>
            </div>
        </div>
    `;
}

// NEW: Show message when event is full
function showEventFullMessage() {
    const registrationStep = document.getElementById('registration-step');
    registrationStep.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                <div class="text-6xl mb-4">👥</div>
                <h1 class="text-3xl font-bold text-orange-600 mb-4">Event Full</h1>
                <p class="text-gray-600 text-lg mb-4">Sorry! The maximum number of participants has been reached.</p>
                <p class="text-gray-500 mb-6">No more registrations are being accepted for this event.</p>
                <a href="/results" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
                    📊 View Results
                </a>
            </div>
        </div>
    `;
}

// ============= PROCEED TO VOTING =============
async function proceedToVoting() {
    document.getElementById('registration-step').classList.add('hidden');
    document.getElementById('voting-step').classList.remove('hidden');
    
    document.getElementById('voter-name').textContent = currentParticipant.name;
    
    await loadCandidates();
}

// ============= LOAD CANDIDATES =============
async function loadCandidates() {
    try {
        const response = await fetch(`${API_BASE}/candidates`);
        const data = await response.json();
        if (data.success) {
            allCandidates = data.data;
            displayCandidates();
        }
    } catch (error) {
        console.error('Error loading candidates:', error);
    }
}

function displayCandidates() {
    const container = document.getElementById('candidates-container');
    
    if (allCandidates.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center">No candidates available for voting</p>';
        return;
    }

    container.innerHTML = allCandidates.map(candidate => {
        const currentLevel = userVotes[candidate.id];
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-24 flex items-center justify-center">
                    <div class="text-5xl">👤</div>
                </div>
                
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${candidate.name}</h3>
                    ${candidate.description ? `<p class="text-sm text-gray-600 mb-4">${candidate.description}</p>` : ''}
                    
                    <div class="space-y-2">
                        <button onclick="voteCandidate('${candidate.id}', 1)" class="w-full py-2 px-4 rounded-lg font-semibold transition text-sm ${
                            currentLevel === 1 
                            ? 'bg-yellow-400 text-white scale-105 shadow-lg' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }">
                            🥇 Level 1 - 15 pts ${currentLevel === 1 ? '✓' : ''}
                        </button>
                        
                        <button onclick="voteCandidate('${candidate.id}', 2)" class="w-full py-2 px-4 rounded-lg font-semibold transition text-sm ${
                            currentLevel === 2 
                            ? 'bg-gray-400 text-white scale-105 shadow-lg' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }">
                            🥈 Level 2 - 10 pts ${currentLevel === 2 ? '✓' : ''}
                        </button>
                        
                        <button onclick="voteCandidate('${candidate.id}', 3)" class="w-full py-2 px-4 rounded-lg font-semibold transition text-sm ${
                            currentLevel === 3 
                            ? 'bg-orange-400 text-white scale-105 shadow-lg' 
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }">
                            🥉 Level 3 - 5 pts ${currentLevel === 3 ? '✓' : ''}
                        </button>
                        
                        ${currentLevel ? `
                            <button onclick="removeVote('${candidate.id}')" class="w-full py-2 px-4 rounded-lg font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition text-sm">
                                ✕ Remove Vote
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============= VOTE MANAGEMENT =============
function voteCandidate(candidateId, level) {
    const currentLevel = userVotes[candidateId];
    
    if (currentLevel === level) {
        // Toggle off if clicking same level
        delete userVotes[candidateId];
    } else {
        // Check if user is already voting for this candidate with a different level
        if (currentLevel !== undefined && currentLevel !== level) {
            // User already voted for this candidate, auto-remove old vote and add new one
            delete userVotes[candidateId];
        }
        
        // Check if this level is already used for another candidate
        const levelAlreadyUsed = Object.values(userVotes).some(l => l === level);
        
        if (levelAlreadyUsed) {
            // Alert user that this level is already used
            const levelNames = { 1: '🥇 Level 1 (15 pts)', 2: '🥈 Level 2 (10 pts)', 3: '🥉 Level 3 (5 pts)' };
            alert(`❌ ${levelNames[level]} is already assigned to another candidate!\n\nPlease change that vote first or choose a different level.`);
            return;
        }
        
        // Set or change level
        userVotes[candidateId] = level;
    }
    
    displayCandidates();
}

function removeVote(candidateId) {
    delete userVotes[candidateId];
    displayCandidates();
}

// ============= SUBMIT VOTES =============
document.getElementById('submit-votes-btn').addEventListener('click', async () => {
    if (Object.keys(userVotes).length === 0) {
        alert('Please select at least one candidate to vote for');
        return;
    }

    // Disable submit button
    const submitBtn = document.getElementById('submit-votes-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Submit each vote
        let allSuccess = true;
        let eventEnded = false;
        
        for (const [candidateId, level] of Object.entries(userVotes)) {
            const response = await fetch(`${API_BASE}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: currentParticipant.token,
                    candidate_id: candidateId,
                    level: level
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Error submitting vote:', data.message);
                
                // Check if event ended
                if (data.message.includes('ended')) {
                    eventEnded = true;
                }
                
                allSuccess = false;
            }
        }

        if (allSuccess) {
            showSuccessMessage();
        } else if (eventEnded) {
            // Show event closed message
            alert('❌ The voting event has ended.\n\nNo more votes are being accepted.');
            showEventClosedMessage();
        } else {
            alert('Some votes failed to submit. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = '✓ Submit Your Votes';
        }
    } catch (error) {
        console.error('Error submitting votes:', error);
        alert('Error submitting votes. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Submit Your Votes';
    }
});

function showSuccessMessage() {
    document.getElementById('voting-step').classList.add('hidden');
    document.getElementById('success-step').classList.remove('hidden');
}

// ============= VIEW RESULTS =============
document.getElementById('view-results-btn').addEventListener('click', () => {
    window.location.href = 'results.html';
});

// ============= LOGOUT =============
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('participantToken');
        currentParticipant = null;
        userVotes = {};
        document.getElementById('registration-step').classList.remove('hidden');
        document.getElementById('voting-step').classList.add('hidden');
        document.getElementById('success-step').classList.add('hidden');
        document.getElementById('registration-form').reset();
        loadEventInfo();
    }
});

// ============= INITIALIZATION =============
window.addEventListener('load', () => {
    // Check if participant already logged in
    const token = localStorage.getItem('participantToken');
    if (token) {
        // Verify token and check if already voted
        fetch(`${API_BASE}/participants`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Find current participant by token
                const participant = data.data.find(p => p.token === token);
                if (participant) {
                    // If already voted, show success page
                    if (participant.voted_at) {
                        showSuccessMessage();
                        return;
                    }
                    // Token valid and not voted yet - proceed to voting
                    currentParticipant = participant;
                    proceedToVoting();
                    return;
                }
            }
            // Token invalid or not found, restart registration
            localStorage.removeItem('participantToken');
            loadEventInfo();
        })
        .catch(err => {
            console.error('Error verifying participant:', err);
            localStorage.removeItem('participantToken');
            loadEventInfo();
        });
    } else {
        loadEventInfo();
    }
});
