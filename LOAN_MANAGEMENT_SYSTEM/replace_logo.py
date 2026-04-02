import os
import re

frontend_dir = r"c:\Users\TEJA\OneDrive\Desktop\WEB_PROJECT\LOAN_MANAGEMENT_SYSTEM\frontend"
target_pattern = r'<div class="brand-icon">\s*<i class="fas fa-landmark"><\/i>\s*<\/div>'

def process_html_files(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                
                # Determine relative path relative to frontend_dir
                rel_path = os.path.relpath(root, frontend_dir)
                
                if rel_path == '.':
                    img_src = 'logo.jpeg'
                else:
                    # Count matching directories to add '../'
                    depth = len(rel_path.split(os.sep))
                    img_src = '../' * depth + 'logo.jpeg'
                
                replacement = f'<img src="{img_src}" alt="Logo" class="brand-icon" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" />'
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = re.sub(target_pattern, replacement, content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == "__main__":
    process_html_files(frontend_dir)
