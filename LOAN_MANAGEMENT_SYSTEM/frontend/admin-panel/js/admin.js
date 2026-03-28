/**
 * admin.js — Shared utilities for all Admin Panel pages
 * Handles: profile dropdown toggle, logout, sidebar toggle, auth guard
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Auth Guard ─────────────────────────────────────
    const token = localStorage.getItem('lms_token');
    if (!token) { window.location.href = '../login.html'; return; }

    // ── 2. Populate admin name from localStorage ──────────
    const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
    const displayName = user.name || 'Admin';
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    document.querySelectorAll('.topbar-profile-name, .sidebar-user-name').forEach(el => {
        if (el.textContent === 'Super Admin' || el.textContent === 'Admin') el.textContent = displayName;
    });
    document.querySelectorAll('.topbar-avatar, .sidebar-user-avatar').forEach(el => {
        if (el.textContent === 'SA') el.textContent = initials;
    });

    // ── 3. Profile Dropdown Toggle ────────────────────────
    const profileTrigger  = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileTrigger && profileDropdown) {
        profileTrigger.style.cursor = 'pointer';
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        // Close when clicking anywhere outside the dropdown
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // ── 4. Logout Handler (works on ALL .logout-link elements) ──
    document.querySelectorAll('.logout-link, [data-action="logout"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('lms_token');
            localStorage.removeItem('lms_user');
            window.location.href = '../login.html';
        });
    });

    // ── 5. Sidebar Toggle ─────────────────────────────────
    const sidebarToggle  = document.getElementById('sidebarToggle');
    const sidebar        = document.getElementById('sidebar');
    const mainWrapper    = document.getElementById('mainWrapper');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function closeSidebar() {
        sidebar?.classList.remove('open');
        sidebarOverlay?.classList.remove('active');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
            sidebarOverlay?.classList.toggle('active');
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // ── 6. Mark Active Sidebar Link ──────────────────────
    const currentPage = location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

});
