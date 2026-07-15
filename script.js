// script.js – blog engine & routing
(function() {
    const SITE_URL = 'https://adobug.github.io';
    // ────────────────────────────────
    // View counter config
    // ────────────────────────────────
    //const COUNTER_NAMESPACE = 'thoughts-notes-blog';
    const COUNTER_API_BASE = 'https://hits.seeyoufarm.com/api/count/incr';

    // ────────────────────────────────
    // DOM elements
    // ────────────────────────────────
    const app = document.getElementById('app');
    const navHome = document.getElementById('navHome');
    const navAbout = document.getElementById('navAbout');
    const navBrand = document.getElementById('navBrand');
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ────────────────────────────────
    // Routing
    // ────────────────────────────────
    function getRouteFromHash() {
        const hash = window.location.hash;
        if (hash.startsWith('#/post/')) {
            return { view: 'post', slug: hash.replace('#/post/', '') };
        }
        if (hash === '#about') return { view: 'about' };
        return { view: 'home' };
    }

    function navigate(view, slug) {
        if (view === 'home') window.location.hash = '';
        else if (view === 'post' && slug) window.location.hash = `#/post/${slug}`;
        else if (view === 'about') window.location.hash = '#about';
    }

    function updateActiveNav(view) {
        navHome.classList.remove('active');
        navAbout.classList.remove('active');
        if (view === 'about') navAbout.classList.add('active');
        else navHome.classList.add('active');
    }

    // ────────────────────────────────
    // View counter helpers
    // ────────────────────────────────
    async function fetchAndIncrementViews(slug) {
        const url = `${SITE_URL}/posts/${slug}`;  // fictional clean URL
        try {
            const response = await fetch(`${COUNTER_API_BASE}?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            return data.count;   // the service returns { count: number, … }
        } catch (err) {
            console.warn('View counter error:', err);
            return null;
        }
    }

    async function getViewsOnly(slug) {
        // hits.seeyoufarm.com does not have a read‑without‑increment endpoint,
        // so for homepage cards we'll just fetch/increment to avoid complexity.
        // If you want to show views on cards, you can call fetchAndIncrementViews.
        // I'm keeping this function for compatibility; it will return null.
        return null;
    }

    function formatViews(count) {
        if (count === null || count === undefined) return '—';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
        return count.toString();
    }

    // ────────────────────────────────
    // Rendering
    // ────────────────────────────────
    function renderHome() {
        updateActiveNav('home');
        document.title = 'adobug.github.io';

        let postsHTML = '';
        if (typeof POSTS === 'undefined' || POSTS.length === 0) {
            postsHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <p>No posts yet.<br>Add entries to <code>posts.js</code> and place markdown files in <code>/posts/</code>.</p>
                </div>`;
        } else {
            const sorted = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
            postsHTML = sorted.map(post => `
                <a href="#/post/${post.slug}" class="post-card">
                    <div class="post-card-date">${formatDate(post.date)}</div>
                    <h2>${escapeHTML(post.title)}</h2>
                    <p class="excerpt">${escapeHTML(post.excerpt)}</p>
                    <div style="margin-top:10px;">
                        ${(post.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
                    </div>
                    <span class="read-more">Read &rarr;</span>
                </a>
            `).join('');
        }

        app.className = 'container wide';
        app.innerHTML = `
            <div class="blog-header">
                <h1>adobug.github.io</h1>
                <p class="subtitle">Essays on craft, clarity, and the quiet art of thinking deeply.</p>
                <span class="accent-line"></span>
            </div>
            <div class="post-list">
                ${postsHTML}
            </div>`;
    }

    function renderAbout() {
        updateActiveNav('about');
        document.title = 'About';
        app.className = 'container';
        app.innerHTML = `
            <div class="single-post">
                <div class="post-content">
                    <h1>About This Blog</h1>
                    <p>
                        A minimalist blog that's easy to host and update on GitHub Pages. Articles are written in Markdown and rendered client-side.
                    </p>
                    <h2>How to Add a New Post</h2>
                    <ol>
                        <li>Create a <code>.md</code> file in the <code>/posts/</code> folder.</li>
                        <li>Add an entry to the <code>POSTS</code> array in <code>posts.js</code>.</li>
                        <li>Push to GitHub – the post appears instantly.</li>
                    </ol>
                    <h2>Adding Images</h2>
                    <p>
                        Use standard Markdown: <code>![Alt text](image-url)</code>. For Google Photos or iCloud, use a <strong>direct link to the image file</strong> (right-click the image and copy the image address).
                    </p>
                    <h2>Views Counter</h2>
                    <p>
                        Each article shows a live view count powered by <a href="https://countapi.xyz" target="_blank" rel="noopener">CountAPI</a>. No tracking, no cookies, completely anonymous.
                    </p>
                    <blockquote>
                        <p>"Good design is as little design as possible." — Dieter Rams</p>
                    </blockquote>
                </div>
            </div>`;
    }

    async function renderPost(slug) {
        updateActiveNav('post');
        const post = (typeof POSTS !== 'undefined') ? POSTS.find(p => p.slug === slug) : undefined;

        if (!post) {
            app.className = 'container';
            app.innerHTML = `
                <div class="single-post">
                    <a href="#" class="back-link" id="backLink">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        Back to all posts
                    </a>
                    <div class="empty-state"><p>Post not found.</p></div>
                </div>`;
            document.title = 'Post Not Found';
            bindBackLink();
            return;
        }

        document.title = `${post.title} — adobug.github.io`;
        app.className = 'container';
        app.innerHTML = `
            <div class="single-post">
                <a href="#" class="back-link" id="backLink">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    Back to all posts
                </a>
                <p style="color: var(--text-muted); text-align:center; padding:40px;">Loading post…</p>
            </div>`;
        bindBackLink();

        try {
            const response = await fetch(post.file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const markdown = await response.text();

            marked.setOptions({ breaks: false, gfm: true });
            const htmlContent = marked.parse(markdown);

            const viewCount = await fetchAndIncrementViews(slug);
            const viewsHTML = `
                <span class="view-count ${viewCount === null ? 'error' : ''}">
                    <span class="icon">👁</span> ${formatViews(viewCount)} views
                </span>`;

            app.innerHTML = `
                <div class="single-post">
                    <a href="#" class="back-link" id="backLink">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        Back to all posts
                    </a>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.date)}</span>
                        ${(post.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
                        ${viewsHTML}
                    </div>
                    <div class="post-content">${htmlContent}</div>
                </div>`;
            bindBackLink();
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error('Failed to load post:', err);
            app.innerHTML = `
                <div class="single-post">
                    <a href="#" class="back-link" id="backLink">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        Back to all posts
                    </a>
                    <div class="empty-state">
                        <p>Failed to load this post. Make sure the file exists at <code>${escapeHTML(post.file)}</code>.</p>
                        <p style="font-size:0.85rem;margin-top:8px;">${escapeHTML(err.message)}</p>
                    </div>
                </div>`;
            bindBackLink();
        }
    }

    function bindBackLink() {
        const backLink = document.getElementById('backLink');
        if (backLink) {
            backLink.addEventListener('click', function(e) {
                e.preventDefault();
                navigate('home');
                renderHome();
            });
        }
    }

    // ────────────────────────────────
    // Utilities
    // ────────────────────────────────
    function formatDate(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ────────────────────────────────
    // Init & event listeners
    // ────────────────────────────────
    function handleHashChange() {
        const route = getRouteFromHash();
        if (route.view === 'home') renderHome();
        else if (route.view === 'post' && route.slug) renderPost(route.slug);
        else if (route.view === 'about') renderAbout();
    }

    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('home');
        renderHome();
    });
    navAbout.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('about');
        renderAbout();
    });
    navBrand.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('home');
        renderHome();
    });

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
})();
