# 🧪 TAS Event Vote System - Test Scenarios

## 📝 Testing Guide

Use these scenarios to test your voting system before the actual event.

---

## 🏁 Pre-Launch Testing

### Test 1: System Startup ✓
**Objective**: Verify both servers start correctly

```powershell
# Terminal 1
php -S localhost:8000 -t api/
# Expected: "Development Server (http://localhost:8000)"

# Terminal 2
npm start
# Expected: "TAS EVENT VOTE SYSTEM STARTED"
```

**Success Criteria**: Both servers running, no errors

---

### Test 2: Admin Dashboard Access ✓
**Objective**: Verify admin page loads

1. Open http://localhost:3000/admin
2. Check all tabs visible in sidebar
3. Load event settings successfully

**Success Criteria**: Page loads, no console errors

---

### Test 3: Event Setup ✓
**Objective**: Configure event

1. Go to Event Settings tab
2. Enter:
   - Event Name: "TAS Annual Meeting 2024"
   - Max Participants: 100
   - Description: "Year-end voting"
3. Click "Save Settings"
4. Verify settings saved

**Expected Result**: Settings saved and displayed

---

### Test 4: Add Candidates ✓
**Objective**: Create test candidates

1. Go to "Manage Candidates" tab
2. Add 5 test candidates:
   - Alice - Team Lead
   - Bob - Senior Developer
   - Carol - Designer
   - David - Project Manager
   - Eva - Marketing Manager
3. Verify all candidates appear in list

**Expected Result**: All candidates listed with edit/delete options

---

### Test 5: QR Code Generation ✓
**Objective**: Verify QR code works

1. Check "QR Code For Voting" section
2. See QR code displayed
3. Click "Download QR Code"
4. Verify image downloaded as PNG

**Expected Result**: QR code visible and downloadable

---

### Test 6: Start Event ✓
**Objective**: Change event status

1. In Event Settings, click "Start Event"
2. Verify status badge changes to "Running"
3. Status stays "Running" on reload

**Expected Result**: Status changed and persists

---

## 🗳️ Voter Testing

### Test 7: Registration ✓
**Objective**: Register test voter

1. Open http://localhost:3000/vote
2. Enter:
   - Name: "Test User 1"
   - Phone: "0812345678"
   - Email: "test1@example.com"
3. Click "Register & Start Voting"

**Expected Result**: 
- Registration succeeds
- Voting page appears
- Welcome message shows correct name

---

### Test 8: Prevent Duplicate Registration ✓
**Objective**: Verify duplicate phone check

1. Try registering with same phone: "0812345678"
2. Should show error: "Phone number already registered"

**Expected Result**: Duplicate registration blocked

---

### Test 9: Single Vote ✓
**Objective**: Vote for one candidate

1. See all 5 candidates
2. Click "🥇 Level 1 - 15 pts" for Alice
3. Button should highlight/change color
4. Click "Submit Your Votes"

**Expected Result**:
- Vote submitted successfully
- Success page appears
- "Thank You!" message shown

---

### Test 10: Multiple Votes ✓
**Objective**: Vote for multiple candidates

1. Register as "Test User 2" with phone "0812345679"
2. Select:
   - Alice - Level 1 (15 pts)
   - Bob - Level 2 (10 pts)
   - Carol - Level 3 (5 pts)
3. Submit votes

**Expected Result**:
- All 3 votes recorded
- Success page shown
- Each vote has correct points

---

### Test 11: Vote Levels ✓
**Objective**: Test changing vote levels

1. Register as "Test User 3"
2. Select Alice - Level 1
3. Change to Level 2 (click again)
4. Should change to Level 2
5. Remove vote by clicking again
6. Vote should be removed

**Expected Result**: Can change and remove votes before submitting

---

### Test 12: Form Validation ✓
**Objective**: Test input validation

1. Leave Name empty, try to register
   - Should show error "Please fill in all required fields"
2. Leave Phone empty, try to register
   - Should show error
3. Submit with valid data
   - Should succeed

**Expected Result**: Form validation working

---

## 📊 Results Testing

### Test 13: Admin Live Results ✓
**Objective**: View results in admin panel

1. In Admin Dashboard, go to "Live Results" tab
2. Should see:
   - Top 3 candidates (podium)
   - All candidates ranking
   - Statistics cards
   - Charts

**Expected Result**: All results display correctly

---

### Test 14: Public Results Page ✓
**Objective**: View public results page

1. Open http://localhost:3000/results
2. Should see:
   - Podium with top 3
   - Complete rankings
   - Statistics
   - Charts with real-time data

**Expected Result**: Results page shows all data correctly

---

### Test 15: Results Accuracy ✓
**Objective**: Verify calculations

**Test Data**:
- Alice: Level 1 = 15 pts, Level 2 = 10 pts → Total = 25 pts
- Bob: Level 2 = 10 pts → Total = 10 pts
- Carol: Level 3 = 5 pts, Level 3 = 5 pts → Total = 10 pts

**Verify**: 
1. Rankings show correct total points
2. Alice #1, Bob/Carol tied for #2
3. Charts display correct values

**Expected Result**: All calculations accurate

---

### Test 16: Real-Time Updates ✓
**Objective**: Verify auto-refresh

1. Open results page in 2 browsers
2. Register and vote in one browser
3. Watch second browser update automatically (3 sec refresh)
4. Results should match instantly

**Expected Result**: Real-time sync without manual refresh

---

## 👥 Multi-User Testing

### Test 17: Simultaneous Voters ✓
**Objective**: Test multiple voters at once

**Setup**:
1. Open voting page in 3 different browsers
2. Register each with different phone number
3. Have each vote for different candidates

**Process**:
- Voter 1: Votes for Alice (Lvl 1), Bob (Lvl 2)
- Voter 2: Votes for Bob (Lvl 1), Carol (Lvl 2)
- Voter 3: Votes for Carol (Lvl 1)

**Verify**:
1. All votes submit successfully
2. Results show combined totals
3. Each voter can vote independently

**Expected Result**: System handles concurrent voting

---

### Test 18: Participant Tracking ✓
**Objective**: Verify participant list in admin

1. Go to Admin → "Control & Monitor"
2. Check "Registered Participants" list
3. Should show:
   - All 3+ test participants
   - Their names and phones
   - Voted/Pending status
   - Vote timestamps

**Expected Result**: All participants tracked correctly

---

## 🔄 Admin Control Testing

### Test 19: Pause Event ✓
**Objective**: Stop voting

1. In Admin → Event Settings
2. Click "⏹️ End Event"
3. Status badge changes to "Closed"

**Expected Result**: Event status changes to closed

---

### Test 20: Edit Candidate ✓
**Objective**: Modify candidate info

1. In Admin → Manage Candidates
2. Click Edit on Alice
3. Change name to "Alice Updated"
4. Save changes
5. Verify change appears in list

**Expected Result**: Candidate updated successfully

---

### Test 21: Delete Candidate ✓
**Objective**: Remove candidate

1. In Admin → Manage Candidates
2. Click Delete on Eva
3. Confirm deletion
4. Eva should disappear from list

**Expected Result**: Candidate removed from system

---

## 📈 Data Testing

### Test 22: JSON File Creation ✓
**Objective**: Verify JSON files created

Check `/data/` folder contains:
1. `event.json` - Event settings
2. `candidates.json` - Candidate list
3. `participants.json` - Voter list
4. `votes.json` - All votes

**Verify**: Open files and check format is valid JSON

**Expected Result**: All JSON files properly formatted

---

### Test 23: Data Persistence ✓
**Objective**: Verify data survives restart

**Process**:
1. Record current vote counts
2. Restart PHP and Node servers
3. Check data still there
4. Vote counts unchanged

**Expected Result**: Data persists across restarts

---

## 🎓 Advanced Testing

### Test 24: Max Participants Limit ✓
**Objective**: Enforce participant limit

1. Set max participants to 5 in Event Settings
2. Register 5 participants successfully
3. Try to register 6th participant
4. Should show error: "Maximum participants reached"

**Expected Result**: Limit enforced correctly

---

### Test 25: Mobile Responsiveness ✓
**Objective**: Test on mobile devices

1. Open voting page on smartphone
2. Verify:
   - Text is readable
   - Buttons are easy to tap
   - Form fields are sized correctly
   - Submission works
3. Open results page on mobile
4. Verify charts display properly

**Expected Result**: Mobile experience is good

---

### Test 26: Browser Compatibility ✓
**Objective**: Test different browsers

Test on:
- Chrome
- Firefox
- Edge
- Safari (if available)

**Verify**: All features work in each browser

**Expected Result**: Cross-browser compatibility confirmed

---

## 🚨 Error Handling Testing

### Test 27: Network Error ✓
**Objective**: Handle server disconnection

1. Start voting
2. Stop PHP server mid-vote
3. Try to submit vote
4. Should show error message

**Expected Result**: Graceful error handling

---

### Test 28: Invalid Input ✓
**Objective**: Prevent invalid data

1. Try to vote without registration
2. Try to submit empty form
3. Try to enter invalid phone format
4. Try to vote after event closed

**Verify**: All prevented with appropriate messages

**Expected Result**: Input validation working

---

## ✅ Final Verification

### Checklist:
- ✓ Both servers start without errors
- ✓ Admin dashboard fully functional
- ✓ Voting page works on desktop and mobile
- ✓ Results update in real-time
- ✓ Multiple simultaneous voters work
- ✓ Point calculations accurate
- ✓ JSON data properly stored
- ✓ Data persists across restarts
- ✓ Event controls (start/stop) work
- ✓ Candidate management works
- ✓ QR code generates correctly
- ✓ All UI responsive and accessible
- ✓ No console errors

---

## 🎉 Ready for Production

Once all tests pass, your system is ready for the actual event!

---

## 📝 Test Report Template

```
Test Date: ___________
Tester: _______________
Total Tests: 28
Passed: ___
Failed: ___

Issues Found:
1. _________________
2. _________________

Recommendations:
_____________________
_____________________

Status: [ ] Ready | [ ] Needs Fixes
```

---

**Happy Testing! 🧪**
