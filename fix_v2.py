import os

fixes = {
    '\xe2\u201a\xb9': '\u20b9',
    '\xe2\u20ac\xa6': '\u2026',
    '\xe2\u20ac\u201d': '\u2014',
    '\xe2\u20ac\u201c': '\u2013',
    '\xe2\u20ac\u02dc': '\u2018',
    '\xe2\u20ac\u2122': '\u2019',
    '\xe2\u20ac\u0153': '\u201c',
    '\xe2\u20ac\x9d': '\u201d',
    '\xe2\u20ac\xa2': '\u2022',
    '\xc3\xa2\xe2\x80\x9a\xc2\xac\xe2\x80\x94': '\u2014',
    'Ãââ': '\u2014',
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