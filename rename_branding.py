import os

# Files to update
files = [
    "about.html", "admin-panel/analytics.html", "admin-panel/dashboard.html",
    "admin-panel/defaulters.html", "admin-panel/emi_schedule.html",
    "admin-panel/loan_applications.html", "admin-panel/loan_approval.html",
    "admin-panel/login.html", "admin-panel/payments.html", "admin-panel/profile.html",
    "admin-panel/users.html", "config.js", "features.html", "index.html",
    "login.html", "manager-panel/dashboard.html", "manager-panel/loan_approval.html",
    "privacy.html", "register.html", "terms.html", "user-pages/apply_loan.html",
    "user-pages/dashboard.html", "user-pages/emi_calculator.html",
    "user-pages/loan_details.html", "user-pages/logout.html", "user-pages/my_loans.html",
    "user-pages/pay_emi.html", "user-pages/payments.html", "user-pages/profile.html",
    "user-pages/scripts.js"
]

base_dir = r"c:\Users\TEJA\OneDrive\Desktop\WEB_PROJECT\LOAN_MANAGEMENT_SYSTEM\frontend"
new_name = "LMS-Sphere-Simulator"

for f in files:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace branding
        updated = content.replace("LoanSphere", new_name)
        
        with open(path, 'w', encoding='utf-8') as file:
            file.write(updated)
        print(f"Updated: {f}")
    else:
        print(f"Skipping (not found): {f}")
