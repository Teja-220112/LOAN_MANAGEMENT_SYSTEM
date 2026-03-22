/**
 * Admin Panel Global Utilities
 * Handles Logout, Search, Export, Print etc.
 */

function initAdminUtils() {

    // 1. Global Logout
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('lms_token');
                window.location.href = '../login.html';
            }
        });
    });

    // 2. Global Searchbar (Topbar)
    const topSearchInput = document.querySelector('.topbar-search input');
    if (topSearchInput) {
        topSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim().toLowerCase();
                if (query) {
                    alert('Global search triggered for: ' + query + '\n(This requires a global search API endpoint to display results.)');
                    // Ideal implementation: window.location.href = `search_results.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // 3. Notifications
    const notifBtn = document.querySelector('.topbar-btn .fa-bell');
    if (notifBtn) {
        const badgeDot = notifBtn.parentElement.querySelector('.badge-dot');
        if (badgeDot) badgeDot.style.display = 'none';
        
        notifBtn.parentElement.addEventListener('click', () => {
            alert('You have 0 new notifications.');
        });
    }

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminUtils);
} else {
    initAdminUtils();
}

/**
 * 3. Export Table to CSV
 * Finds all Export buttons and binds them to the nearest table or provided tableId
 */
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId) || document.querySelector('.admin-table');
    if (!table) {
        alert("No data table found to export.");
        return;
    }
    let csv = [];
    const rows = table.querySelectorAll("tr");
    
    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");
        
        for (let j = 0; j < cols.length; j++) {
            // grab the text, remove newlines, escape double quotes
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        if (row.length > 0) csv.push(row.join(","));
    }

    downloadCSV(csv.join("\n"), filename);
}

function downloadCSV(csv, filename) {
    let csvFile;
    let downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

/**
 * 4. Print Page or specified section
 */
function printPage() {
    window.print();
}
