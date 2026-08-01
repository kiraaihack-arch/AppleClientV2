import subprocess
result = subprocess.run(['node', '--input-type=module', '--eval', 'import "./public/app.js"'], 
    capture_output=True, text=True, cwd='.')
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)

# Попробуем как обычный скрипт
result2 = subprocess.run(['node', 'public/app.js'], 
    capture_output=True, text=True, cwd='.')
print("STDOUT2:", result2.stdout)
print("STDERR2:", result2.stderr)
