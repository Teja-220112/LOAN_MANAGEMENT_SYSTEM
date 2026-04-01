"""
Script: inject_config_and_fix_urls.py
Injects config.js into all HTML files and fixes any remaining localhost:3000 URLs
"""
import os, re, glob

root = r"c:/Users/TEJA/OneDrive/Desktop/WEB_PROJECT/LOAN_MANAGEMENT_SYSTEM/frontend"

# Find all HTML and JS files
html_files = glob.glob(os.path.join(root, "**/*.html"), recursive=True)
js_files   = glob.glob(os.path.join(root, "**/*.js"),   recursive=True)

injected = 0
fixed    = 0

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content

    # ── 1. Fix any "\"+ window.API_BASE_URL +\"" artifacts from previous script ──
    content = content.replace('`\"+ window.API_BASE_URL +\"', '`' + '${window.API_BASE_URL}')
    content = content.replace('"+ window.API_BASE_URL +"', '${window.API_BASE_URL}')
    
    # ── 2. Fix raw localhost strings left over ──
    content = content.replace("'http://localhost:3000", "window.API_BASE_URL + '")
    content = content.replace('"http://localhost:3000"', 'window.API_BASE_URL')
    content = content.replace('http://localhost:3000/api/', "${window.API_BASE_URL}/api/")

    # ── 3. Inject config.js before </head> if not already present ──
    if 'config.js' not in content and '</head>' in content:
        subpath = os.path.relpath(root, os.path.dirname(filepath)).replace("\\", "/")
        config_src = "config.js" if subpath == "." else f"{subpath}/config.js"
        inject = f'  <script src="{config_src}"></script>\n'
        content = content.replace('</head>', inject + '</head>', 1)
        injected += 1

    if content != original:
        fixed += 1
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

# Fix JS files too
for filepath in js_files:
    if 'config.js' in filepath:
        continue  # skip config itself
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    original = content

    # Fix mangled template literals from previous script
    content = re.sub(r'`"[+]\s*window\.API_BASE_URL\s*[+]"', '`${window.API_BASE_URL}', content)
    content = re.sub(r'"[+]\s*window\.API_BASE_URL\s*[+]"', '${window.API_BASE_URL}', content)

    if content != original:
        fixed += 1
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print(f"Done. {fixed} files updated, {injected} had config.js injected.")
