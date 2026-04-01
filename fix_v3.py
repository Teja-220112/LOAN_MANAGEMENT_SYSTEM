import os

fixes = {
    '\xe2\x9a\xa0\xef\xb8\x8f': '',
    '<script <script src="config.js"></script>': '<script src="config.js"></script>'
}

directory = r'c:\Users\TEJA\OneDrive\Desktop\WEB_PROJECT\LOAN_MANAGEMENT_SYSTEM'
files_fixed = 0
for root, dirs, files in os.walk(directory):
    if 'node_modules' in root or '.git' in root: continue
    for file in files:
        if file.endswith(('.html', '.js', '.css', '.json')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                orig = content
                for bad, good in fixes.items():
                    content = content.replace(bad, good)
                if content != orig:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print('Fixed:', path)
                    files_fixed += 1
            except Exception as e:
                pass
print('Done. Fixed {} files'.format(files_fixed))