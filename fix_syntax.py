with open('public/app.js', 'rb') as f:
    content = f.read().decode('utf-8', errors='ignore')

lines = content.split('\n')
print(f'Total lines: {len(lines)}')

# Найдём незакрытые backticks
count = 0
for i, line in enumerate(lines, 1):
    count += line.count('`')
    if i % 50 == 0:
        print(f'Line {i}: total backticks so far = {count} ({"even" if count%2==0 else "ODD - ERROR"})')

print(f'Final backtick count: {count} - {"OK" if count%2==0 else "SYNTAX ERROR - odd backticks"}')
