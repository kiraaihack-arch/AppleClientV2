from PIL import Image
import numpy as np

img = Image.open('public/logo.png').convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Убираем тёмный/чёрный фон (пиксели где все каналы < 40)
dark_mask = (r < 50) & (g < 50) & (b < 50)
data[dark_mask, 3] = 0  # прозрачный

result = Image.fromarray(data)
result.save('public/logo.png')
print('Done! Background removed.')
