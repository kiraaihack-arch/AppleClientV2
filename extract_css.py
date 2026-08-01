with open('public/app.js', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Найдём CSS константу
start = content.find('const CSS = `')
end = content.find('`;\n\nfunction render(')
if start == -1 or end == -1:
    print("Not found! start:", start, "end:", end)
    exit()

css_block = content[start + len('const CSS = `'):end]
print("CSS found, length:", len(css_block))

# Извлекаем только стили (без <style> тегов)
css_clean = css_block.replace('<style>', '').replace('</style>', '').strip()

# Пишем в отдельный файл
with open('public/style.css', 'w', encoding='utf-8') as f:
    f.write(css_clean)

# Заменяем в app.js
new_content = content[:start]
new_content += 'const CSS = ""; // styles in style.css\n'
new_content += content[end + 2:]  # skip `;\n

# Убираем CSS из render
new_content = new_content.replace('document.getElementById(\'app\').innerHTML = CSS + html;',
                                   'document.getElementById(\'app\').innerHTML = html;')
new_content = new_content.replace("document.getElementById('app').insertAdjacentHTML('beforeend', `\n  ${CSS}\n  <div",
                                   "document.getElementById('app').insertAdjacentHTML('beforeend', `\n  <div")

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")
