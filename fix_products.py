import sys

filepath = r'c:\Users\admin\Desktop\12-02\Frontend\src\admin\pages\ProductManagement.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# FIX 1: Seller filter - pass userId to backend instead of client-side filtering
old1 = '''      const response = await axios.get(API_URL, {
        params: {
          search: searchTerm,
          sortField,
          sortOrder: sortDirection,
          page: currentPage,
          limit: itemsPerPage
        }
      });

      if (response.data.success) {
        let products = response.data.data;

        // Seller sees only their own products
        if (userRole === "Seller" && userId) {
          products = products.filter((item) => item.userId === userId);
        }

        // Admin: filter by selected seller if chosen
        if (userRole === "Admin" && selectedSeller) {
          products = products.filter((item) => item.userId === selectedSeller);
        }

        setProducts(products);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(products.length);
      }'''

new1 = '''      // Build query params - server-side filtering
      const params = {
        search: searchTerm,
        sortField,
        sortOrder: sortDirection,
        page: currentPage,
        limit: itemsPerPage
      };
      // Seller sees only their own products (server-side)
      const userId = savedUser?._id || savedUser?.data?._id || Cookies.get("userId");
      if (userRole === "Seller" && userId) {
        params.userId = userId;
      }
      // Admin: filter by selected seller if chosen
      if (userRole === "Admin" && selectedSeller) {
        params.userId = selectedSeller;
      }

      const response = await axios.get(API_URL, { params });

      if (response.data.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }'''

# FIX 2: handleModalOpen - populate formData when editing
old2 = '''  const handleModalOpen = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };'''

new2 = '''  const handleModalOpen = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name || "",
        category: (product.category || []).map(c => c._id || c),
        subCategory: (product.subCategory || []).map(s => s._id || s),
        unit: product.unit || "",
        stock: product.stock ?? 0,
        price: product.price ?? 0,
        discount: product.discount ?? 0,
        description: product.description || "",
        moreDetail: product.moreDetail || {},
        Public: product.Public !== undefined ? product.Public : true
      });
    } else {
      setSelectedProduct(null);
      setFormData({ name: "", category: [], subCategory: [], unit: "", stock: 0, price: 0, discount: 0, description: "", moreDetail: {}, Public: true });
    }
    setPreviewImages([]);
    setSelectedImages([]);
    setShowModal(true);
  };'''

# FIX 3: handleSubmit - add auth header + loading state
old3 = '''  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => formDataToSend.append(key + '[]', value));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append each selected image to formData
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      if (selectedProduct) {
        await axios.put(
          `${API_URL}/${selectedProduct._id}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success("Product updated successfully!");
      } else {
        await axios.post(
          API_URL,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success("Product created successfully!");
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error("Error saving product!");
    }
  };'''

new3 = '''  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.price) < 0) { toast.error("Price cannot be negative"); return; }
    if (Number(formData.stock) < 0) { toast.error("Stock cannot be negative"); return; }
    setSubmitting(true);
    try {
      const token = savedUser?.tokens?.accessToken;
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(value => formDataToSend.append(key + '[]', value));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      selectedImages.forEach(image => formDataToSend.append('images', image));
      const headers = { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` };

      if (selectedProduct) {
        await axios.put(`${API_URL}/${selectedProduct._id}`, formDataToSend, { headers });
        toast.success("Product updated successfully!");
      } else {
        await axios.post(API_URL, formDataToSend, { headers });
        toast.success("Product created successfully!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving product!");
    } finally {
      setSubmitting(false);
    }
  };'''

# FIX 4: Currency $ -> rupee symbol and DOMAIN_URL for images
old4 = '          <td>${product.price}</td>'
new4 = '          <td>₹{Number(product.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>'

old5 = '              <p><strong>Price:</strong> ${detailProduct.price}</p>'
new5 = '              <p><strong>Price:</strong> ₹{Number(detailProduct.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>'

# FIX 5: Add DOMAIN_URL import and use it for images
old6 = "import { API_URL as GLOBAL_API_URL } from '../../config/apiConfig';"
new6 = "import { API_URL as GLOBAL_API_URL, DOMAIN_URL as GLOBAL_DOMAIN_URL } from '../../config/apiConfig';"

# FIX 6: Fix image src to use DOMAIN_URL
old7 = "                                src={product.images[0]}"
new7 = "                                src={`${GLOBAL_DOMAIN_URL}${product.images[0]}`}"

# FIX 7: Add min=0 to price and stock inputs
old8 = '''                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required'''
new8 = '''                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required'''

old9 = '''                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required'''
new9 = '''                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required'''

# FIX 8: submit button loading state
old10 = '            <Button variant="primary" type="submit">\n              {selectedProduct ? "Update" : "Create"}\n            </Button>'
new10 = '            <Button variant="primary" type="submit" disabled={submitting}>\n              {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : selectedProduct ? "Update Product" : "Create Product"}\n            </Button>'

# FIX 9: Empty state improvement
old11 = '                ) : (\n                  <p className="text-center mt-3">No products found.</p>\n                )}'
new11 = '''                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-box-seam text-muted" style={{ fontSize: "3rem" }}></i>
                    <h5 className="mt-3 text-muted">No products found</h5>
                    <p className="text-muted small">Add your first product using the "Add New Product" button above.</p>
                  </div>
                )}'''

# FIX 10: Remove userId line that was in the old fetchProducts (now handled in params)
old12 = '      const userId = Cookies.get("userId");\n\n      const response = await axios.get(API_URL, {'
new12 = '      const response = await axios.get(API_URL, {'

replacements = [
    (old1, new1), (old2, new2), (old3, new3),
    (old4, new4), (old5, new5), (old6, new6),
    (old7, new7), (old8, new8), (old9, new9),
    (old10, new10), (old11, new11),
]

lf = content.replace('\r\n', '\n')
applied = 0
for old, new in replacements:
    if old in lf:
        lf = lf.replace(old, new, 1)
        applied += 1
    else:
        # try without stripping
        print(f"WARNING: pattern not found:\n{old[:80]}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(lf)

print(f"Done — applied {applied}/{len(replacements)} fixes")
