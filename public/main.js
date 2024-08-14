document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    
    fetchProducts();
    fetchBrands();

    document.body.addEventListener('click', function(event) {
        console.log("Body clicked:", event.target);
        if (event.target.matches('.category-button')) {
            fetchProductsByCategory(event.target.dataset.category, event.target);
        } else if (event.target.matches('.filter-button')) {
            if (event.target.dataset.category) {
                fetchProductsByCategory(event.target.dataset.category, event.target);
            } else {
                fetchProducts();
            }
        } else if (event.target.matches('.brand-button')) {
            fetchProductsByBrand(event.target.dataset.brand);
        } else if (event.target.matches('.remove-button')) {
            removeFromCart(event.target.dataset.id);
        } else if (event.target.matches('.add-to-cart-button')) {
            addToCart(event.target.dataset.id);
        }
    });

    

    const cartIcon = document.getElementById('cartIcon');
    console.log("cartIcon:", cartIcon);
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
        });
    } else {
        console.warn("cartIcon element not found");
    }

    const showFilters = document.getElementById('showFilters');
    console.log("showFilters:", showFilters);
    if (showFilters) {
        showFilters.addEventListener('click', () => {
            sidebar.classList.add('open');
            showFilters.style.display = 'none';
            filtersClose.style.display = 'block';
        });
    } else {
        console.warn("showFilters element not found");
    }

    const filtersClose = document.getElementById('filtersClose');
    console.log("filtersClose:", filtersClose);
    if (filtersClose) {
        filtersClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
            showFilters.style.display = 'block';
            filtersClose.style.display = 'none';
        });
    } else {
        console.warn("filtersClose element not found");
    }

    const availableBrandsToggle = document.getElementById('availableBrandsToggle');
    console.log("availableBrandsToggle:", availableBrandsToggle);
    if (availableBrandsToggle) {
        availableBrandsToggle.addEventListener('click', () => {
            availableBrands.style.display = availableBrands.style.display === 'none' ? 'block' : 'none';
        });
    } else {
        console.warn("availableBrandsToggle element not found");
    }

    const searchInput = document.getElementById('searchInput');
    console.log("searchInput:", searchInput);
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === "Enter") {
                fetchProducts();
            }
        });
    } else {
        console.warn("searchInput element not found");
    }

    const priceRange = document.getElementById('priceRange');
    console.log("priceRange:", priceRange);
    if (priceRange) {
        priceRange.addEventListener('input', function(event) {
            fetchProducts();
        });
    } else {
        console.warn("priceRange element not found");
    }

    const sizeFilter = document.getElementById('sizeFilter');
    console.log("sizeFilter:", sizeFilter);
    if (sizeFilter) {
        sizeFilter.addEventListener('change', () => {
            fetchProducts();
        });

        // Populate the size filter options dynamically
        const sizes = Array.from({ length: 25 }, (_, i) => 36 + i * 0.5);
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeFilter.appendChild(option);
        });
    } else {
        console.warn("sizeFilter element not found");
    }

    const proceedToPaymentButton = document.getElementById('proceedToPaymentButton');
    console.log("proceedToPaymentButton:", proceedToPaymentButton);
    if (proceedToPaymentButton) {
        proceedToPaymentButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'checkout.html';
        });
    } else {
        console.warn("proceedToPaymentButton element not found");
    }

    // Load cart from cookies and update UI
    loadCartFromCookies();
    updateCart();
});


// Utility functions for cookies remain the same...
