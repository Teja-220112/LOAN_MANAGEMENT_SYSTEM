import os
import sys

def fix_mojibake(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        try:
            content = f.read()
        except UnicodeDecodeError:
            return

    # Let's setup a dictionary of specific bad strings and their replacements
    replacements = {
        '‚': '?',
        '‚': '',
        '‚': 'ó',
        '‚': 'ñ',
        '‚': '',
        '‚': '',
        '‚ú': '',
        '‚': '',
        '‚': '',
        '√‚‚': 'ó',
    }

    original = content
    for bad, good in replacements.items():
        if bad in content:
            print(f"Found {bad} in {fpath}")
            content = content.replace(bad, good)
            
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {fpath}")

def main():
    directory = r'c:\Users\TEJA\OneDrive\Desktop\WEB_PROJECT\LOAN_MANAGEMENT_SYSTEM'
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith(('.html', '.js', '.css', '.json')):
                fix_mojibake(os.path.join(root, file))

if __name__ == '__main__':
    main()
