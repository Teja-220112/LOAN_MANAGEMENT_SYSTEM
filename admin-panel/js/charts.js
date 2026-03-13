/**
 * LoanAdmin Pro - Charts Configuration
 * All Chart.js chart initializations
 * Ready to connect with dynamic backend data
 */

/* -------------------------------------------------------
   Chart.js Global Defaults
------------------------------------------------------- */
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#64748b';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 20;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.backgroundColor = '#0f1623';
Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };

/* -------------------------------------------------------
   Color Palette
------------------------------------------------------- */
const COLORS = {
  primary:   '#3b82f6',
  success:   '#22c55e',
  warning:   '#f59e0b',
  danger:    '#ef4444',
  info:      '#06b6d4',
  purple:    '#8b5cf6',
  primaryAlpha: 'rgba(59,130,246,0.12)',
  successAlpha: 'rgba(34,197,94,0.12)',
  dangerAlpha:  'rgba(239,68,68,0.12)',
};

/* -------------------------------------------------------
   Dashboard: Monthly Loan Applications (Line Chart)
   Canvas ID: loanApplicationsChart
------------------------------------------------------- */
function initLoanApplicationsChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Default empty structure — replace with real API data
  const chartLabels = labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData   = data   || Array(12).fill(0); // dynamic: backend fills this

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Applications',
        data: chartData,
        borderColor: COLORS.primary,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(59,130,246,0.18)');
          gradient.addColorStop(1, 'rgba(59,130,246,0)');
          return gradient;
        },
        borderWidth: 2.5,
        pointBackgroundColor: '#fff',
        pointBorderColor: COLORS.primary,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} Applications`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          border: { display: false, dash: [4,4] },
          grid: { color: '#f1f5f9' },
          ticks: {
            stepSize: 10,
            font: { size: 11 }
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   Dashboard: Loan Status Distribution (Pie Chart)
   Canvas ID: loanStatusChart
------------------------------------------------------- */
function initLoanStatusChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const chartLabels = labels || ['Approved', 'Pending', 'Rejected'];
  const chartData   = data   || [0, 0, 0]; // dynamic

  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: [COLORS.success, COLORS.warning, COLORS.danger],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 18, boxWidth: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   Analytics: Monthly Loan Applications (Bar Chart)
   Canvas ID: monthlyBarChart
------------------------------------------------------- */
function initMonthlyBarChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const chartLabels = labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData   = data   || Array(12).fill(0);

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Applications',
        data: chartData,
        backgroundColor: chartLabels.map((_, i) =>
          `rgba(59,130,246,${0.5 + (i % 3) * 0.15})`
        ),
        borderColor: COLORS.primary,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} Applications`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          border: { display: false, dash: [4,4] },
          grid: { color: '#f1f5f9' },
          ticks: { stepSize: 10 }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   Analytics: Loan Approval Rate (Pie Chart)
   Canvas ID: approvalRateChart
------------------------------------------------------- */
function initApprovalRateChart(canvasId, approved, pending, rejected) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [approved || 0, pending || 0, rejected || 0],
        backgroundColor: [COLORS.success, COLORS.warning, COLORS.danger],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${pct}%`;
            }
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   Analytics: Defaulter Percentage (Doughnut Chart)
   Canvas ID: defaulterChart
------------------------------------------------------- */
function initDefaulterChart(canvasId, defaulters, nonDefaulters) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Defaulters', 'On Track'],
      datasets: [{
        data: [defaulters || 0, nonDefaulters || 0],
        backgroundColor: [COLORS.danger, COLORS.success],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
        cutout: '72%',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a,b) => a+b, 0);
              const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${pct}%`;
            }
          }
        }
      }
    }
  });
}

/* -------------------------------------------------------
   Sidebar Toggle Logic
------------------------------------------------------- */
function initSidebarToggle() {
  const sidebar   = document.getElementById('sidebar');
  const wrapper   = document.getElementById('mainWrapper');
  const toggleBtn = document.getElementById('sidebarToggle');
  const overlay   = document.getElementById('sidebarOverlay');

  if (!sidebar || !toggleBtn) return;

  const isMobile = () => window.innerWidth <= 1024;

  toggleBtn.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.toggle('mobile-open');
      overlay && overlay.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
      wrapper && wrapper.classList.toggle('expanded');
    }
  });

  overlay && overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
  });
}

/* -------------------------------------------------------
   Profile Dropdown
------------------------------------------------------- */
function initProfileDropdown() {
  const trigger  = document.getElementById('profileTrigger');
  const dropdown = document.getElementById('profileDropdown');
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });
}

/* -------------------------------------------------------
   Initialize on DOM Ready
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initProfileDropdown();
});
