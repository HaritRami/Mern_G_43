import re

filepath = r'c:\Users\admin\Desktop\12-02\Backend\controllers\product.controller.js'
with open(filepath, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove .populate('subCategory') calls
c2 = c.replace(".populate('subCategory')", "")
c2 = c2.replace('.populate("subCategory")', "")

# Remove subCategory from populate('category subCategory') combined calls
c2 = c2.replace("'category subCategory'", "'category'")
c2 = c2.replace('"category subCategory"', '"category"')

# Remove subCategory from destructured body
c2 = c2.replace(', subCategory', '')
c2 = c2.replace('subCategory, ', '')

# Remove subCategory object keys in new ProductModel / updateData
c2 = re.sub(r'      subCategory,?\r?\n', '', c2)
c2 = re.sub(r'      subCategory: .*?,?\r?\n', '', c2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Done. Checking remaining refs:')
hits = [i+1 for i, line in enumerate(c2.splitlines()) if 'subCategory' in line or 'SubCategory' in line]
print('Remaining lines:', hits)
