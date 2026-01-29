// ===== LOCALSTORAGE DATA =====
// Initialize data if not exists
if (!localStorage.getItem('bookRequests')) {
    localStorage.setItem('bookRequests', JSON.stringify([]));
}

if (!localStorage.getItem('userReviews')) {
    localStorage.setItem('userReviews', JSON.stringify([]));
}

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('BOOKWORM website loaded');
    
    // Check current page
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    // Home page features
    if (page === 'index.html' || page === '') {
        setupHomePage();
    }
    
    // Reviews page features
    if (page === 'review.html') {
        setupReviewsPage();
    }
    
    // Request page features
    if (page === 'request.html') {
        setupRequestPage();
    }
});

// ===== HOME PAGE FUNCTIONS =====
function setupHomePage() {
    console.log('Setting up home page');
    
    // Animate counters
    animateCounters();
    
    // Add click event to explore button if exists
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            window.location.href = 'review.html';
        });
    }
}

function animateCounters() {
    const bookCount = document.getElementById('bookCount');
    const reviewCount = document.getElementById('reviewCount');
    const requestCount = document.getElementById('requestCount');
    
    if (!bookCount) return;
    
    const stats = {
        books: 127,
        reviews: 56,
        requests: getRequestCount()
    };
    
    let count = 0;
    const interval = setInterval(() => {
        count += 5;
        
        if (bookCount) bookCount.textContent = Math.min(count, stats.books);
        if (reviewCount) reviewCount.textContent = Math.min(count, stats.reviews);
        if (requestCount) requestCount.textContent = Math.min(count, stats.requests);
        
        if (count >= Math.max(stats.books, stats.reviews, stats.requests)) {
            clearInterval(interval);
        }
    }, 50);
}

function getRequestCount() {
    const requests = JSON.parse(localStorage.getItem('bookRequests') || '[]');
    return requests.length;
}

// ===== REVIEWS PAGE FUNCTIONS =====
function setupReviewsPage() {
    console.log('Setting up reviews page');
    
    // Load user reviews from localStorage
    loadUserReviews();
    
    // Setup review form
    const submitBtn = document.getElementById('submitReview');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitReview);
    }
}

function loadUserReviews() {
    const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    console.log('Loaded', reviews.length, 'user reviews');
}

function submitReview() {
    const titleInput = document.getElementById('reviewTitle');
    const textInput = document.getElementById('reviewText');
    const messageDiv = document.getElementById('reviewMessage');
    
    if (!titleInput || !textInput || !messageDiv) return;
    
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    
    // Validation
    if (!title || !text) {
        showMessage('Please fill in both fields', '