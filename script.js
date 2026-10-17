// script.js – blog engine & routing
(function() {
    const SITE_URL = 'https://adobug.github.io';
    // GoatCounter site code, e.g. 'adobug' for https://adobug.goatcounter.com.
    // Counts visits per page with no cookies or personal data. Empty = off.
    const GOATCOUNTER_CODE = 'adobug';

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
                <p class="subtitle">Short articles about my thoughts and feelings. Hope you enjoy!</p>
                <span class="accent-line"></span>
            </div>
            <div class="post-list">
                ${postsHTML}
            </div>`;
    }

    function renderAbout() {
        updateActiveNav('about');
        document.title = 'About — adobug.github.io';
        app.className = 'container';
        app.innerHTML = `
            <div class="single-post">
                <div class="post-content">
                    <h1>About</h1>
                    <p>
                        Hi, I'm adobug. I'm a med student who'd rather be out running or on a bike, and who still finds time to code now and then.
                    </p>
                    <p>
                        This is where I write short pieces about what's on my mind: sports, studying, and trying to hold on to the things I love doing while life gets busier.
                    </p>
                    <blockquote>
                        <p>"Good design is as little design as possible." — Dieter Rams</p>
                    </blockquote>
                </div>
            </div>`;
    }

    // ────────────────────────────────
    // Render a single post
    // ────────────────────────────────
    async function renderPost(slug) {
        // Show loading state immediately
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

        // Find the post data
        const post = POSTS.find(p => p.slug === slug);
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
            document.title = 'Post Not Found — adobug.github.io';
            bindBackLink();
            return;
        }

        document.title = `${post.title} — adobug.github.io`;

        try {
            const response = await fetch(post.file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const markdown = await response.text();

            marked.setOptions({ breaks: false, gfm: true });
            const htmlContent = marked.parse(markdown);

            app.innerHTML = `
                <div class="single-post">
                    <a href="#" class="back-link" id="backLink">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        Back to all posts
                    </a>
                    <h1 class="post-title">${escapeHTML(post.title)}</h1>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.date)}</span>
                        ${(post.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
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
        countVisit();
    }

    // ────────────────────────────────
    // Visit counter (GoatCounter)
    // ────────────────────────────────
    // Routes live in the hash, which GoatCounter ignores by default,
    // so each route change is counted by hand.
    function countVisit() {
        if (!window.goatcounter || !window.goatcounter.count) return;
        window.goatcounter.count({
            path: location.pathname + location.hash,
            title: document.title,
        });
    }

    if (GOATCOUNTER_CODE) {
        const gc = document.createElement('script');
        gc.async = true;
        gc.src = 'https://gc.zgo.at/count.js';
        gc.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
        gc.dataset.goatcounterSettings = '{"no_onload": true}';
        gc.onload = countVisit;  // count the page the visitor landed on
        document.head.appendChild(gc);
    }

    navHome.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('home');
    });
    navAbout.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('about');
    });
    navBrand.addEventListener('click', function(e) {
        e.preventDefault();
        navigate('home');
    });

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
})();
