# Security & Vote Protection Features

## Overview
This document describes the security enhancements and vote protection mechanisms implemented in the TAS Event Vote System.

---

## 1. Vote Duplicate Prevention

### Feature: Prevent Voting Same Candidate Twice

**Problem**: Users could vote for the same candidate multiple times with different levels (e.g., Candidate A with Level 1 AND Level 2), resulting in duplicated votes.

**Solution**: Implemented multi-layer validation to prevent duplicate votes per candidate.

### Frontend Validation (public/js/vote.js)

#### Initial Load Check
When user returns to voting page with a stored token:
- System fetches participant data from API
- Checks if `voted_at` timestamp exists
- If already voted: Redirects to success page (prevents re-voting)
- If token valid but not voted: Loads voting interface

```javascript
// Lines 340-368 in vote.js
window.addEventListener('load', () => {
    const token = localStorage.getItem('participantToken');
    if (token) {
        fetch(`${API_BASE}/participants`)
            .then(res => res.json())
            .then(data => {
                const participant = data.data.find(p => p.token === token);
                if (participant && participant.voted_at) {
                    // Already voted - show success page
                    showSuccessMessage();
                    return;
                }
                // Not voted yet - proceed to voting
                proceedToVoting();
            });
    } else {
        loadEventInfo();
    }
});
```

#### Vote Submission Logic
The `voteCandidate()` function prevents duplicate candidates:

```javascript
// Lines 218-248 in vote.js
function voteCandidate(candidateId, level) {
    const currentLevel = userVotes[candidateId];
    
    if (currentLevel === level) {
        // Toggle off if clicking same level
        delete userVotes[candidateId];
    } else {
        // Auto-remove if voting different level for same candidate
        if (currentLevel !== undefined && currentLevel !== level) {
            delete userVotes[candidateId];
        }
        
        // Check level uniqueness (one level per voter)
        const levelAlreadyUsed = Object.values(userVotes).some(l => l === level);
        if (levelAlreadyUsed) {
            alert(`❌ ${levelNames[level]} is already assigned!`);
            return;
        }
        
        userVotes[candidateId] = level;
    }
    displayCandidates();
}
```

### Backend Validation (api/index.php)

When user submits votes, API performs final check:

```php
// Lines 183-187 in api/index.php
// Check if already voted
foreach ($votes as $v) {
    if ($v['participant_id'] === $participant['id'] && 
        $v['candidate_id'] === $data['candidate_id']) {
        response(400, 'Already voted for this candidate');
    }
}
```

### Data Model Enhancement

The `participants.json` now includes `voted_at` timestamp:

```json
{
    "id": "65a4b2c1",
    "name": "John Doe",
    "phone": "0812345678",
    "email": "john@example.com",
    "token": "abc123xyz789",
    "created_at": "2024-12-04 10:00:00",
    "voted_at": "2024-12-04 10:05:00"
}
```

### Validation Flow Chart

```
User Opens /vote Page
    ↓
Check localStorage token?
    ├─ No Token → Show Registration Form
    ├─ Has Token → Fetch participant by token
    │   ├─ Token not found → Clear token, show registration
    │   ├─ Token found & voted_at exists → Show Success Page ✅
    │   └─ Token found & NO voted_at → Load Voting Interface
    │       ↓
    │   User Selects Candidate/Level
    │       ↓
    │   voteCandidate(id, level)
    │       ├─ Check: Is different level for SAME candidate? 
    │       │   YES → Auto-replace previous vote
    │       │   NO → Continue
    │       ├─ Check: Is this level already used elsewhere?
    │       │   YES → Alert & Return ❌
    │       │   NO → Add vote to userVotes object
    │       └─ Display UI update ✅
    │       ↓
    │   User Submits Votes
    │       ↓
    │   For each vote: POST /api/votes
    │       ├─ Backend checks: voted_at already set?
    │       │   YES → Error 400 "Already voted" ❌
    │       │   NO → Continue
    │       ├─ Backend checks: duplicate vote_id + candidate_id?
    │       │   YES → Error 400 "Already voted for this" ❌
    │       │   NO → Save vote, set voted_at ✅
    │       └─ Response 201 Success
    │       ↓
    │   Show Success Message ✅
```

### Testing the Feature

1. **Test Same Candidate with Different Levels**:
   - Register with name "Test User"
   - Click Candidate A, Level 1 (15pts) - should show selected
   - Click Candidate A, Level 2 (10pts) - should replace Level 1
   - Check userVotes object - should only have one entry for Candidate A

2. **Test Level Uniqueness**:
   - Click Candidate A, Level 1 (15pts)
   - Click Candidate B, Level 1 (15pts) - should show alert "Level 1 already assigned!"
   - Candidate B should NOT be selected

3. **Test Re-entry Prevention**:
   - Submit votes successfully
   - Refresh page
   - Should see "✅ Thank you for voting!" message
   - Cannot re-enter voting page

4. **Test API Backend**:
   - Try to manually POST duplicate vote via API
   - Should receive error: "Already voted for this candidate"

---

## 2. Admin Page Password Protection

### Feature: Secure Admin Dashboard Access

**Problem**: Anyone with access to the network could open `/admin` page and manage the event, delete data, etc.

**Solution**: Implemented password-protected admin dashboard with authentication modal.

### Authentication Flow

#### HTML Structure (public/admin.html)

Added password modal at the start of page:

```html
<!-- Lines 14-28 in admin.html -->
<div id="password-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-8 w-96 shadow-2xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Admin Access</h2>
        <p class="text-gray-600 mb-6">Enter the admin password to continue</p>
        <input 
            type="password" 
            id="admin-password-input" 
            placeholder="Enter password" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autocomplete="off"
        >
        <button 
            id="admin-login-btn" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
            Enter
        </button>
        <p id="password-error" class="text-red-500 text-sm mt-3 hidden"></p>
    </div>
</div>

<!-- Main dashboard hidden until authenticated -->
<div id="admin-container" class="hidden min-h-screen flex">
    <!-- All admin content here -->
</div>
```

#### JavaScript Authentication (public/js/admin.js)

Added at the very start of admin.js:

```javascript
// Lines 1-29 in admin.js
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
        // Password correct
        document.getElementById('password-modal').style.display = 'none';
        document.getElementById('admin-container').classList.remove('hidden');
        passwordInput.value = '';
        errorMsg.classList.add('hidden');
        // Initialize dashboard
        initializeDashboard();
    } else {
        // Password incorrect
        errorMsg.textContent = '❌ Invalid password';
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}
```

### Authentication Flow Chart

```
User Opens /admin Page
    ↓
Page Loads
    ├─ Password Modal shows (z-index: 50)
    └─ Admin Dashboard hidden
    ↓
User Enters Password
    ├─ Click "Enter" button OR Press Enter key
    ↓
authenticateAdmin() function runs
    ├─ Get input value
    ├─ Check: password === ADMIN_PASSWORD?
    │   ├─ YES → 
    │   │   ├─ Hide modal
    │   │   ├─ Show admin-container (remove hidden class)
    │   │   ├─ Clear input field
    │   │   ├─ Call initializeDashboard()
    │   │   │   ├─ loadEventSettings()
    │   │   ├─ loadCandidates()
    │   │   ├─ loadParticipants()
    │   │   ├─ loadVotes()
    │   │   └─ Start 2-second auto-refresh interval
    │   │   ✅ Dashboard fully loaded and functional
    │   │
    │   └─ NO → 
    │       ├─ Show error message "❌ Invalid password"
    │       ├─ Clear input field
    │       ├─ Focus input for retry
    │       └─ User can try again
    └─ Loop until correct password
```

### Security Considerations

#### Current Implementation (Default)
- Default password: `tas2024` (hardcoded in admin.js line 1)
- Password stored in client-side JavaScript (not ideal)
- Visible in browser dev tools

#### Production Recommendations

**Improve Security**:

1. **Move password to backend**:
```php
// In api/index.php
POST /api/admin-login
{
    "password": "user_input"
}
// Returns token for this session
```

2. **Use token-based admin auth**:
- Store token in localStorage
- Check token validity in admin.js
- Clear token on page unload

3. **Hash the password**:
```php
// Store in api/config.php
define('ADMIN_PASSWORD_HASH', password_hash('tas2024', PASSWORD_DEFAULT));

// Verify
if (password_verify($input, ADMIN_PASSWORD_HASH)) { ... }
```

4. **Add admin login endpoint**:
```javascript
// admin.js
async function authenticateAdmin() {
    const response = await fetch(`${API_BASE}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (data.success) {
        localStorage.setItem('adminToken', data.token);
        // Load dashboard
    }
}
```

### Testing the Feature

1. **Test Correct Password**:
   - Open http://localhost:3000/admin
   - Modal shows with password input
   - Type: `tas2024`
   - Press Enter
   - Modal disappears, dashboard loads ✅

2. **Test Incorrect Password**:
   - Open http://localhost:3000/admin
   - Type: `wrong`
   - Click Enter
   - Error message shows: "❌ Invalid password"
   - Input clears, can retry ✅

3. **Test Enter Key**:
   - Open http://localhost:3000/admin
   - Type: `tas2024`
   - Press Enter (not clicking button)
   - Should authenticate ✅

4. **Test Input Clearing**:
   - Type password, enter wrong one
   - Error shows, input clears
   - Should be empty for next attempt ✅

### Changing Admin Password

**To change password**:
1. Edit `public/js/admin.js` line 1:
```javascript
const ADMIN_PASSWORD = 'your_new_password';
```

2. Restart Docker:
```bash
docker compose restart frontend
```

3. Clear browser cache (localStorage might have old session)

---

## Data Security Summary

| Layer | Protection | Status |
|-------|-----------|--------|
| **Vote Duplication** | Prevent same candidate twice | ✅ Implemented |
| **Vote Level Uniqueness** | One level per voter | ✅ Implemented |
| **Already Voted Check** | Check `voted_at` timestamp | ✅ Implemented |
| **Admin Page Access** | Password protection modal | ✅ Implemented |
| **API Validation** | Backend duplicate check | ✅ Implemented |
| **Password Hashing** | Client-side (TODO: move to backend) | ⚠️ Not implemented |
| **Token-based Admin Auth** | Session tokens for admin | ⚠️ Not implemented |
| **HTTPS Encryption** | Production deployment | ⚠️ Not implemented |

---

## Files Modified

- ✅ `public/js/vote.js` - Enhanced initialization & voteCandidate function
- ✅ `public/admin.html` - Added password modal
- ✅ `public/js/admin.js` - Added authentication logic
- ✅ `api/index.php` - Already had duplicate vote prevention

## Related Files

- `api/index.php` - Vote submission validation
- `public/vote.html` - Voting interface
- `docker-compose.yml` - Container configuration

---

## Testing Checklist

- [ ] Test voting same candidate with different levels (should auto-replace)
- [ ] Test voting same level twice (should show alert)
- [ ] Test submitting votes successfully
- [ ] Test refreshing page after voting (should show success message)
- [ ] Test opening /admin page (password modal appears)
- [ ] Test correct admin password (dashboard loads)
- [ ] Test wrong admin password (error message shows)
- [ ] Test Enter key in password field (should authenticate)
- [ ] Test browser back button after voting (should not allow re-voting)
- [ ] Test with multiple users simultaneously (no vote conflicts)

---

## Future Enhancements

1. Move admin password to backend API
2. Implement password hashing with bcrypt
3. Add admin session tokens with expiration
4. Add 2FA (Two-Factor Authentication) for admin
5. Add audit log of admin actions
6. Implement IP whitelist for admin access
7. Add rate limiting on vote submission
8. Implement CSRF tokens for all POST requests
9. Add encryption for sensitive data in JSON files
10. Use database instead of JSON files
