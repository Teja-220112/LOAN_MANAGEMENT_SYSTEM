/* ================================================================
   LOAN MANAGEMENT SYSTEM — SCRIPTS.JS
   ================================================================ */

'use strict';

/* ── Shared HTML Partials *───────────────────────────────────────── */
const NAVBAR_HTML = `
<nav class="navbar navbar-expand-lg lms-navbar">
  <div class="container">
    <a class="navbar-brand p-0" href="../index.html">
      <div class="navbar-brand-wrap">
        <div class="brand-icon"><i class="fas fa-landmark"></i></div>
        <div class="brand-text">LMS-Sphere-Simulator <span>Management System</span></div>
      </div>
    </a>
    <button class="navbar-toggler border-0 shadow-none" type="button"
      data-bs-toggle="collapse" data-bs-target="#lmsNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="lmsNav">
      <ul class="navbar-nav ms-auto align-items-lg-center gap-1 py-2 py-lg-0">
        <li class="nav-item"><a class="nav-link" href="../index.html" data-page="home"><i class="fas fa-house me-1 d-lg-none"></i>Home</a></li>
        <li class="nav-item"><a class="nav-link" href="apply_loan.html" data-page="apply_loan"><i class="fas fa-file-signature me-1 d-lg-none"></i>Apply Loan</a></li>
        <li class="nav-item"><a class="nav-link" href="my_loans.html" data-page="my_loans"><i class="fas fa-credit-card me-1 d-lg-none"></i>My Loans</a></li>
        <li class="nav-item"><a class="nav-link" href="pay_emi.html" data-page="pay_emi"><i class="fas fa-wallet me-1 d-lg-none"></i>Pay EMI</a></li>
        <li class="nav-item"><a class="nav-link" href="emi_calculator.html" data-page="emi_calculator"><i class="fas fa-calculator me-1 d-lg-none"></i>EMI Calculator</a></li>
        <li class="nav-item"><a class="nav-link" href="payments.html" data-page="payments"><i class="fas fa-receipt me-1 d-lg-none"></i>Payment History</a></li>
        <li class="nav-item"><a class="nav-link" href="profile.html" data-page="profile"><i class="fas fa-user me-1 d-lg-none"></i>Profile</a></li>
        <li class="nav-item" style="position:relative;">
          <button class="nav-link btn btn-link p-0 px-2" id="notif-bell-btn" onclick="toggleNotifPanel()" style="background:none;border:none;position:relative;" title="Notifications">
            <i class="fas fa-bell" style="font-size:1.1rem;"></i>
            <span id="notif-badge" class="d-none" style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:0.65rem;display:flex;align-items:center;justify-content:center;font-weight:700;padding:0 3px;"></span>
          </button>
          <!-- Notification Dropdown Panel -->
          <div id="notif-panel" class="d-none" style="position:absolute;right:0;top:calc(100% + 8px);width:340px;max-height:420px;overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:9999;border:1px solid #e5e7eb;">
            <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:0.95rem;">Notifications</span>
              <button onclick="markAllNotifRead()" style="background:none;border:none;font-size:0.75rem;color:#6366f1;cursor:pointer;font-weight:600;">Mark all read</button>
            </div>
            <div id="notif-list" style="padding:8px 0;">
              <div style="padding:20px;text-align:center;color:#9ca3af;font-size:0.85rem;"><i class="fas fa-bell-slash mb-2 d-block"></i>No notifications yet</div>
            </div>
          </div>
        </li>
        <li class="nav-item">
          <a class="nav-link nav-logout" href="logout.html">
            <i class="fas fa-right-from-bracket me-1"></i>Logout
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer class="lms-footer">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="footer-brand">
          <div class="brand-icon"><i class="fas fa-landmark"></i></div>
          <span class="footer-brand-name">LMS-Sphere-Simulator</span>
        </div>
        <p class="footer-tagline">Simple, secure, and transparent loan management for everyone.</p>
      </div>
      <div class="col-lg-2 col-sm-4">
        <div class="footer-heading">Quick Links</div>
        <ul class="footer-links">
          <li><a href="../index.html">Home</a></li>
          <li><a href="apply_loan.html">Apply Loan</a></li>
          <li><a href="my_loans.html">My Loans</a></li>
          <li><a href="emi_calculator.html">EMI Calculator</a></li>
        </ul>
      </div>
      <div class="col-lg-2 col-sm-4">
        <div class="footer-heading">Account</div>
        <ul class="footer-links">
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="payments.html">Payments</a></li>
          <li><a href="profile.html">Profile</a></li>
          <li><a href="login.html">Login</a></li>
        </ul>
      </div>
      <div class="col-lg-4 col-sm-4">
        <div class="footer-heading">Contact Us</div>
        <div class="footer-contact-item"><i class="fas fa-envelope"></i>support@loansphere.com</div>
        <div class="footer-contact-item"><i class="fas fa-phone"></i>+1 (800) 555-LOAN</div>
        <div class="footer-contact-item"><i class="fas fa-location-dot"></i>123 Finance Street, New York, NY 10001</div>
      </div>
    </div>
    <div class="footer-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
      <span>&copy; 2025 LMS-Sphere-Simulator Management System. All rights reserved.</span>
      <span>Built for secure &amp; transparent lending.</span>
    </div>
  </div>
</footer>`;

/* ── Inject Shared Layout ───────────────────────────────────────── */
function injectLayout() {
  // Standard navbar placeholder (used by most pages)
  const navEl = document.getElementById('navbar-placeholder');
  if (navEl) navEl.innerHTML = NAVBAR_HTML;

  // pay_emi.html uses a different placeholder id
  const navEl2 = document.getElementById('lms-navbar-placeholder');
  if (navEl2) navEl2.innerHTML = NAVBAR_HTML;

  // Footer — inject ONLY on home.html, nowhere else
  const currentPage = location.pathname.split('/').pop();
  const isHome = currentPage === 'home.html' || currentPage === 'index.html' || currentPage === '';

  const footEl = document.getElementById('footer-placeholder');
  if (footEl && isHome) footEl.innerHTML = FOOTER_HTML;

  const footEl2 = document.getElementById('lms-footer-placeholder');
  if (footEl2 && isHome) footEl2.innerHTML = FOOTER_HTML;

  // Mark active nav link based on page filename
  const page = location.pathname.split('/').pop().replace('.html', '');
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === page) link.classList.add('active');
  });
}

/* ── EMI Calculator ─────────────────────────────────────────────── */
function initEMICalculator() {
  const form = document.getElementById('emi-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const P = parseFloat(document.getElementById('loan-amount').value);
    const annualRate = parseFloat(document.getElementById('interest-rate').value);
    const N = parseInt(document.getElementById('loan-tenure').value);

    if (!P || !annualRate || !N) return;

    const r = annualRate / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    const fmt = n => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

    document.getElementById('result-emi').textContent    = fmt(emi);
    document.getElementById('result-interest').textContent = fmt(totalInterest);
    document.getElementById('result-total').textContent  = fmt(totalPayment);

    const resultEl = document.getElementById('calc-result');
    if (resultEl) {
      resultEl.classList.remove('d-none');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  form.addEventListener('reset', function () {
    const resultEl = document.getElementById('calc-result');
    if (resultEl) resultEl.classList.add('d-none');
  });
}

/* ── Table Search Filter ────────────────────────────────────────── */
function initTableSearch() {
  const searchInput = document.getElementById('table-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    const rows = document.querySelectorAll('.searchable-row');
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ── Apply Loan Form Reset ──────────────────────────────────────── */
function initApplyLoanForm() {
  const form = document.getElementById('apply-loan-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Your loan application has been submitted successfully. You will receive a confirmation shortly.');
    form.reset();
  });
}

/* ── Password Toggle ────────────────────────────────────────────── */
function initPasswordToggle() {
  document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
    btn.addEventListener('click', function () {
      const target = document.getElementById(this.dataset.pwToggle);
      if (!target) return;
      const isText = target.type === 'text';
      target.type = isText ? 'password' : 'text';
      this.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });
}

/* ── Pay EMI Page — Navbar / Footer Helpers ─────────────────────── */
function renderNavbar(activeLabel) {
  const el = document.getElementById('lms-navbar-placeholder');
  if (!el) return;
  el.innerHTML = NAVBAR_HTML;
  if (activeLabel) {
    document.querySelectorAll('#lms-navbar-placeholder .nav-link').forEach(link => {
      if (link.textContent.trim().toLowerCase().includes(activeLabel.toLowerCase())) {
        link.classList.add('active');
      }
    });
  }
}

function renderFooter() {
  const el = document.getElementById('lms-footer-placeholder');
  if (!el) return;
  el.innerHTML = FOOTER_HTML;
}

/* ── Pay EMI Page — Auto-initialisation ─────────────────────────── */
function initPayEMI() {
  if (!document.getElementById('payNowBtn')) return;

  const cardNum = document.getElementById('cardNum');
  if (cardNum && !cardNum.dataset.fmtBound) {
    cardNum.dataset.fmtBound = '1';
    cardNum.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').substring(0, 16);
      this.value = v.replace(/(.{4})/g, '$1  ').trim();
    });
  }

  const cardExp = document.getElementById('cardExp');
  if (cardExp && !cardExp.dataset.fmtBound) {
    cardExp.dataset.fmtBound = '1';
    cardExp.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '');
      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
      this.value = v;
    });
  }

  const overlay = document.getElementById('successOverlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  }
}

/* ── Global DOMContentLoaded — runs on every page ───────────────── */
document.addEventListener('DOMContentLoaded', function () {
  injectLayout();   // inject navbar on all pages; footer on all except dashboard
  initPayEMI();     // pay_emi page specific setup
  initEMICalculator(); // initialize EMI calculator
  initTableSearch();
  initApplyLoanForm();
  initPasswordToggle();
});
/* Auto-assign names for FormData */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if(el.id && !el.name) el.name = el.id;
  });
});

/* ── Reusable Web Component: Check Credit Score ───────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (!customElements.get('check-credit-score-button')) {
  class CheckCreditScoreButton extends HTMLElement {
    connectedCallback() {
      const href = this.getAttribute('href') || 'https://www.cibil.com/freecibilscore';
      const tooltip = this.getAttribute('tooltip') || 'Check your official credit score from CIBIL';
      const label = this.getAttribute('label') || 'Check Score';

      this.innerHTML = `
        <a class="check-score-btn" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"
          data-tooltip="${escapeHtml(tooltip)}" aria-label="${escapeHtml(tooltip)}">
          <span class="check-score-btn-label">${escapeHtml(label)}</span>
          <i class="fas fa-external-link-alt" aria-hidden="true"></i>
        </a>
      `;
    }
  }

  customElements.define('check-credit-score-button', CheckCreditScoreButton);
}

/* ── Notification Bell Functions ────────────────────────────────── */
const NOTIF_ICONS = {
    loan_approved: '🎉',
    loan_rejected: '❌',
    emi_due: '⏰',
    emi_paid: '✅',
    general: '📢'
};
const NOTIF_COLORS = {
    loan_approved: '#10b981',
    loan_rejected: '#ef4444',
    emi_due: '#f59e0b',
    emi_paid: '#6366f1',
    general: '#3b82f6'
};

async function fetchNotifications() {
    const token = localStorage.getItem('lms_token');
    if (!token) return;
    try {
        const res = await fetch(window.API_BASE_URL + '/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) return;

        // Update badge
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (data.unreadCount > 0) {
                badge.textContent = data.unreadCount > 9 ? '9+' : data.unreadCount;
                badge.classList.remove('d-none');
                badge.style.display = 'flex';
            } else {
                badge.classList.add('d-none');
                badge.style.display = 'none';
            }
        }

        // Populate list
        const list = document.getElementById('notif-list');
        if (!list) return;
        if (data.data.length === 0) {
            list.innerHTML = `<div style="padding:20px;text-align:center;color:#9ca3af;font-size:0.85rem;"><i class="fas fa-bell-slash mb-2 d-block"></i>No notifications yet</div>`;
            return;
        }
        list.innerHTML = data.data.map(n => `
            <div onclick="markNotifRead('${n._id}', this)" style="padding:12px 16px;border-bottom:1px solid #f9fafb;cursor:pointer;background:${n.isRead ? '#fff' : '#f0f4ff'};transition:background 0.2s;">
                <div style="display:flex;align-items:flex-start;gap:10px;">
                    <span style="font-size:1.3rem;line-height:1;">${NOTIF_ICONS[n.type] || '📢'}</span>
                    <div style="flex:1;">
                        <div style="font-weight:${n.isRead ? '500' : '700'};font-size:0.85rem;color:#1e293b;">${n.title}</div>
                        <div style="font-size:0.78rem;color:#64748b;margin-top:2px;line-height:1.4;">${n.message}</div>
                        <div style="font-size:0.7rem;color:#9ca3af;margin-top:4px;">${new Date(n.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    ${!n.isRead ? `<span style="width:8px;height:8px;background:${NOTIF_COLORS[n.type]||'#6366f1'};border-radius:50%;flex-shrink:0;margin-top:4px;"></span>` : ''}
                </div>
            </div>
        `).join('');
    } catch(e) { /* silent fail */ }
}

function toggleNotifPanel() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    const isHidden = panel.classList.contains('d-none');
    panel.classList.toggle('d-none', !isHidden);
    if (isHidden) fetchNotifications();
}

async function markNotifRead(id, el) {
    const token = localStorage.getItem('lms_token');
    if (!token) return;
    await fetch(`${window.API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (el) { el.style.background = '#fff'; el.querySelector('div > div:last-child span')?.remove(); }
    fetchNotifications(); // refresh badge
}

async function markAllNotifRead() {
    const token = localStorage.getItem('lms_token');
    if (!token) return;
    await fetch(window.API_BASE_URL + '/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifications();
}

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notif-panel');
    const btn = document.getElementById('notif-bell-btn');
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.add('d-none');
    }
});

// Auto-fetch on load (with debounce to wait for layout injection)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(fetchNotifications, 500); // wait for injectLayout()
});
