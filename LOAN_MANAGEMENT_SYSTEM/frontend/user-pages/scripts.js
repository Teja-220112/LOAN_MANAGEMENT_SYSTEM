/* ================================================================
   LOAN MANAGEMENT SYSTEM — SCRIPTS.JS
   ================================================================ */

'use strict';

/* ── Shared HTML Partials ───────────────────────────────────────── */
const NAVBAR_HTML = `
<nav class="navbar navbar-expand-lg lms-navbar">
  <div class="container">
    <a class="navbar-brand p-0" href="home.html">
      <div class="navbar-brand-wrap">
        <div class="brand-icon"><i class="fas fa-landmark"></i></div>
        <div class="brand-text">LoanSphere <span>Management System</span></div>
      </div>
    </a>
    <button class="navbar-toggler border-0 shadow-none" type="button"
      data-bs-toggle="collapse" data-bs-target="#lmsNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="lmsNav">
      <ul class="navbar-nav ms-auto align-items-lg-center gap-1 py-2 py-lg-0">
        <li class="nav-item"><a class="nav-link" href="home.html" data-page="home"><i class="fas fa-house me-1 d-lg-none"></i>Home</a></li>
        <li class="nav-item"><a class="nav-link" href="apply_loan.html" data-page="apply_loan"><i class="fas fa-file-signature me-1 d-lg-none"></i>Apply Loan</a></li>
        <li class="nav-item"><a class="nav-link" href="my_loans.html" data-page="my_loans"><i class="fas fa-credit-card me-1 d-lg-none"></i>My Loans</a></li>
        <li class="nav-item"><a class="nav-link" href="pay_emi.html" data-page="pay_emi"><i class="fas fa-wallet me-1 d-lg-none"></i>Pay EMI</a></li>
        <li class="nav-item"><a class="nav-link" href="emi_calculator.html" data-page="emi_calculator"><i class="fas fa-calculator me-1 d-lg-none"></i>EMI Calculator</a></li>
        <li class="nav-item"><a class="nav-link" href="payments.html" data-page="payments"><i class="fas fa-receipt me-1 d-lg-none"></i>Payment History</a></li>
        <li class="nav-item"><a class="nav-link" href="profile.html" data-page="profile"><i class="fas fa-user me-1 d-lg-none"></i>Profile</a></li>
        <li class="nav-item">
          <a class="nav-link nav-logout" href="login.html">
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
          <span class="footer-brand-name">LoanSphere</span>
        </div>
        <p class="footer-tagline">Simple, secure, and transparent loan management for everyone.</p>
      </div>
      <div class="col-lg-2 col-sm-4">
        <div class="footer-heading">Quick Links</div>
        <ul class="footer-links">
          <li><a href="home.html">Home</a></li>
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
      <span>&copy; 2025 LoanSphere Management System. All rights reserved.</span>
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
  const isHome = currentPage === 'home.html' || currentPage === '';

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
});