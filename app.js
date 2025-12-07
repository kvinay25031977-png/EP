// --- 1. DATA STRUCTURE (The "Backend" Data Store) ---

// 1.1. Base Data Structure (Used only if localStorage is empty)
const BASE_ATTENDANCE_DATA = {
    teachers: [
        { id: 'T1', name: 'Bean' },
        { id: 'T2', name: 'Max' },
        { id: 'T3', name: 'Will' },
        { id: 'T4', name: 'Oggy' },
        { id: 'T5', name: 'Tom' },
        { id: 'T6', name: 'Ele' },
        { id: 'T7', name: 'Steve' }
    ],
    students: [
        { usn: '060', name: 'Vinay', section: 'A' },
        { usn: '007', name: 'Ajith', section: 'A' },
        { usn: '022', name: 'Balaji', section: 'A' },
        { usn: '051', name: 'Gulam', section: 'A' },
        { usn: '116', name: 'Mehaboob', section: 'B' },
        { usn: '183', name: 'Reddy', section: 'C' },
        { usn: '067', name: 'Khaja', section: 'B' },
        { usn: '171', name: 'Noor', section: 'C' },
        { usn: '062', name: 'Karun', section: 'B' },
        { usn: '024', name: 'Basu', section: 'A' },
        { usn: '058', name: 'Imran', section: 'A' },
        { usn: '141', name: 'Sagar', section: 'C' },
        { usn: '154', name: 'Shivu', section: 'C' },
        { usn: '050', name: 'Uday', section: 'C' }
    ],
    subjects: [
        { code: 'CS501', name: 'Software engineering', takenBy: 'T1' },
        { code: 'CS502', name: 'Computer Network', takenBy: 'T2' },
        { code: 'CS503', name: 'TOC ', takenBy: 'T3' },
        { code: 'CS504', name: 'AI ', takenBy: 'T4' },
        { code: 'CS505', name: 'RMIPR', takenBy: 'T5' },
        { code: 'CS506', name: 'EVS ', takenBy: 'T6' },
        { code: 'CS507', name: 'PE ', takenBy: 'T7' }
    ],
    // The initial records object is used if storage is empty.
    };

/**
 * 💡 KEY CHANGE: Load data from localStorage or use the base data.
 */
function loadAttendanceData() {
    const storedData = localStorage.getItem('ATTENDANCE_DATA');
    if (storedData) {
        // Parse the stored JSON back into a JavaScript object
        return JSON.parse(storedData);
    }
    // If nothing is stored, initialize localStorage with the base data
    saveAttendanceData(BASE_ATTENDANCE_DATA);
    return BASE_ATTENDANCE_DATA;
}

/**
 * 💡 NEW FUNCTION: Saves the current state of ATTENDANCE_DATA to localStorage.
 */
function saveAttendanceData(data) {
    // Stringify the JavaScript object into a JSON string and save it
    localStorage.setItem('ATTENDANCE_DATA', JSON.stringify(data));
}

// Global variable now holds the data loaded from storage (or the base data)
let ATTENDANCE_DATA = loadAttendanceData();


// --- 2. GLOBAL STATE ---
let currentUser = null;
let userType = null;
const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD


// Shows the login type form (Teacher/Student)
function showLogin(type) {
    const form = document.getElementById('login-form');
    const options = document.querySelector('.login-options');
    const heading = document.getElementById('login-type-heading');
    const label = document.getElementById('identifier-label');
    const identifierInput = document.getElementById('identifier');
    document.getElementById('login-error').textContent = '';

    userType = type;
    heading.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Login`;

    if (type === 'teacher') {
        label.textContent = 'Teacher ID:';
        identifierInput.placeholder = 'e.g., TX';
    } else { // student
        label.textContent = 'USN (e.g., 0XX):';
        identifierInput.placeholder = 'USN (String)';
    }

    options.classList.add('hidden');
    form.classList.remove('hidden');
}

// Resets back to the login options
function showLoginOptions() {
    document.getElementById('login-form').classList.add('hidden');
    document.querySelector('.login-options').classList.remove('hidden');
    document.getElementById('login-form').reset();
    currentUser = null;
    userType = null;
    // Re-load data just in case a background change occurred (optional, but robust)
    ATTENDANCE_DATA = loadAttendanceData(); 
}

// Handles form submission for login
function handleLogin(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const identifier = document.getElementById('identifier').value.trim();
    const errorMsg = document.getElementById('login-error');
    errorMsg.textContent = '';

    if (userType === 'teacher') {
        currentUser = ATTENDANCE_DATA.teachers.find(t =>
            t.name.toLowerCase() === name.toLowerCase() && t.id === identifier
        );
    } else { // student
        currentUser = ATTENDANCE_DATA.students.find(s =>
            s.name.toLowerCase() === name.toLowerCase() && s.usn === identifier
        );
    }

    if (currentUser) {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('dashboard-view').classList.remove('hidden');
        renderDashboard();
    } else {
        errorMsg.textContent = `Invalid ${userType} Name or ${userType === 'teacher' ? 'ID' : 'USN'}. Please try again.`;
    }
}

// --- 4. DASHBOARD RENDERER ---

function renderDashboard() {
    const dashboard = document.getElementById('dashboard-view');
    dashboard.innerHTML = `<h2>Welcome, ${currentUser.name}!</h2>`;

    if (userType === 'teacher') {
        renderTeacherDashboard(dashboard);
    } else {
        renderStudentDashboard(dashboard);
    }
}

// --- 5. TEACHER FUNCTIONS (Data Entry) ---

function renderTeacherDashboard(dashboard) {
    // 1. Get subjects taught by the logged-in teacher
    const mySubjects = ATTENDANCE_DATA.subjects.filter(s => s.takenBy === currentUser.id);

    if (mySubjects.length === 0) {
        dashboard.innerHTML += '<p>You are not assigned to any subjects.</p>';
        return;
    }

    dashboard.innerHTML += `
        <h3>Your Subjects:</h3>
        <p>Select a subject and a section to mark today's attendance (${todayDate}).</p>
        <div class="subject-selection">
            <select id="subject-select" onchange="renderAttendanceForm()">
                <option value="">-- Select Subject --</option>
                ${mySubjects.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('')}
            </select>
            <select id="section-select" onchange="renderAttendanceForm()">
                <option value="">-- Select Section --</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
            </select>
        </div>
        <div id="attendance-form-container"></div>
           <a href="index.html">  <button onclick="showLoginOptions()">Logout</button></a>
    `;
}

function renderAttendanceForm() {
    const subjectCode = document.getElementById('subject-select').value;
    const section = document.getElementById('section-select').value;
    const container = document.getElementById('attendance-form-container');
    container.innerHTML = '';

    if (!subjectCode || !section) return;

    // Filter students by section
    const studentsInSection = ATTENDANCE_DATA.students.filter(s => s.section === section);

    const subjectName = ATTENDANCE_DATA.subjects.find(s => s.code === subjectCode)?.name || subjectCode;

    let formHTML = `<form onsubmit="saveAttendance(event, '${subjectCode}', '${section}')">
        <h4>Mark Attendance for Section ${section} in ${subjectName} (Today)</h4>
        <table>
            <thead>
                <tr>
                    <th>USN</th>
                    <th>Name</th>
                    <th>P1 (Mon/Tues)</th>
                    <th>P2 (Weds/Thurs)</th>
                    <th>P3 (Fri)</th>
                    <th>P4 (Sat)</th>
                </tr>
            </thead>
            <tbody>`;

    // Create rows for each student
    studentsInSection.forEach(student => {
        const studentUSN = student.usn;

        // Find existing record for today, if any
        const existingRecord = ATTENDANCE_DATA.records[studentUSN]?.[subjectCode]?.find(r => r.date === todayDate);

        formHTML += `
            <tr>
                <td>${student.usn}</td>
                <td>${student.name}</td>
                ${[1, 2, 3, 4].map(period => `
                    <td>
                        <div class="attendance-mark">
                            <label>
                                <input type="radio" name="${studentUSN}_P${period}" value="P" required
                                    ${existingRecord?.periods[period-1] === 'P' ? 'checked' : ''}> P
                            </label>
                            <label>
                                <input type="radio" name="${studentUSN}_P${period}" value="A" required
                                    ${existingRecord?.periods[period-1] === 'A' ? 'checked' : ''}> A
                            </label>
                        </div>
                    </td>
                `).join('')}
            </tr>
        `;
    });

    formHTML += `</tbody></table>
        <button type="submit" style="margin-top: 20px;">Save Daily Attendance</button>
    </form>`;

    container.innerHTML = formHTML;
}

// Saves the attendance data
function saveAttendance(event, subjectCode, section) {
    event.preventDefault();
    const form = event.target;
    const studentsInSection = ATTENDANCE_DATA.students.filter(s => s.section === section);

    studentsInSection.forEach(student => {
        const studentUSN = student.usn;
        const periods = [];
        let isComplete = true;

        for(let i = 1; i <= 4; i++) {
            const periodName = `${studentUSN}_P${i}`;
            const selected = form.querySelector(`input[name="${periodName}"]:checked`);
            if (selected) {
                periods.push(selected.value);
            } else {
                isComplete = false; // Should not happen with 'required' but good practice
            }
        }

        if (isComplete) {
            // Initialize records if needed
            if (!ATTENDANCE_DATA.records[studentUSN]) {
                ATTENDANCE_DATA.records[studentUSN] = {};
            }
            if (!ATTENDANCE_DATA.records[studentUSN][subjectCode]) {
                ATTENDANCE_DATA.records[studentUSN][subjectCode] = [];
            }

            // Check if record for today exists and update/create it
            const existingIndex = ATTENDANCE_DATA.records[studentUSN][subjectCode].findIndex(r => r.date === todayDate);

            if (existingIndex !== -1) {
                // Update
                ATTENDANCE_DATA.records[studentUSN][subjectCode][existingIndex].periods = periods;
            } else {
                // Create new
                ATTENDANCE_DATA.records[studentUSN][subjectCode].push({ date: todayDate, periods: periods });
            }
        }
    });
    
    /**
     * 💡 KEY CHANGE: Save the updated ATTENDANCE_DATA to localStorage after every update.
     */
    saveAttendanceData(ATTENDANCE_DATA);

    alert(`Attendance for ${subjectCode} in Section ${section} saved successfully for ${todayDate}! Data is now persistent.`);
    renderAttendanceForm(); // Re-render to show updated status/checked boxes
}


// --- 6. STUDENT FUNCTIONS (View Attendance) ---

function renderStudentDashboard(dashboard) {
    const studentUSN = currentUser.usn;
    // Ensure we load the freshest data before rendering the student view
    ATTENDANCE_DATA = loadAttendanceData(); 
    const studentRecords = ATTENDANCE_DATA.records[studentUSN] || {};

    // Check if there are any records at all
    const hasRecords = Object.keys(studentRecords).length > 0;

    dashboard.innerHTML += `
        <h3>Your Attendance Analysis (Overall Percentage)</h3>
        <p>Showing records for USN: **${studentUSN}**</p>
        <div id="student-percentage-analysis">
            ${hasRecords ? generateMonthlyPercentage(studentRecords) : '<p>No attendance records found yet.</p>'}
        </div>

        <h3>Your Daily Attendance History</h3>
        <div id="student-daily-history">
            ${hasRecords ? generateDailyHistory(studentRecords) : ''}
        </div>

      <a href="index.html">  <button onclick="showLoginOptions()">Logout</button></a>
    `;
}

function generateMonthlyPercentage(studentRecords) {
    let html = '<table><thead><tr><th>Subject</th><th>Total Classes</th><th>Attended</th><th>Percentage</th></tr></thead><tbody>';

    for (const subjectCode in studentRecords) {
        const subjectName = ATTENDANCE_DATA.subjects.find(s => s.code === subjectCode)?.name || subjectCode;
        const records = studentRecords[subjectCode];

        let totalPeriods = 0;
        let presentPeriods = 0;

        // Iterate through all daily records for the subject
        records.forEach(dayRecord => {
            totalPeriods += dayRecord.periods.length;
            presentPeriods += dayRecord.periods.filter(p => p === 'P').length;
        });

        const percentage = totalPeriods > 0
            ? ((presentPeriods / totalPeriods) * 100).toFixed(2)
            : '0.00';

        const percentageClass = parseFloat(percentage) >= 75 ? 'present' : 'absent';

        html += `
            <tr>
                <td>${subjectName}</td>
                <td>${totalPeriods}</td>
                <td>${presentPeriods}</td>
                <td class="${percentageClass}">${percentage}%</td>
            </tr>
        `;
    }

    html += '</tbody></table>';
    return html;
}

function generateDailyHistory(studentRecords) {
    let html = '';

    for (const subjectCode in studentRecords) {
        const subjectName = ATTENDANCE_DATA.subjects.find(s => s.code === subjectCode)?.name || subjectCode;
        const records = studentRecords[subjectCode];

        html += `<h4>${subjectName} (${subjectCode})</h4>
            <table>
                <thead>
                    <tr><th>Date</th><th>P1</th><th>P2</th><th>P3</th><th>P4</th></tr>
                </thead>
                <tbody>`;

        // Sort records by date descending
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        records.forEach(dayRecord => {
            html += `<tr><td>${dayRecord.date}</td>`;
            dayRecord.periods.forEach(p => {
                const statusClass = p === 'P' ? 'present' : 'absent';
                html += `<td class="${statusClass}">${p}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;
    }

    return html;
}

// --- 7. INITIAL SETUP ---

// Ensure the initial login options are visible when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if the current view is hidden and show the initial options
    const loginView = document.getElementById('login-view');
    const options = document.querySelector('.login-options');
    if (loginView && options) {
        loginView.classList.remove('hidden');
        options.classList.remove('hidden');
        document.getElementById('dashboard-view').classList.add('hidden');
    }
});
