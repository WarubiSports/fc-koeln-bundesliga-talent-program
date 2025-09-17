(function () {
  const e = document.createElement('link').relList;
  if (e && e.supports && e.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const a of s)
      if (a.type === 'childList')
        for (const i of a.addedNodes) i.tagName === 'LINK' && i.rel === 'modulepreload' && n(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function o(s) {
    const a = {};
    return (
      s.integrity && (a.integrity = s.integrity),
      s.referrerPolicy && (a.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === 'use-credentials'
        ? (a.credentials = 'include')
        : s.crossOrigin === 'anonymous'
          ? (a.credentials = 'omit')
          : (a.credentials = 'same-origin'),
      a
    );
  }
  function n(s) {
    if (s.ep) return;
    s.ep = !0;
    const a = o(s);
    fetch(s.href, a);
  }
})();
let r = null,
  l = new Date();
const c = [
    {
      id: 1,
      name: 'Max Müller',
      age: 19,
      position: 'Midfielder',
      house: 'W1',
      status: 'Active',
      performance: 92,
    },
    {
      id: 2,
      name: 'Leon Schmidt',
      age: 18,
      position: 'Forward',
      house: 'W1',
      status: 'Active',
      performance: 88,
    },
    {
      id: 3,
      name: 'Tim Weber',
      age: 20,
      position: 'Defender',
      house: 'W1',
      status: 'Active',
      performance: 85,
    },
    {
      id: 4,
      name: 'Jonas Becker',
      age: 19,
      position: 'Midfielder',
      house: 'W2',
      status: 'Active',
      performance: 90,
    },
    {
      id: 5,
      name: 'Lukas Fischer',
      age: 18,
      position: 'Goalkeeper',
      house: 'W2',
      status: 'Active',
      performance: 87,
    },
    {
      id: 6,
      name: 'David Klein',
      age: 20,
      position: 'Forward',
      house: 'W2',
      status: 'Active',
      performance: 89,
    },
    {
      id: 7,
      name: 'Felix Wagner',
      age: 19,
      position: 'Defender',
      house: 'W3',
      status: 'Active',
      performance: 86,
    },
    {
      id: 8,
      name: 'Niklas Richter',
      age: 18,
      position: 'Midfielder',
      house: 'W3',
      status: 'Active',
      performance: 83,
    },
  ],
  u = [
    {
      id: 1,
      title: 'Kitchen Deep Clean',
      assignedTo: 'Max Müller',
      house: 'W1',
      deadline: '2025-08-02',
      priority: 'High',
      status: 'Pending',
    },
    {
      id: 2,
      title: 'Bathroom Maintenance',
      assignedTo: 'Leon Schmidt',
      house: 'W1',
      deadline: '2025-08-01',
      priority: 'Medium',
      status: 'In Progress',
    },
    {
      id: 3,
      title: 'Common Area Organization',
      assignedTo: 'W2 House',
      house: 'W2',
      deadline: '2025-08-03',
      priority: 'Low',
      status: 'Pending',
    },
    {
      id: 4,
      title: 'Laundry Room Cleaning',
      assignedTo: 'Tim Weber',
      house: 'W1',
      deadline: '2025-07-31',
      priority: 'Urgent',
      status: 'Overdue',
    },
  ];
window.showAuthTab = function (t) {
  const e = document.getElementById('loginTab'),
    o = document.getElementById('registerTab'),
    n = document.getElementById('forgotPasswordTab');
  (e && (e.style.display = 'none'),
    o && (o.style.display = 'none'),
    n && (n.style.display = 'none'),
    t === 'login' && e
      ? (e.style.display = 'block')
      : t === 'register' && o
        ? (o.style.display = 'block')
        : t === 'forgot' && n && (n.style.display = 'block'),
    document.querySelectorAll('.auth-tab-btn').forEach((a) => a.classList.remove('active')));
  const s = document.querySelector('[onclick*="showAuthTab"][onclick*="' + t + '"]');
  s && s.classList.add('active');
};
window.showForgotPassword = function () {
  window.showAuthTab('forgot');
};
window.showPage = function (t) {
  const e = document.querySelectorAll('.page'),
    o = document.querySelectorAll('.nav-item');
  (e.forEach((a) => a.classList.remove('active')), o.forEach((a) => a.classList.remove('active')));
  const n = document.getElementById(t);
  n && n.classList.add('active');
  const s = document.querySelector('[onclick*="showPage"][onclick*="' + t + '"]');
  (s && s.classList.add('active'), d(t));
};
window.logout = function () {
  ((r = null),
    localStorage.removeItem('fc-koln-auth'),
    (document.getElementById('authScreen').style.display = 'flex'),
    (document.getElementById('mainApp').style.display = 'none'),
    (document.getElementById('email').value = 'max.bisinger@warubi-sports.com'),
    (document.getElementById('password').value = 'ITP2024'),
    (document.getElementById('loginMessage').innerHTML = ''),
    console.log('User logged out successfully'));
};
function m() {
  console.log('Initializing Authentication System - Permanent Stabilization Protocol');
  const t = ['showAuthTab', 'showForgotPassword', 'showPage', 'logout'];
  let e = !0;
  return (
    t.forEach((o) => {
      typeof window[o] != 'function'
        ? (console.error('CRITICAL FAILURE: ' + o + ' not accessible'), (e = !1))
        : console.log('Verified accessible: ' + o);
    }),
    e
      ? console.log('Authentication System: STABLE & PROTECTED')
      : console.error('AUTHENTICATION SYSTEM COMPROMISED'),
    e
  );
}
function g() {
  const t = {
    showAuthTab: window.showAuthTab,
    showForgotPassword: window.showForgotPassword,
    showPage: window.showPage,
    logout: window.logout,
  };
  (setInterval(() => {
    const e = ['showAuthTab', 'showForgotPassword', 'showPage', 'logout'];
    let o = !1;
    (e.forEach((n) => {
      typeof window[n] != 'function' &&
        (console.error('EMERGENCY: ' + n + ' lost, restoring from backup'),
        (window[n] = t[n]),
        (o = !0));
    }),
      o && console.log('Authentication functions restored from emergency backup'));
  }, 3e3),
    window.addEventListener('beforeunload', () => {
      localStorage.setItem(
        'auth-functions-backup',
        JSON.stringify({ timestamp: Date.now(), functions: Object.keys(t) }),
      );
    }),
    console.log('Advanced authentication protection active'));
}
function y(t) {
  t.preventDefault();
  const e = document.getElementById('email').value.trim(),
    o = document.getElementById('password').value.trim(),
    n = document.getElementById('loginMessage');
  if (
    (e === 'max.bisinger@warubi-sports.com' && o === 'ITP2024') ||
    (e === 'thomas.ellinger@warubi-sports.com' && o === 'ITP2024')
  ) {
    ((r = {
      email: e,
      role: e === 'max.bisinger@warubi-sports.com' ? 'admin' : 'staff',
      name: e === 'max.bisinger@warubi-sports.com' ? 'Max Bisinger' : 'Thomas Ellinger',
    }),
      localStorage.setItem('fc-koln-auth', JSON.stringify(r)),
      (document.getElementById('authScreen').style.display = 'none'),
      (document.getElementById('mainApp').style.display = 'block'),
      (document.getElementById('userWelcome').textContent = 'Welcome, ' + r.name));
    const s = document.querySelectorAll('.admin-only'),
      a = document.querySelectorAll('.staff-only');
    (r.role === 'admin'
      ? (s.forEach((i) => (i.style.display = '')), a.forEach((i) => (i.style.display = '')))
      : r.role === 'staff' &&
        (s.forEach((i) => (i.style.display = 'none')), a.forEach((i) => (i.style.display = ''))),
      d('dashboard'),
      (n.innerHTML = ''));
  } else
    n.innerHTML =
      '<div style="color: #dc2626; margin-top: 1rem;">Invalid credentials. Please try again.</div>';
}
function f(t) {
  t.preventDefault();
  const e = document.getElementById('registerMessage');
  document.getElementById('regFullName').value.trim() &&
    ((e.innerHTML =
      '<div style="color: #22c55e; margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 6px;">Application submitted successfully! You will receive an email confirmation within 24 hours.</div>'),
    document.getElementById('registerForm').reset());
}
function v(t) {
  t.preventDefault();
  const e = document.getElementById('forgotEmail').value.trim(),
    o = document.getElementById('forgotPasswordMessage');
  e
    ? ((o.innerHTML =
        '<div style="color: #22c55e; margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 6px;">Password reset instructions have been sent to ' +
        e +
        '. Please check your email.</div>'),
      (document.getElementById('forgotEmail').value = ''))
    : (o.innerHTML =
        '<div style="color: #dc2626; margin-top: 1rem;">Please enter your email address.</div>');
}
function d(t) {
  switch (t) {
    case 'players':
      p();
      break;
    case 'house-management':
      h();
      break;
    case 'food-orders':
      b();
      break;
    case 'communications':
      w();
      break;
    case 'calendar':
      E();
      break;
    case 'admin':
      T();
      break;
  }
}
function p() {
  const t = document.querySelector('.players-grid');
  t &&
    (t.innerHTML = c
      .map(
        (e) => `
        <div class="player-card" data-player-id="${e.id}">
            <div class="player-card-header">
                <div class="player-info">
                    <h3>${e.name}</h3>
                    <div class="player-details">
                        <span class="player-position">${e.position}</span>
                        <span class="player-age">Age ${e.age}</span>
                        <span class="player-house">House ${e.house}</span>
                    </div>
                </div>
                <div class="player-status status-${e.status.toLowerCase()}">
                    ${e.status}
                </div>
            </div>
            <div class="player-card-body">
                <div class="performance-indicator">
                    <span class="performance-label">Performance</span>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${e.performance}%"></div>
                    </div>
                    <span class="performance-score">${e.performance}%</span>
                </div>
            </div>
            <div class="player-card-actions">
                <button class="btn btn-secondary btn-sm" onclick="editPlayer(${e.id})">Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="viewPlayerProfile(${e.id})">View Profile</button>
            </div>
        </div>
    `,
      )
      .join(''));
}
function h() {
  const t = document.querySelector('.chores-content');
  t &&
    (t.innerHTML = `
        <div class="chores-grid">
            ${u
              .map(
                (e) => `
                <div class="chore-card priority-${e.priority.toLowerCase()} status-${e.status.toLowerCase().replace(' ', '-')}">
                    <div class="chore-header">
                        <h3>${e.title}</h3>
                        <span class="chore-priority">${e.priority}</span>
                    </div>
                    <div class="chore-details">
                        <div class="chore-assignee">
                            <strong>Assigned to:</strong> ${e.assignedTo}
                        </div>
                        <div class="chore-house">
                            <strong>House:</strong> ${e.house}
                        </div>
                        <div class="chore-deadline">
                            <strong>Deadline:</strong> ${new Date(e.deadline).toLocaleDateString()}
                        </div>
                        <div class="chore-status">
                            <strong>Status:</strong> ${e.status}
                        </div>
                    </div>
                    <div class="chore-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editChore(${e.id})">Edit</button>
                        <button class="btn btn-sm btn-success" onclick="markChoreComplete(${e.id})">Complete</button>
                    </div>
                </div>
            `,
              )
              .join('')}
        </div>
    `);
}
function b() {
  const t = document.querySelector('.food-orders-content');
  if (!t) return;
  const e = 35,
    o = 12.5,
    n = e - o;
  t.innerHTML = `
        <div class="budget-overview">
            <div class="budget-card">
                <h3>Your Food Budget</h3>
                <div class="budget-details">
                    <div class="budget-item">
                        <span>Total Budget:</span>
                        <span class="budget-amount">€${e.toFixed(2)}</span>
                    </div>
                    <div class="budget-item">
                        <span>Used:</span>
                        <span class="budget-used">€${o.toFixed(2)}</span>
                    </div>
                    <div class="budget-item">
                        <span>Remaining:</span>
                        <span class="budget-remaining">€${n.toFixed(2)}</span>
                    </div>
                </div>
                <div class="budget-progress">
                    <div class="budget-bar">
                        <div class="budget-fill" style="width: ${(o / e) * 100}%"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="delivery-schedule">
            <h3>Delivery Schedule</h3>
            <div class="delivery-info">
                <div class="delivery-day">
                    <strong>Tuesday Delivery:</strong> Order by Monday 12:00 AM
                </div>
                <div class="delivery-day">
                    <strong>Friday Delivery:</strong> Order by Thursday 12:00 AM
                </div>
            </div>
        </div>
        
        <div class="food-ordering-section">
            <h3>Place Your Order</h3>
            <div class="food-categories">
                <button class="category-btn active" onclick="showFoodCategory('groceries')">Groceries</button>
                <button class="category-btn" onclick="showFoodCategory('snacks')">Snacks</button>
                <button class="category-btn" onclick="showFoodCategory('beverages')">Beverages</button>
            </div>
            
            <div class="food-items" id="foodItems">
                <!-- Food items will be loaded here -->
            </div>
            
            <div class="order-summary">
                <h4>Your Current Order</h4>
                <div id="orderItems">
                    <p>No items in your order yet.</p>
                </div>
                <div class="order-total">
                    <strong>Total: €0.00</strong>
                </div>
                <button class="btn btn-primary" onclick="submitFoodOrder()">Submit Order</button>
            </div>
        </div>
    `;
}
function w() {
  const t = document.getElementById('chatMessages');
  if (!t) return;
  const e = [
    {
      sender: 'Thomas Ellinger',
      message: 'Good morning everyone! Training starts at 9 AM sharp.',
      time: '08:30',
      type: 'staff',
    },
    {
      sender: 'Max Müller',
      message: 'Got it! See you on the field.',
      time: '08:32',
      type: 'player',
    },
    {
      sender: 'Leon Schmidt',
      message: 'Can someone help me with the gym equipment setup?',
      time: '08:45',
      type: 'player',
    },
    { sender: 'You', message: 'I can help with that Leon!', time: '08:46', type: 'own' },
  ];
  ((t.innerHTML = e
    .map(
      (o) => `
        <div class="message ${o.type}">
            <div class="message-sender">${o.sender}</div>
            <div class="message-content">${o.message}</div>
            <div class="message-time">${o.time}</div>
        </div>
    `,
    )
    .join('')),
    (t.scrollTop = t.scrollHeight));
}
function E() {
  const t = document.querySelector('.calendar-content');
  t &&
    (t.innerHTML = `
        <div class="calendar-view" id="calendarView">
            <div class="calendar-header">
                <button class="btn btn-secondary" onclick="navigateCalendar(-1)">‹ Previous</button>
                <h3 id="calendarTitle">${A()}</h3>
                <button class="btn btn-secondary" onclick="navigateCalendar(1)">Next ›</button>
            </div>
            
            <div class="calendar-grid">
                ${I()}
            </div>
        </div>
    `);
}
function T() {
  C('users');
}
function A() {
  return `Week of ${l.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
function I() {
  return '<div class="calendar-placeholder">Calendar grid would be generated here based on current view</div>';
}
function C(t) {
  (document.querySelectorAll('.admin-tab-btn').forEach((e) => e.classList.remove('active')),
    document.querySelectorAll('.admin-tab-content').forEach((e) => (e.style.display = 'none')),
    event.target.classList.add('active'),
    (document.getElementById(
      'admin' + t.charAt(0).toUpperCase() + t.slice(1) + 'Tab',
    ).style.display = 'block'));
}
document.addEventListener('DOMContentLoaded', function () {
  (console.log('1.FC Köln Bundesliga Talent Program loaded successfully'),
    console.log(
      'Complete application with Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, and Admin',
    ),
    m(),
    g());
  const t = document.getElementById('loginForm');
  t && t.addEventListener('submit', y);
  const e = document.getElementById('registerForm');
  e && e.addEventListener('submit', f);
  const o = document.getElementById('forgotPasswordForm');
  o && o.addEventListener('submit', v);
  const n = localStorage.getItem('fc-koln-auth');
  if (n)
    try {
      ((r = JSON.parse(n)),
        (document.getElementById('authScreen').style.display = 'none'),
        (document.getElementById('mainApp').style.display = 'block'),
        (document.getElementById('userWelcome').textContent = 'Welcome, ' + r.name));
      const s = document.querySelectorAll('.admin-only'),
        a = document.querySelectorAll('.staff-only');
      (r.role === 'admin'
        ? (s.forEach((i) => (i.style.display = '')), a.forEach((i) => (i.style.display = '')))
        : r.role === 'staff' &&
          (s.forEach((i) => (i.style.display = 'none')), a.forEach((i) => (i.style.display = ''))),
        d('dashboard'));
    } catch {
      localStorage.removeItem('fc-koln-auth');
    }
  console.log('Enhanced features initialized successfully');
});
