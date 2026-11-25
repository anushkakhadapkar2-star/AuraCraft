const fs = require('fs');
const path = require('path');

const b64 = fs.readFileSync(path.join(__dirname, '../public/images/clay-header-b64.txt'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura Craft - 3D Claymorphic Login</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #B9A5D8 0%, #C7B7E0 50%, #B09CD2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 16px;
      position: relative;
      overflow-x: hidden;
    }

    /* Top Brand Pill */
    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(10px);
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 4px 16px rgba(110, 85, 150, 0.18);
      margin-bottom: 20px;
      text-decoration: none;
      transition: transform 0.2s ease;
      z-index: 30;
    }
    .brand-pill:hover {
      transform: scale(1.03);
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.08em;
      color: #563A29;
    }
    .brand-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #CDAE91;
    }
    .brand-sub {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #8C7A6B;
    }

    /* Main 3D Clay Device Frame */
    .phone-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 410px;
      background: #FAF7F2;
      border-radius: 48px;
      box-shadow: 
        0 25px 60px rgba(90, 65, 140, 0.32),
        0 8px 24px rgba(0, 0, 0, 0.08),
        inset 0 3px 6px rgba(255, 255, 255, 0.95),
        inset 0 -4px 10px rgba(185, 170, 210, 0.35);
      border: 5px solid #F4EFE6;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Header Banner with Cute Girl, Pink Heart & Welcome Back */
    .header-banner {
      width: 100%;
      background: #FAF7F2;
      overflow: hidden;
      border-radius: 44px 44px 0 0;
    }
    .header-banner img {
      width: 100%;
      height: auto;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
    }

    /* Floating Interactive Form Card */
    .form-card {
      margin: -20px 16px 20px 16px;
      background: #FFFFFF;
      border-radius: 36px;
      padding: 22px 20px 24px;
      box-shadow: 
        0 14px 34px rgba(120, 95, 160, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.04),
        inset 0 2px 4px rgba(255, 255, 255, 0.95);
      position: relative;
      z-index: 20;
    }

    /* Input Pill Container */
    .input-pill {
      display: flex;
      align-items: center;
      background: #F7F4F9;
      border: 1.5px solid #EFE9F4;
      border-radius: 22px;
      padding: 6px 14px 6px 6px;
      margin-bottom: 14px;
      transition: all 0.2s ease;
      box-shadow: inset 0 2px 4px rgba(160, 140, 190, 0.06);
    }
    .input-pill:focus-within {
      background: #FFFFFF;
      border-color: #B49FE0;
      box-shadow: 
        0 0 0 4px rgba(180, 159, 224, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 0.8);
    }
    .icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 15px;
      background: linear-gradient(135deg, #BCA7E6 0%, #A88FE0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      flex-shrink: 0;
      box-shadow: 
        0 4px 10px rgba(168, 143, 224, 0.35),
        inset 0 1px 2px rgba(255, 255, 255, 0.6);
      margin-right: 12px;
    }
    .input-field {
      flex: 1;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      color: #563A29;
      outline: none;
    }
    .input-field::placeholder {
      color: #9C8FA3;
      font-weight: 400;
    }
    .toggle-eye {
      background: transparent;
      border: none;
      color: #A294AC;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }
    .toggle-eye:hover {
      color: #7B629A;
    }

    /* Forgot Password */
    .forgot-link-row {
      display: flex;
      justify-content: flex-end;
      margin-top: -4px;
      margin-bottom: 16px;
    }
    .forgot-link {
      font-size: 12px;
      font-weight: 600;
      color: #7E65A8;
      text-decoration: none;
      transition: color 0.15s;
    }
    .forgot-link:hover {
      color: #5C4582;
      text-decoration: underline;
    }

    /* 3D Clay Login Button */
    .btn-login {
      width: 100%;
      height: 52px;
      border-radius: 22px;
      border: none;
      background: linear-gradient(180deg, #A48BDE 0%, #9073D0 100%);
      color: #FFFFFF;
      font-family: inherit;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 
        0 8px 20px rgba(144, 115, 208, 0.4),
        inset 0 2px 4px rgba(255, 255, 255, 0.65),
        inset 0 -3px 6px rgba(100, 70, 160, 0.4);
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 12px 26px rgba(144, 115, 208, 0.5),
        inset 0 2px 4px rgba(255, 255, 255, 0.75),
        inset 0 -3px 6px rgba(100, 70, 160, 0.4);
    }
    .btn-login:active {
      transform: translateY(2px);
      box-shadow: 
        0 3px 10px rgba(144, 115, 208, 0.35),
        inset 0 3px 6px rgba(80, 50, 140, 0.5);
    }

    /* Divider */
    .divider-row {
      display: flex;
      align-items: center;
      margin: 18px 0 15px;
      text-align: center;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: #EFE9F4;
    }
    .divider-text {
      padding: 0 12px;
      font-size: 11px;
      color: #9C8FA3;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Social Clay Circles */
    .social-row {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-bottom: 18px;
    }
    .social-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1.5px solid #F0EAF5;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 6px 14px rgba(130, 105, 170, 0.12),
        inset 0 2px 3px rgba(255, 255, 255, 0.95);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .social-btn:hover {
      transform: translateY(-3px);
      box-shadow: 
        0 10px 20px rgba(130, 105, 170, 0.2),
        inset 0 2px 3px rgba(255, 255, 255, 0.95);
      border-color: #D6C7E8;
    }

    /* Bottom Sign Up Link */
    .signup-text {
      text-align: center;
      font-size: 13px;
      color: #7A6988;
      font-weight: 500;
    }
    .signup-link {
      color: #8C6FC5;
      font-weight: 700;
      text-decoration: none;
      margin-left: 4px;
    }
    .signup-link:hover {
      text-decoration: underline;
      color: #6C4FA5;
    }
  </style>
</head>
<body>

  <!-- Top Floating Artisan Brand Pill -->
  <a href="#" class="brand-pill">
    <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
      <rect x="24" y="24" width="464" height="464" rx="124" fill="#F8F4EE" stroke="#E9DCCB" stroke-width="16"/>
      <circle cx="170" cy="320" r="76" fill="#DDB9B4" opacity="0.4"/>
      <circle cx="320" cy="150" r="68" fill="#DDB9B4" opacity="0.4"/>
      <circle cx="256" cy="256" r="24" fill="#563A29"/>
    </svg>
    <span class="brand-title">AURA CRAFT</span>
    <span class="brand-dot"></span>
    <span class="brand-sub">Handmade with Love</span>
  </a>

  <!-- Central 3D Clay Device Frame -->
  <div class="phone-container">

    <!-- Top Section Banner: 3D Cute Pink Heart, Welcome Back with Yellow Sparkles, and Cute 3D Girl -->
    <div class="header-banner">
      <img src="${b64}" alt="Welcome Back - Cute 3D Girl and Heart">
    </div>

    <!-- Floating Interactive Form Card -->
    <div class="form-card">
      
      <form onsubmit="event.preventDefault(); alert('Login successful!');">
        <!-- Field 1: Email or Username -->
        <div class="input-pill">
          <div class="icon-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <input class="input-field" type="text" placeholder="Email or Username" required value="">
        </div>

        <!-- Field 2: Password -->
        <div class="input-pill">
          <div class="icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <input class="input-field" type="password" placeholder="Password" required value="">
          <button class="toggle-eye" type="button" aria-label="Toggle password">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <!-- Forgot Password -->
        <div class="forgot-link-row">
          <a class="forgot-link" href="#">Forgot Password?</a>
        </div>

        <!-- 3D Clay Login Button -->
        <button class="btn-login" type="submit">
          <span>Login</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider-row">
        <div class="divider-line"></div>
        <div class="divider-text">or continue with</div>
        <div class="divider-line"></div>
      </div>

      <!-- Social Logins -->
      <div class="social-row">
        <!-- Google -->
        <button class="social-btn" type="button" aria-label="Login with Google">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.16z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
        </button>

        <!-- Apple -->
        <button class="social-btn" type="button" aria-label="Login with Apple">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.63-.77 1.06-1.85.94-2.92-.91.04-2.03.61-2.68 1.37-.58.66-1.08 1.74-.95 2.8.01 0 .02 0 .03 0 1.01 0 2.03-.48 2.66-1.25z"/>
          </svg>
        </button>

        <!-- Facebook -->
        <button class="social-btn" type="button" aria-label="Login with Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
      </div>

      <!-- Sign Up Prompt -->
      <div class="signup-text">
        Don't have an account?
        <a class="signup-link" href="#">Sign Up</a>
      </div>

    </div>

  </div>

</body>
</html>`;

const outPath = 'C:/Users/Admin/.gemini/antigravity/brain/55ef05ef-88d6-4967-8c9f-11824641d066/clay_login_preview.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully wrote clay_login_preview.html with embedded base64 image!');

