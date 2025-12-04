// ============= ADMIN PASSWORD PROTECTION =============
const ADMIN_PASSWORD = 'tas2024'; // Default password - change in production!

document.getElementById('admin-login-btn').addEventListener('click', authenticateAdmin);
document.getElementById('admin-password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') authenticateAdmin();
});

function authenticateAdmin() {
    const passwordInput = document.getElementById('admin-password-input');
    const password = passwordInput.value;
    const errorMsg = document.getElementById('password-error');
    
    if (password === ADMIN_PASSWORD) {
        // Password correct - show dashboard
        document.getElementById('password-modal').style.display = 'none';
        document.getElementById('admin-container').classList.remove('hidden');
        passwordInput.value = '';
        errorMsg.classList.add('hidden');
        // Initialize dashboard after authentication
        initializeDashboard();
    } else {
        // Password incorrect
        errorMsg.textContent = '❌ Invalid password';
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// ============= API CONFIGURATION =============
// API Configuration - dynamically set based on current location
const API_BASE = (() => {
    const host = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? 443 : 80);
    const protocol = window.location.protocol;
    return `${protocol}//${host}:${port}/api`;
})();

// Global state
let currentEvent = null;
let allCandidates = [];
let allParticipants = [];
let allVotes = [];
let pointsChart = null;
let autoRefreshInterval = null;

// ============= INITIALIZATION =============
function initializeDashboard() {
    // Load initial data
    loadEventSettings();
    loadCandidates();
    loadParticipants();
    loadVotes();
    
    // Setup auto-refresh
    autoRefreshInterval = setInterval(() => {
        loadEventSettings();
        loadParticipants();
        loadVotes();
        updateResultsChart();
    }, 2000);
}

// ============= TAB NAVIGATION =============
document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Update active tab link
    document.querySelectorAll('.tab-link').forEach(link => {
        link.classList.remove('bg-blue-700', 'border-white');
        link.classList.add('hover:bg-blue-700', 'border-transparent');
    });
    event.target.closest('.tab-link').classList.add('bg-blue-700', 'border-white');
    event.target.closest('.tab-link').classList.remove('hover:bg-blue-700', 'border-transparent');

    // Update page title
    const titles = {
        'event-settings': 'Event Settings',
        'candidates': 'Manage Candidates',
        'control': 'Control & Monitor',
        'results': 'Live Results'
    };
    document.getElementById('page-title').textContent = titles[tabName] || 'Event Settings';

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');

    // Load data when switching tabs
    if (tabName === 'control') {
        loadParticipants();
    } else if (tabName === 'results') {
        loadResults();
        startAutoRefresh();
    } else {
        stopAutoRefresh();
    }
}

// ============= EVENT SETTINGS =============
async function loadEventSettings() {
    try {
        const response = await fetch(`${API_BASE}/event`);
        const data = await response.json();
        if (data.success) {
            currentEvent = data.data;
            document.getElementById('event-name').value = currentEvent.name;
            document.getElementById('event-max-participants').value = currentEvent.max_participants;
            document.getElementById('event-description').value = currentEvent.description;
            updateStatusBadge(currentEvent.status);
            generateQRCode();
        }
    } catch (error) {
        console.error('Error loading event:', error);
    }
}

function updateStatusBadge(status) {
    const badge = document.getElementById('status-badge');
    const statuses = {
        'setup': { text: 'Setup', color: 'bg-yellow-500' },
        'running': { text: 'Running', color: 'bg-green-500' },
        'closed': { text: 'Closed', color: 'bg-red-500' }
    };
    const statusInfo = statuses[status];
    badge.textContent = statusInfo.text;
    badge.className = `px-4 py-2 rounded-full text-white font-semibold ${statusInfo.color}`;
}

document.getElementById('save-event-btn').addEventListener('click', async () => {
    const eventData = {
        name: document.getElementById('event-name').value,
        max_participants: parseInt(document.getElementById('event-max-participants').value),
        description: document.getElementById('event-description').value
    };

    try {
        const response = await fetch(`${API_BASE}/event`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        const data = await response.json();
        if (data.success) {
            alert('Event settings saved successfully!');
            loadEventSettings();
        }
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Error saving event settings');
    }
});

document.getElementById('start-event-btn').addEventListener('click', async () => {
    if (allCandidates.length === 0) {
        alert('Please add at least one candidate before starting the event');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/event-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'running' })
        });
        const data = await response.json();
        if (data.success) {
            alert('Event started!');
            loadEventSettings();
        }
    } catch (error) {
        console.error('Error starting event:', error);
        alert('Error starting event');
    }
});

document.getElementById('end-event-btn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to end the event?')) return;

    try {
        const response = await fetch(`${API_BASE}/event-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'closed' })
        });
        const data = await response.json();
        if (data.success) {
            alert('Event ended!');
            loadEventSettings();
        }
    } catch (error) {
        console.error('Error ending event:', error);
        alert('Error ending event');
    }
});

// ============= QR CODE GENERATION =============
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    const qrUrl = `${window.location.origin}/vote.html`;
    
    // Simple QR code generation using QR Server API
    const encodedUrl = encodeURIComponent(qrUrl);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
    
    qrContainer.innerHTML = `<img src="${qrImageUrl}" alt="QR Code" class="w-full h-full">`;
}

document.getElementById('download-qr-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    const encodedUrl = encodeURIComponent(`${window.location.origin}/vote.html`);
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodedUrl}`;
    link.download = 'event-qr-code.png';
    link.click();
});

// ============= CANDIDATES MANAGEMENT =============
async function loadCandidates() {
    try {
        const response = await fetch(`${API_BASE}/candidates`);
        const data = await response.json();
        if (data.success) {
            allCandidates = data.data;
            displayCandidatesList();
        }
    } catch (error) {
        console.error('Error loading candidates:', error);
    }
}

function displayCandidatesList() {
    const container = document.getElementById('candidates-list');
    if (allCandidates.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No candidates added yet</p>';
        return;
    }

    container.innerHTML = allCandidates.map((candidate, index) => `
        <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
            <div class="flex-1">
                <div class="font-semibold text-gray-800">${candidate.name}</div>
                ${candidate.description ? `<div class="text-sm text-gray-600">${candidate.description}</div>` : ''}
            </div>
            <div class="flex gap-2">
                <button onclick="editCandidate('${candidate.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Edit
                </button>
                <button onclick="deleteCandidate('${candidate.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

document.getElementById('add-candidate-btn').addEventListener('click', async () => {
    const name = document.getElementById('candidate-name').value.trim();
    const description = document.getElementById('candidate-description').value.trim();

    if (!name) {
        alert('Please enter candidate name');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/candidates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('candidate-name').value = '';
            document.getElementById('candidate-description').value = '';
            loadCandidates();
        }
    } catch (error) {
        console.error('Error adding candidate:', error);
        alert('Error adding candidate');
    }
});

function editCandidate(candidateId) {
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (candidate) {
        document.getElementById('edit-candidate-id').value = candidate.id;
        document.getElementById('edit-candidate-name').value = candidate.name;
        document.getElementById('edit-candidate-description').value = candidate.description;
        document.getElementById('candidate-modal').classList.remove('hidden');
    }
}

async function deleteCandidate(candidateId) {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
        const response = await fetch(`${API_BASE}/candidates/${candidateId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadCandidates();
        }
    } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Error deleting candidate');
    }
}

document.getElementById('save-edit-btn').addEventListener('click', async () => {
    const candidateId = document.getElementById('edit-candidate-id').value;
    const name = document.getElementById('edit-candidate-name').value.trim();
    const description = document.getElementById('edit-candidate-description').value.trim();

    if (!name) {
        alert('Please enter candidate name');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/candidates/${candidateId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('candidate-modal').classList.add('hidden');
            loadCandidates();
        }
    } catch (error) {
        console.error('Error updating candidate:', error);
        alert('Error updating candidate');
    }
});

document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('candidate-modal').classList.add('hidden');
});

// ============= PARTICIPANTS MANAGEMENT =============
async function loadParticipants() {
    try {
        const response = await fetch(`${API_BASE}/participants`);
        const data = await response.json();
        if (data.success) {
            allParticipants = data.data;
            displayParticipantsList();
            updateParticipantsStats();
        }
    } catch (error) {
        console.error('Error loading participants:', error);
    }
}

function displayParticipantsList() {
    const container = document.getElementById('participants-list');
    if (allParticipants.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No participants registered yet</p>';
        return;
    }

    container.innerHTML = allParticipants.map(participant => `
        <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div class="flex-1">
                <div class="font-semibold text-gray-800">${participant.name}</div>
                <div class="text-sm text-gray-600">${participant.phone} | ${participant.email}</div>
                <div class="text-xs text-gray-500 mt-1">Registered: ${new Date(participant.created_at).toLocaleString('th-TH')}</div>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    ${participant.voted_at ? `
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">✓ Voted</span>
                        <div class="text-xs text-gray-600 mt-1">${new Date(participant.voted_at).toLocaleTimeString('th-TH')}</div>
                    ` : `
                        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">⏳ Pending</span>
                    `}
                </div>
                <button type="button" onclick="deleteParticipant('${participant.id}', '${participant.name}')" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm transition">
                    ✕ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateParticipantsStats() {
    const total = allParticipants.length;
    const voted = allParticipants.filter(p => p.voted_at).length;
    const pending = total - voted;

    document.getElementById('total-participants').textContent = total;
    document.getElementById('total-voted').textContent = voted;
    document.getElementById('total-pending').textContent = pending;
}

// ============= RESULTS =============
async function loadResults() {
    try {
        const response = await fetch(`${API_BASE}/results`);
        const data = await response.json();
        if (data.success) {
            displayTopResults(data.data.top_3);
            displayAllCandidates(data.data.all_candidates);
            updatePointsChart(data.data.all_candidates);
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

function displayTopResults(top3) {
    const positions = [
        { id: 'top1', emoji: '🥇' },
        { id: 'top2', emoji: '🥈' },
        { id: 'top3', emoji: '🥉' }
    ];

    positions.forEach((pos, index) => {
        const candidate = top3[index];
        document.getElementById(`${pos.id}-name`).textContent = candidate?.name || '-';
        document.getElementById(`${pos.id}-points`).textContent = `${candidate?.total_points || 0} pts`;
    });
}

function displayAllCandidates(candidates) {
    const container = document.getElementById('all-candidates-list');
    if (candidates.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No results yet</p>';
        return;
    }

    container.innerHTML = candidates.map((candidate, index) => `
        <div class="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
            <div class="flex items-center gap-4">
                <div class="text-2xl font-bold text-blue-600 w-8">#${index + 1}</div>
                <div>
                    <div class="font-semibold text-gray-800">${candidate.name}</div>
                    ${candidate.description ? `<div class="text-sm text-gray-600">${candidate.description}</div>` : ''}
                </div>
            </div>
            <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">${candidate.total_points}</div>
                <div class="text-xs text-gray-600">${candidate.vote_count} votes</div>
            </div>
        </div>
    `).join('');
}

function updatePointsChart(candidates) {
    const ctx = document.getElementById('points-chart');
    if (!ctx) return;

    if (pointsChart) {
        pointsChart.destroy();
    }

    const top10 = candidates.slice(0, 10);
    pointsChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: top10.map(c => c.name),
            datasets: [{
                label: 'Points',
                data: top10.map(c => c.total_points),
                backgroundColor: [
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(192, 192, 192, 0.8)',
                    'rgba(205, 127, 50, 0.8)',
                    ...Array(7).fill('rgba(33, 150, 243, 0.8)')
                ],
                borderColor: [
                    'rgba(255, 193, 7, 1)',
                    'rgba(192, 192, 192, 1)',
                    'rgba(205, 127, 50, 1)',
                    ...Array(7).fill('rgba(33, 150, 243, 1)')
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// ============= DELETE SINGLE PARTICIPANT =============
async function deleteParticipant(participantId, participantName) {
    if (!confirm(`Delete participant "${participantName}"?\n\nThis will also delete their vote.\n\nThis action cannot be undone!`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/delete-participant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participant_id: participantId })
        });
        const data = await response.json();
        if (data.success) {
            alert(`✅ Participant "${participantName}" deleted successfully!`);
            loadParticipants();
            loadResults();
        } else {
            alert('❌ Error deleting participant: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting participant:', error);
        alert('❌ Error deleting participant');
    }
}

// ============= AUTO REFRESH =============
function startAutoRefresh() {
    if (!autoRefreshInterval) {
        loadResults();
        autoRefreshInterval = setInterval(loadResults, 2000);
    }
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// ============= DELETE PARTICIPANTS =============
document.getElementById('delete-participants-btn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete all registered participants?\n\nThis will also delete all their votes.\n\nThis action cannot be undone!')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/delete-participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            alert('✅ All participants deleted successfully!');
            loadParticipants();
            loadResults();
        } else {
            alert('❌ Error deleting participants: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting participants:', error);
        alert('❌ Error deleting participants');
    }
});

// ============= CLEAR VOTES ONLY =============
document.getElementById('clear-votes-btn').addEventListener('click', async () => {
    if (!confirm('⚠️ CLEAR ALL VOTES?\n\nParticipants will remain registered but all votes will be deleted.\n\nThis action cannot be undone!')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/clear-votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            alert('✅ All votes cleared successfully!\n\nParticipants can vote again.');
            loadParticipants();
            loadResults();
        } else {
            alert('❌ Error clearing votes: ' + data.message);
        }
    } catch (error) {
        console.error('Error clearing votes:', error);
        alert('❌ Error clearing votes');
    }
});

// ============= CLEAR ALL DATA =============
document.getElementById('clear-all-btn').addEventListener('click', async () => {
    if (!confirm('⚠️ CLEAR ALL DATA?\n\nThis will delete:\n- All participants\n- All candidates\n- All votes\n\nEvent settings will be preserved.\n\nThis action cannot be undone!')) {
        return;
    }

    if (!confirm('🔴 ARE YOU ABSOLUTELY SURE?\n\nYou are about to delete ALL event data!\n\nClick OK only if you really want to do this.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reset-event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            alert('✅ All data cleared successfully!\n\nYou can now start a new event or reconfigure the current one.');
            // Reload everything
            loadEventSettings();
            loadCandidates();
            loadParticipants();
            loadResults();
        } else {
            alert('❌ Error clearing data: ' + data.message);
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('❌ Error clearing data');
    }
});
