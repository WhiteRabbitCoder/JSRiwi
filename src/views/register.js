import * as authService from '../services/authService.js';

export function RegisterView() {
    const main = document.createElement('main');
    main.classList.add('register-page');

    // Logo Section
    const logoContainer = document.createElement('div');
    logoContainer.classList.add('logo-container');
    logoContainer.innerHTML = `
        <img src="/logo.svg" alt="Logo" class="logo-image" style="height: 60px; width: auto; margin-bottom: 8px;">
        <div class="logo-text">CRUDZASO</div>
    `;

    // Card Section
    const card = document.createElement('div');
    card.classList.add('card', 'register-card');

    // Card Header
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeader.innerHTML = `
        <h1 class="card-title">Create account</h1>
        <p class="card-subtitle">Join the task management platform today</p>
    `;

    // Form Section
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label" for="fullname">Full Name</label>
            <input type="text" id="fullname" class="form-input" placeholder="John Doe" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="email">Email address</label>
            <input type="email" id="email" class="form-input" placeholder="user@example.com" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="phone">Phone Number</label>
            <input type="tel" id="phone" class="form-input" placeholder="555-0123" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="department">Department</label>
            <select id="department" class="form-input" required>
                <option value="">Select a department</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Administrative">Administrative</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Customer Support">Customer Support</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="password-wrapper">
                <input type="password" id="password" class="form-input" placeholder="Create a password" required>
                <button type="button" class="password-toggle">
                    <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="confirm-password">Confirm Password</label>
            <div class="password-wrapper">
                <input type="password" id="confirm-password" class="form-input" placeholder="Confirm password" required>
                <button type="button" class="password-toggle-confirm">
                    <svg class="eye-icon-confirm" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>

        <p id="register-error" class="form-error" style="display:none;color:red;"></p>

        <br>
        <button type="submit" class="btn-primary">Register</button>

        <div class="signin-link">
            Already have an account? <a href="#/login">Sign in</a>
        </div>
    `;

    card.appendChild(cardHeader);
    card.appendChild(form);

    main.appendChild(logoContainer);
    main.appendChild(card);

    // Add event listeners after elements are in DOM
    setTimeout(() => {
        togglePasswordVisibility(main);
        registerRequest(main);
    }, 0);

    return main;
}

function togglePasswordVisibility(main) {
    const toggleBtn = main.querySelector('.password-toggle');
    const toggleBtnConfirm = main.querySelector('.password-toggle-confirm');
    const passwordInput = main.querySelector('#password');
    const confirmPasswordInput = main.querySelector('#confirm-password');

    if (!toggleBtn || !toggleBtnConfirm || !passwordInput || !confirmPasswordInput) return;

    // Toggle para password
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        const eyeIcon = toggleBtn.querySelector('.eye-icon');
        if (isPassword) {
            eyeIcon.innerHTML = `
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        }
    });

    // Toggle para confirm password
    toggleBtnConfirm.addEventListener('click', () => {
        const isPassword = confirmPasswordInput.type === 'password';
        confirmPasswordInput.type = isPassword ? 'text' : 'password';

        const eyeIcon = toggleBtnConfirm.querySelector('.eye-icon-confirm');
        if (isPassword) {
            eyeIcon.innerHTML = `
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        }
    });
}

function registerRequest(main) {
    const form = main.querySelector('form');
    const errorMsg = main.querySelector('#register-error');

    if (!form || !errorMsg) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = form.querySelector('#fullname').value;
        const email = form.querySelector('#email').value;
        const phone = form.querySelector('#phone').value;
        const department = form.querySelector('#department').value;
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirm-password').value;

        try {
            if (!fullname || !email || !phone || !department || !password || !confirmPassword) {
                throw new Error('Please fill in all fields');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Create user object matching the backend schema
            const userData = {
                name: fullname,
                email,
                phone,
                department,
                password
                // role will be set automatically to "client" (which represents "user") by the backend
            };

            const response = await authService.register(userData);

            if (!response.success) {
                throw new Error(response.error);
            }

            console.log('Registration successful:', response);
            // Redirect to login
            window.location.hash = '#/login';
        } catch (error) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'An error occurred during registration';
        }
    });
}
