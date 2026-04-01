import os
import glob
import re

base_dir = r"c:/Users/TEJA/OneDrive/Desktop/WEB_PROJECT/LOAN_MANAGEMENT_SYSTEM/frontend"
files = glob.glob(os.path.join(base_dir, "**/*.html"), recursive=True)
files += glob.glob(os.path.join(base_dir, "**/*.js"), recursive=True)

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We skip files that already have API config logic to avoid nesting
    if "config.js" in content and filepath.endswith('.html'):
        pass # maybe already injected
        
    # Replace URLs
    changed = False
    new_content = content
    
    if "http://localhost:3000" in new_content:
        # replace `http://localhost:3000/api...` with `${API_BASE_URL}/api...`
        # if it's in a template literal string:
        new_content = new_content.replace("`http://localhost:3000", "`\"+ window.API_BASE_URL +\"")
        
        # replace 'http://localhost:3000...' with window.API_BASE_URL + '...'
        new_content = new_content.replace("'http://localhost:3000", "window.API_BASE_URL + '")
        
        # replace "http://localhost:3000..." with window.API_BASE_URL + "..."
        new_content = new_content.replace("\"http://localhost:3000", "window.API_BASE_URL + \"")
        
        # cleanup double string concatenations that might occur
        changed = True

    # Inject script tag for config.js if it's an HTML file and we have changed something or not
    # wait, instead of touching every HTML file, we can just declare the window.API_BASE_URL in every main js block.
    # Actually, let's just create a `config.js` and inject it in the <head> of every HTML file.
    
    if filepath.endswith('.html') and "<head>" in new_content and '<script src="' not in new_content[new_content.find('<head>'):new_content.find('</head>')]:
        # calculating relative path to `config.js` in frontend root
        rel_path = os.path.relpath(base_dir, os.path.dirname(filepath))
        # wait, os.path.relpath from A to B
        rel_path = os.path.relpath(base_dir, os.path.dirname(filepath)).replace("\\", "/")
        config_src = f"{rel_path}/config.js" if rel_path != "." else "config.js"
        
        # Inject just before </head>
        head_tag = "</head>"
        inject_script = f'\n  <script src="{config_src}"></script>\n'
        new_content = new_content.replace("</head>", inject_script + "</head>")
        changed = True
        
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
print("Replaced successfully!")
