document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

const addProductForm = document.getElementById('addProductForm');
const updateProductForm = document.getElementById('updateProductForm');
const updateTitle = document.getElementById('updateTitle');

addProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newProduct = {
        brand: document.getElementById('newBrand').value,
        model: document.getElementById('newModel').value,
        description: document.getElementById('newDescription').value,
        price: parseFloat(document.getElementById('newPrice').value),
        image: document.getElementById('newImage').value,
        categories: document.getElementById('newCategories').value.split(','),
        sizes: document.getElementById('newSizes').value.split(',').map(size => parseFloat(size.trim())) // Collect sizes from input
    };

    console.log('Adding product:', newProduct); // Debug log

    fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(product => {
        console.log('Product added:', product);
        fetchProducts();
        addProductForm.reset(); // Reset the form fields after successful addition
        notifyShopPage();
    })
    .catch(error => {
        console.error('Error adding product:', error);
    });
});

updateProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const productId = document.getElementById('updateProductId').value;
    const updatedProduct = {
        brand: document.getElementById('updateBrand').value,
        model: document.getElementById('updateModel').value,
        description: document.getElementById('updateDescription').value,
        price: parseFloat(document.getElementById('updatePrice').value),
        image: document.getElementById('updateImage').value,
        categories: document.getElementById('updateCategories').value.split(','),
        sizes: document.getElementById('updateSizes').value.split(',').map(size => parseFloat(size.trim())) // Collect sizes from input
    };

    console.log('Updating product:', updatedProduct); // Debug log

    fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(product => {
        console.log('Product updated:', product);
        fetchProducts();
        updateProductForm.reset();
        updateProductForm.classList.add('hidden');
        updateTitle.classList.add('hidden');
        notifyShopPage();
    })
    .catch(error => {
        console.error('Error updating product:', error);
    });
});

function fetchProducts() {
    console.log('Fetching products...'); // Debug log

    fetch('http://localhost:3000/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            console.log('Fetched products:', products); // Debug log

            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Clear previous products

            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <div>
                        <h3>${product.brand} - ${product.model}</h3>
                        <p>${product.description}</p>
                        <p>Price: $${product.price}</p>
                        <img src="${product.image}" alt="${product.model}">
                    </div>
                    <div>
                        <button onclick="removeProduct('${product._id}')">Remove</button>
                        <button onclick="showUpdateForm('${product._id}')">Update</button>
                    </div>
                `;
                productList.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function removeProduct(productId) {
    console.log('Removing product:', productId); // Debug log

    fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        console.log('Product removed');
        fetchProducts();
        notifyShopPage();
    })
    .catch(error => {
        console.error('Error removing product:', error);
    });
}

function showUpdateForm(productId) {
    console.log('Fetching product for update:', productId); // Debug log

    fetch(`http://localhost:3000/api/products`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            const product = products.find(p => p._id === productId);
            if (product) {
                document.getElementById('updateProductId').value = product._id;
                document.getElementById('updateBrand').value = product.brand;
                document.getElementById('updateModel').value = product.model;
                document.getElementById('updateDescription').value = product.description;
                document.getElementById('updatePrice').value = product.price;
                document.getElementById('updateImage').value = product.image;
                document.getElementById('updateCategories').value = product.categories.join(',');
                document.getElementById('updateSizes').value = product.sizes.join(',');

                updateProductForm.classList.remove('hidden');
                updateTitle.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching product:', error);
        });
}

function notifyShopPage() {
    console.log('Setting updateProducts to true in localStorage'); // Debug log
    window.localStorage.setItem('updateProducts', 'true');
}
