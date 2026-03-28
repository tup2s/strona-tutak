/**
 * Blog JavaScript
 * Ładowanie i wyświetlanie artykułów z plików Markdown
 */

// Posts index - will be loaded from posts.json
let postsIndex = [];

// Category labels in Polish
const categoryLabels = {
    'prawo-karne': 'Prawo karne',
    'prawo-cywilne': 'Prawo cywilne',
    'prawo-rodzinne': 'Prawo rodzinne',
    'prawo-spadkowe': 'Prawo spadkowe',
    'prawo-gospodarcze': 'Prawo gospodarcze',
    'porady': 'Porady'
};

// Initialize blog
document.addEventListener('DOMContentLoaded', function() {
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid) {
        loadPosts();
        initFilters();
    }
});

// Load posts index
async function loadPosts() {
    try {
        const response = await fetch('posts/posts.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        postsIndex = await response.json();
        renderPosts(postsIndex);
    } catch (error) {
        console.error('Error loading posts:', error);
        showEmptyState();
    }
}

// Render posts to grid
function renderPosts(posts) {
    const blogGrid = document.getElementById('blog-grid');
    const blogEmpty = document.getElementById('blog-empty');
    
    if (!posts || posts.length === 0) {
        showEmptyState();
        return;
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate HTML
    const html = posts.map(post => createPostCard(post)).join('');
    blogGrid.innerHTML = html;
    blogEmpty.style.display = 'none';
}

// Create post card HTML
function createPostCard(post) {
    const categoryLabel = categoryLabels[post.category] || post.category;
    const formattedDate = formatDate(post.date);
    const readTime = calculateReadTime(post.excerpt || '');
    
    return `
        <article class="blog-card" data-category="${post.category}">
            <div class="blog-card__image">
                ${post.image 
                    ? `<img src="${post.image}" alt="${post.title}">`
                    : `<i class="fas fa-balance-scale blog-card__image-placeholder"></i>`
                }
                <span class="blog-card__category">${categoryLabel}</span>
            </div>
            <div class="blog-card__content">
                <h2 class="blog-card__title">
                    <a href="post.html?slug=${post.slug}">${post.title}</a>
                </h2>
                <p class="blog-card__excerpt">${post.description || post.excerpt || ''}</p>
                <div class="blog-card__meta">
                    <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                    <span><i class="fas fa-clock"></i> ${readTime} min</span>
                </div>
            </div>
        </article>
    `;
}

// Initialize category filters
function initFilters() {
    const filterButtons = document.querySelectorAll('.blog-filter__btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            const category = this.dataset.category;
            filterPosts(category);
        });
    });
}

// Filter posts by category
function filterPosts(category) {
    const blogGrid = document.getElementById('blog-grid');
    const blogEmpty = document.getElementById('blog-empty');
    
    let filteredPosts;
    if (category === 'all') {
        filteredPosts = postsIndex;
    } else {
        filteredPosts = postsIndex.filter(post => post.category === category);
    }
    
    if (filteredPosts.length === 0) {
        blogGrid.innerHTML = '';
        blogEmpty.style.display = 'block';
    } else {
        renderPosts(filteredPosts);
    }
}

// Show empty state
function showEmptyState() {
    const blogGrid = document.getElementById('blog-grid');
    const blogEmpty = document.getElementById('blog-empty');
    
    if (blogGrid) blogGrid.innerHTML = '';
    if (blogEmpty) blogEmpty.style.display = 'block';
}

// Load single article
async function loadArticle(slug) {
    try {
        // Load posts index first
        const indexResponse = await fetch('posts/posts.json');
        if (!indexResponse.ok) throw new Error('Failed to load posts index');
        
        const posts = await indexResponse.json();
        const post = posts.find(p => p.slug === slug);
        
        if (!post) {
            window.location.href = 'index.html';
            return;
        }
        
        // Load markdown content
        const mdResponse = await fetch(`posts/${post.file}`);
        if (!mdResponse.ok) throw new Error('Failed to load article');
        
        const markdown = await mdResponse.text();
        
        // Parse frontmatter and content
        const { frontmatter, content } = parseFrontmatter(markdown);
        
        // Update page
        updateArticlePage(post, frontmatter, content);
        
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('article-content').innerHTML = `
            <div class="blog-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Nie udało się załadować artykułu</h3>
                <p>Przepraszamy, wystąpił błąd. <a href="index.html">Wróć do bloga</a></p>
            </div>
        `;
    }
}

// Parse frontmatter from markdown
function parseFrontmatter(markdown) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);
    
    if (match) {
        const frontmatterStr = match[1];
        const content = match[2];
        
        // Simple YAML parsing
        const frontmatter = {};
        frontmatterStr.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > -1) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                // Remove quotes
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                frontmatter[key] = value;
            }
        });
        
        return { frontmatter, content };
    }
    
    return { frontmatter: {}, content: markdown };
}

// Update article page with content
function updateArticlePage(post, frontmatter, content) {
    const title = frontmatter.title || post.title;
    const category = frontmatter.category || post.category;
    const date = frontmatter.date || post.date;
    const categoryLabel = categoryLabels[category] || category;
    
    // Update meta
    document.title = `${title} | Blog prawniczy | Kancelaria Adwokacka Tutak`;
    
    // Update elements
    document.getElementById('breadcrumb-title').textContent = title;
    document.getElementById('article-title').textContent = title;
    document.getElementById('article-category').textContent = categoryLabel;
    document.getElementById('article-date').innerHTML = `<i class="fas fa-calendar-alt"></i> <span>${formatDate(date)}</span>`;
    
    // Calculate read time
    const readTime = calculateReadTime(content);
    document.getElementById('article-read-time').innerHTML = `<i class="fas fa-clock"></i> <span>${readTime} min czytania</span>`;
    
    // Parse and render markdown
    if (typeof marked !== 'undefined') {
        document.getElementById('article-content').innerHTML = marked.parse(content);
    } else {
        // Fallback: simple markdown rendering
        document.getElementById('article-content').innerHTML = simpleMarkdown(content);
    }
    
    // Update share links
    const url = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(title);
    
    document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    document.getElementById('share-linkedin').href = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${shareTitle}`;
    document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?url=${url}&text=${shareTitle}`;
}

// Simple markdown parser (fallback)
function simpleMarkdown(text) {
    return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\n/gim, '<br>');
}

// Format date to Polish format
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = [
        'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
        'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Calculate read time (words per minute)
function calculateReadTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes);
}
