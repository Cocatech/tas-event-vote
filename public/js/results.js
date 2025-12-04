// API Configuration - dynamically set based on current location
const API_BASE = (() => {
    const host = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? 443 : 80);
    const protocol = window.location.protocol;
    return `${protocol}//${host}:${port}/api`;
})();

// Global state
let allResults = [];
let autoRefreshInterval = null;
let pointsChart = null;
let votesChart = null;

// ============= AUTO REFRESH =============
function startAutoRefresh() {
    loadResults();
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(loadResults, 3000);
}

function updateLastUpdated() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('last-update').textContent = `${hours}:${minutes}:${seconds}`;
}

// ============= LOAD RESULTS =============
async function loadResults() {
    try {
        const response = await fetch(`${API_BASE}/results`);
        const data = await response.json();
        
        if (data.success) {
            allResults = data.data.all_candidates;
            updateAllDisplays(data.data.top_3, data.data.all_candidates);
            updateLastUpdated();
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// ============= UPDATE ALL DISPLAYS =============
function updateAllDisplays(top3, allCandidates) {
    displayTopPodium(top3);
    displayFullRankings(allCandidates);
    displayStats(allCandidates);
    updateCharts(allCandidates);
}

// ============= DISPLAY TOP PODIUM =============
function displayTopPodium(top3) {
    const positions = [
        { id: '1', element: 'top1' },
        { id: '2', element: 'top2' },
        { id: '3', element: 'top3' }
    ];

    positions.forEach((pos, idx) => {
        const candidate = top3[idx];
        if (candidate) {
            document.getElementById(`${pos.element}-name`).textContent = candidate.name;
            document.getElementById(`${pos.element}-desc`).textContent = candidate.description || '—';
            document.getElementById(`${pos.element}-points`).textContent = candidate.total_points;
            document.getElementById(`${pos.element}-votes`).textContent = `${candidate.vote_count} vote${candidate.vote_count !== 1 ? 's' : ''}`;
        } else {
            document.getElementById(`${pos.element}-name`).textContent = '—';
            document.getElementById(`${pos.element}-desc`).textContent = '—';
            document.getElementById(`${pos.element}-points`).textContent = '0';
            document.getElementById(`${pos.element}-votes`).textContent = '0 votes';
        }
    });
}

// ============= DISPLAY FULL RANKINGS =============
function displayFullRankings(allCandidates) {
    const container = document.getElementById('full-rankings');
    
    if (allCandidates.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No voting data yet</p>';
        return;
    }

    container.innerHTML = allCandidates.map((candidate, index) => {
        let medalEmoji = '  ';
        if (index === 0) medalEmoji = '🥇';
        else if (index === 1) medalEmoji = '🥈';
        else if (index === 2) medalEmoji = '🥉';

        const bgColor = index < 3 ? 'bg-blue-50' : 'bg-gray-50';
        const borderColor = index < 3 ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-300';

        return `
            <div class="${bgColor} ${borderColor} p-4 rounded-lg">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4 flex-1">
                        <div class="text-2xl">${medalEmoji}</div>
                        <div>
                            <div class="text-lg font-bold text-gray-800">#${index + 1} - ${candidate.name}</div>
                            ${candidate.description ? `<div class="text-xs text-gray-600">${candidate.description}</div>` : ''}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-blue-600">${candidate.total_points}</div>
                        <div class="text-xs text-gray-600">${candidate.vote_count} votes</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============= DISPLAY STATS =============
function displayStats(allCandidates) {
    document.getElementById('stat-candidates').textContent = allCandidates.length;
    
    const totalVotes = allCandidates.reduce((sum, c) => sum + c.vote_count, 0);
    document.getElementById('stat-votes').textContent = totalVotes;
    
    const totalPoints = allCandidates.reduce((sum, c) => sum + c.total_points, 0);
    document.getElementById('stat-points').textContent = totalPoints;
    
    const avgPoints = totalVotes > 0 ? (totalPoints / totalVotes).toFixed(1) : '0';
    document.getElementById('stat-avg').textContent = avgPoints;

    // Quick stats
    if (allCandidates.length > 0) {
        const highest = allCandidates[0];
        document.getElementById('qs-highest').textContent = `${highest.name} (${highest.total_points}pts)`;
        
        const mostVoted = [...allCandidates].sort((a, b) => b.vote_count - a.vote_count)[0];
        document.getElementById('qs-most-voted').textContent = `${mostVoted.name} (${mostVoted.vote_count})`;
        
        const lead = allCandidates.length > 1 
            ? allCandidates[0].total_points - allCandidates[1].total_points
            : 0;
        document.getElementById('qs-lead').textContent = `${lead} points`;
    }
}

// ============= UPDATE CHARTS =============
function updateCharts(allCandidates) {
    const top10 = allCandidates.slice(0, 10);

    // Points Chart
    updatePointsChart(top10);
    
    // Votes Chart
    updateVotesChart(top10);
}

function updatePointsChart(candidates) {
    const ctx = document.getElementById('points-chart');
    if (!ctx) return;

    if (pointsChart) {
        pointsChart.destroy();
    }

    pointsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: candidates.map(c => c.name),
            datasets: [{
                label: 'Total Points',
                data: candidates.map(c => c.total_points),
                backgroundColor: [
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(192, 192, 192, 0.8)',
                    'rgba(205, 127, 50, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(156, 39, 176, 0.8)',
                    'rgba(0, 188, 212, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(233, 30, 99, 0.8)'
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'x',
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function updateVotesChart(candidates) {
    const ctx = document.getElementById('votes-chart');
    if (!ctx) return;

    if (votesChart) {
        votesChart.destroy();
    }

    // Create pie chart
    votesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: candidates.map(c => c.name),
            datasets: [{
                data: candidates.map(c => c.vote_count),
                backgroundColor: [
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(192, 192, 192, 0.8)',
                    'rgba(205, 127, 50, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(244, 67, 54, 0.8)',
                    'rgba(156, 39, 176, 0.8)',
                    'rgba(0, 188, 212, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(233, 30, 99, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 15 }
                }
            }
        }
    });
}

// ============= NAVIGATION =============
function goToVoting() {
    window.location.href = 'vote.html';
}

function goToAdmin() {
    window.location.href = 'admin.html';
}

// ============= INITIALIZATION =============
window.addEventListener('load', () => {
    startAutoRefresh();
});

// Stop refresh when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
    } else {
        startAutoRefresh();
    }
});
