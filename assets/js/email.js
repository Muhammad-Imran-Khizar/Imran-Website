(function () {
    // CONFIG: set these to your actual EmailJS values
    const SERVICE_ID = 'service_u0q1nla';
    const TEMPLATE_ID = 'template_i3eqopb';
    const PUBLIC_KEY = 'T7hcIIoy01keEgVAf'; // your EmailJS public/user key

    // Load EmailJS SDK with fallback
    function loadSdk() {
        const urls = [
            'https://cdn.emailjs.com/sdk/3.2.0/email.min.js',
            'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
        ];

        return new Promise((resolve) => {
            if (window.emailjs) return resolve(true);

            function tryLoad(index) {
                if (index >= urls.length) return resolve(false);
                const s = document.createElement('script');
                s.src = urls[index];
                s.onload = () => resolve(true);
                s.onerror = () => tryLoad(index + 1);
                document.head.appendChild(s);
            }

            tryLoad(0);
        });
    }

    function initEmailJS() {
        if (!window.emailjs) return;
        try {
            if (PUBLIC_KEY) {
                emailjs.init(PUBLIC_KEY);
                console.log('EmailJS initialized');
            } else {
                console.warn('PUBLIC_KEY is empty; EmailJS not initialized');
            }
        } catch (err) {
            console.error('EmailJS init error', err);
        }
    }

    // Helper that makes sure SDK is ready
    function ensureSdkReady(timeout = 3000) {
        return new Promise((resolve) => {
            if (window.emailjs) return resolve(true);
            loadSdk().then(() => resolve(true)).catch(() => resolve(false));
            // also fallback timeout
            setTimeout(() => resolve(!!window.emailjs), timeout);
        });
    }

    function bindForm() {
        // select the form inside the #contact section (matches your HTML)
        const form = document.querySelector('#contact form');
        if (!form) {
            console.warn('Contact form not found');
            return;
        }

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const origText = submitBtn ? submitBtn.textContent : null;
            
            // Create spinner element if not exists
            let spinner = form.querySelector('.email-spinner');
            if (!spinner) {
                spinner = document.createElement('div');
                spinner.className = 'email-spinner';
                spinner.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
                spinner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);';
                submitBtn.parentNode.style.position = 'relative';
                submitBtn.parentNode.appendChild(spinner);
                spinner.style.display = 'none';
            }
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '';
                spinner.style.display = 'block';
            }

            const name = form.querySelector('#name')?.value.trim() || '';
            const email = form.querySelector('#email')?.value.trim() || '';
            const phone = form.querySelector('#phone')?.value.trim() || '';
            const subject = form.querySelector('#subject')?.value.trim() || '';
            const message = form.querySelector('#message')?.value.trim() || '';

            if (!name || !email || !message) {
                alert('Please provide name, email and a message.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
                return;
            }

            // ensure SDK is available
            const ready = await ensureSdkReady();
            if (!ready || !window.emailjs) {
                alert('Email service is not available. Please try again in a moment.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
                return;
            }

            initEmailJS();

            try {
                // use sendForm so EmailJS picks up form values directly (template variables must match)
                const res = await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY || undefined);
                console.log('EmailJS sendForm result:', res);
                // Success message + shake
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success alert-dismissible fade show position-absolute';
                successMsg.innerHTML = '<strong>Thank you!</strong> Message sent successfully. <button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
                successMsg.style.cssText = 'top:0;left:50%;transform:translateX(-50%);z-index:9999;width:90%;max-width:400px;';
                form.parentNode.style.position = 'relative';
                form.parentNode.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 5000);
                
                form.reset();
            } catch (err) {
                console.error('EmailJS send error:', err);
                let details = '';
                try { details = JSON.stringify(err).slice(0, 1000); } catch (ex) { details = String(err); }
                alert('Failed to send message.\n\n' + details + '\n\nCheck console for full error.');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // bind immediately so the form doesn't navigate away if clicked before SDK loads
        bindForm();
        // start loading SDK immediately
        loadSdk().then((ready) => {
            if (ready) {
                initEmailJS();
                console.log('EmailJS SDK loaded and initialized');
            } else {
                console.error('EmailJS SDK failed to load');
            }
        }).catch((err) => {
            console.error('Error loading EmailJS SDK:', err);
        });
    });
})();