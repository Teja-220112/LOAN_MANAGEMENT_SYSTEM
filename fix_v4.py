import os

fixes = {
    'â': '',
    'âšï ': ' ',
    'âšï': '',
    'Ã—': '',
    'âˆ': '',
}

directory = r'c:\Users\TEJA\OneDrive\Desktop\WEB_PROJECT\LOAN_MANAGEMENT_SYSTEM'
print('Starting final fixes...')
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
            except Exception as e:
                pass
print('Final fixes done.')