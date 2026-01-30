

if (!localStorage.getItem('bookRequests')) localStorage.setItem('bookRequests', JSON.stringify([]));
if (!localStorage.getItem('userReviews')) localStorage.setItem('userReviews', JSON.stringify([]));

document.addEventListener('DOMContentLoaded', function () {
    console.log('BOOKWORM website loaded');

    const path = window.location.pathname;
    const page = path.split('/').pop();

    if (page === 'index.html' || page === '') setupHomePage();
    if (page === 'review.html') setupReviewsPage();
    if (page === 'request.html') setupRequestPage();
});


function setupHomePage() {
    animateCounters();
}

function animateCounters() {
    const bookCount = document.getElementById('bookCount');
    const reviewCount = document.getElementById('reviewCount');
    const requestCount = document.getElementById('requestCount');

    if (!bookCount) return;

    const stats = { books: 127, reviews: 56, requests: getRequestCount() };

    let count = 0;
    const interval = setInterval(() => {
        count += 5;
        if (bookCount) bookCount.textContent = Math.min(count, stats.books);
        if (reviewCount) reviewCount.textContent = Math.min(count, stats.reviews);
        if (requestCount) requestCount.textContent = Math.min(count, stats.requests);
        if (count >= Math.max(stats.books, stats.reviews, stats.requests)) clearInterval(interval);
    }, 50);
}

function getRequestCount() {
    const requests = JSON.parse(localStorage.getItem('bookRequests') || '[]');
    return requests.length;
}


function setupReviewsPage() {
    loadUserReviews();
    const submitBtn = document.getElementById('submitReview');
    if (submitBtn) submitBtn.addEventListener('click', submitReview);
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
    if (!title || !text) {
        messageDiv.textContent = 'Please fill in both fields';
        messageDiv.className = 'error';
        return;
    }

    const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    reviews.unshift({ title, text, date: new Date().toISOString() });
    localStorage.setItem('userReviews', JSON.stringify(reviews));

    titleInput.value = '';
    textInput.value = '';
    messageDiv.textContent = 'Review submitted!';
    messageDiv.className = 'success';
    setTimeout(() => { messageDiv.textContent = ''; messageDiv.className = ''; }, 3000);
}


function setupRequestPage() {
    renderRequests();

    const form = document.getElementById('requestForm');
    if (form) form.addEventListener('submit', handleRequestSubmit);

    const newReqBtn = document.getElementById('newRequest');
    if (newReqBtn) newReqBtn.addEventListener('click', () => {
        document.getElementById('confirmation').classList.add('hidden');
        document.getElementById('requestForm').classList.remove('hidden');
        document.getElementById('requestForm').reset();
    });
}

function handleRequestSubmit(e) {
    e.preventDefault();
    clearRequestErrors();

    const name = (document.getElementById('name') || {}).value?.trim() || '';
    const email = (document.getElementById('email') || {}).value?.trim() || '';
    const book = (document.getElementById('book') || {}).value?.trim() || '';
    const reason = (document.getElementById('reason') || {}).value?.trim() || '';

    let valid = true;
    if (!name) { showFieldError('nameError', 'Name is required'); valid = false; }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showFieldError('emailError', 'Valid email required'); valid = false; }
    if (!book) { showFieldError('bookError', 'Book title is required'); valid = false; }
    if (!reason) { showFieldError('reasonError', 'Please add your thoughts'); valid = false; }

    if (!valid) return;

    const requests = JSON.parse(localStorage.getItem('bookRequests') || '[]');
    const newRequest = { id: Date.now().toString(), name, email, book, reason, date: new Date().toISOString() };
    requests.unshift(newRequest);
    localStorage.setItem('bookRequests', JSON.stringify(requests));

   
    const form = document.getElementById('requestForm');
    if (form) form.classList.add('hidden');
    const confirmation = document.getElementById('confirmation');
    if (confirmation) confirmation.classList.remove('hidden');

    renderRequests();
}

function showFieldError(id, message) {
    const el = document.getElementById(id);
    if (el) { el.textContent = message; el.classList.add('error'); }
}

function clearRequestErrors() {
    ['nameError','emailError','bookError','reasonError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.classList.remove('error'); }
    });
}

function renderRequests() {
    const list = document.getElementById('requestsList');
    if (!list) return;
    const requests = JSON.parse(localStorage.getItem('bookRequests') || '[]');

    if (requests.length === 0) {
        list.innerHTML = '<p>No recent requests yet.</p>';
        return;
    }

    const html = requests.map(r => {
        const date = new Date(r.date).toLocaleString();
        return `\n        <div class="request-item" data-id="${r.id}">\n            <h4>${escapeHtml(r.book)}</h4>\n            <p>${escapeHtml(r.reason)}</p>\n            <div class="request-meta">Requested by <strong>${escapeHtml(r.name)}</strong> • <span>${date}</span></div>\n            <button class="delete-request" data-id="${r.id}" aria-label="Delete request">Delete</button>\n        </div>`;
    }).join('\n');

    list.innerHTML = html;

    // attach delete handlers
    list.querySelectorAll('.delete-request').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            if (!id) return;
            if (!confirm('Delete this request?')) return;
            deleteRequest(id);
        });
    });
}

function deleteRequest(id) {
    const requests = JSON.parse(localStorage.getItem('bookRequests') || '[]');
    const filtered = requests.filter(r => String(r.id) !== String(id));
    localStorage.setItem('bookRequests', JSON.stringify(filtered));
    renderRequests();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
