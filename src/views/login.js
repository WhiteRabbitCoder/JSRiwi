import * as authService from '../services/authService.js';
import userService from '../services/userService.js';
import { store } from '../state/store.js';

export function LoginView() {
    const main = document.createElement('main');
    main.classList.add('login-page');

    // Logo Section
    const logoContainer = document.createElement('div');
    logoContainer.classList.add('logo-container');
    logoContainer.innerHTML = `
        <div class="logo">C</div>
        <div class="logo-text">CRUDZASO</div>
    `;

    // Card Section
    const card = document.createElement('div');
    card.classList.add('card');

    // Card Header
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeader.innerHTML = `
        <h1 class="card-title">Welcome back</h1>
        <p class="card-subtitle">Enter your credentials to access the platform</p>
    `;

    // Form Section
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input type="email" id="email" class="form-input" placeholder="user@example.com" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="password-wrapper">
                <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                <button type="button" class="password-toggle">
                    <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>

        <p id="login-error" class="form-error" style="display:none;color:red;"></p>

        <br>
        <button type="submit" class="btn-primary">Sign in</button>

        <div class="register-link">
            Don't have an account? <a href="#/register">Register</a>
        </div>
    `;

    card.appendChild(cardHeader);
    card.appendChild(form);

    main.appendChild(logoContainer);
    main.appendChild(card);

    // Add event listeners after elements are in DOM
    setTimeout(() => {
        togglePasswordVisibility(main);
        loginRequest(main);
    }, 0);

    return main;
}

function togglePasswordVisibility(main) {
    const toggleBtn = main.querySelector('.password-toggle');
    const passwordInput = main.querySelector('#password');

    if (!toggleBtn || !passwordInput) return;

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
}

function loginRequest(main) {
    const form = main.querySelector('form');
    const errorMsg = main.querySelector('#login-error');

    if (!form || !errorMsg) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        try {
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }

            const response = await authService.login(email, password);

            if (!response.success) {
                throw new Error(response.error);
            }

            // Load user data into store
            const currentUser = await userService.getCurrentUser();
            store.setUser(currentUser);

            console.log('Login successful:', response);
            window.location.hash = '#/dashboard';
        } catch (error) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'An error occurred during login';
        }
    });
}
