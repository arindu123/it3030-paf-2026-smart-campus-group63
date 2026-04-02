// import React,{useState} from 'react'
// import axios from 'axios';

// function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const onSubmit = async (e) => {
//         e.preventDefault();
//         const loginDetails = { email, password };
//         try {
//             const response = await axios.post("http://localhost:8082/login", loginDetails);
//             if (response.data.id) {
//                 localStorage.setItem('userId', response.data.id);//save user id
//                 alert("Login successful!");
//                 window.location.href = "/"; // Redirect to home page
//             } else {
//                 alert("Login failed. Please check your credentials.");
//             }
//         } catch (error) {
//             alert("An error occurred during login. Please try again.");
//             window.location.reload();
//         }
//     }
//   return (
//     <div>
//       <form onSubmit={(e) => onSubmit(e)}>

//         <label for="email">Email:</label><br/>
//         <input type="email" id="email" name='email' onChange={(e) => setEmail(e.target.value)} value={email} required/><br/><br/>

//         <label for="password">Password:</label><br/>
//         <input type="password" id="password" name='password' onChange={(e) => setPassword(e.target.value)} value={password} required/><br/><br/>
 
//         <button type="submit" className='form_btn'>Login</button>

//       </form>
//     </div>
//   )
// }

// export default Login



import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Home/Nav';
import Footer from '../Home/Footer';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700&family=Instrument+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --cream:    #FAFAF7;
    --cream2:   #F3F0EA;
    --stone:    #E5DFD3;
    --charcoal: #1C1C1E;
    --mid:      #4A4A52;
    --muted:    #8A8A96;
    --green:    #1B4D3E;
    --green-l:  #2A6B56;
    --green-xs: rgba(27,77,62,0.07);
    --green-sm: rgba(27,77,62,0.13);
    --accent:   #C4863A;
    --border:   #DDD8CE;
  }

  .login-page {
    font-family: 'Instrument Sans', sans-serif;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--cream);
    color: var(--charcoal);
  }

  /* ── LEFT PANEL ── */
  .login-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px 72px;
    position: relative;
    overflow: hidden;
  }

  .login-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 80%, rgba(27,77,62,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(196,134,58,0.06) 0%, transparent 50%);
    pointer-events: none;
  }

  .login-back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 400;
    color: var(--muted);
    cursor: pointer;
    margin-bottom: 64px;
    transition: color 0.2s;
    background: none;
    border: none;
    padding: 0;
    position: relative;
    z-index: 1;
    text-decoration: none;
  }
  .login-back:hover { color: var(--green); }
  .login-back-arrow { font-size: 14px; }

  .login-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;
  }
  .login-logomark {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: var(--green);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(27,77,62,0.28);
  }
  .login-logomark::before {
    content: '';
    position: absolute;
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 3px;
    transform: rotate(45deg);
  }
  .login-logomark::after {
    content: '';
    position: absolute;
    width: 6px; height: 6px;
    background: #fff;
    border-radius: 1px;
    transform: rotate(45deg);
  }
  .login-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--charcoal);
    letter-spacing: 0.01em;
  }
  .login-wordmark em { font-style: normal; color: var(--green); }

  .login-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 4vw, 52px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--charcoal);
    margin-bottom: 16px;
    position: relative;
    z-index: 1;
  }
  .login-headline em { font-style: italic; color: var(--green); }

  .login-sub {
    font-size: 15px;
    font-weight: 300;
    color: var(--mid);
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 52px;
    position: relative;
    z-index: 1;
  }

  .login-features {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  .login-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13.5px;
    font-weight: 400;
    color: var(--mid);
  }
  .login-feature-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: var(--green-xs);
    border: 1px solid rgba(27,77,62,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .login-divider-line {
    width: 40px; height: 2px;
    background: var(--accent);
    border-radius: 2px;
    margin: 40px 0;
    position: relative;
    z-index: 1;
  }

  .login-course-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--green-xs);
    border: 1px solid rgba(27,77,62,0.18);
    color: var(--green);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    position: relative;
    z-index: 1;
  }
  .login-course-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--green);
  }

  /* ── RIGHT PANEL ── */
  .login-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 64px;
    background: #fff;
    border-left: 1px solid var(--border);
  }

  .login-card {
    width: 100%;
    max-width: 420px;
  }

  .login-card-header {
    margin-bottom: 36px;
  }
  .login-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 700;
    color: var(--charcoal);
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  }
  .login-card-subtitle {
    font-size: 14px;
    font-weight: 300;
    color: var(--muted);
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .login-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .login-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--mid);
  }
  .login-input-wrap {
    position: relative;
  }
  .login-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    pointer-events: none;
    opacity: 0.45;
  }
  .login-input {
    width: 100%;
    height: 48px;
    padding: 0 14px 0 42px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--charcoal);
    background: var(--cream);
    border: 1.5px solid var(--border);
    border-radius: 9px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    appearance: none;
  }
  .login-input:hover {
    border-color: #C8C3BA;
    background: #F8F6F2;
  }
  .login-input:focus {
    border-color: var(--green);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(27,77,62,0.10);
  }
  .login-input::placeholder {
    color: var(--muted);
    font-weight: 300;
  }

  .login-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -4px 0 4px;
  }
  .login-remember {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: var(--mid);
    cursor: pointer;
  }
  .login-remember input[type="checkbox"] {
    width: 15px; height: 15px;
    accent-color: var(--green);
    cursor: pointer;
  }
  .login-forgot {
    font-size: 13px;
    color: var(--green);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'Instrument Sans', sans-serif;
    transition: opacity 0.2s;
  }
  .login-forgot:hover { opacity: 0.7; }

  .login-submit {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: #fff;
    background: var(--green);
    border: none;
    border-radius: 9px;
    cursor: pointer;
    transition: all 0.22s;
    box-shadow: 0 2px 12px rgba(27,77,62,0.22);
    margin-top: 4px;
  }
  .login-submit:hover {
    background: var(--green-l);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(27,77,62,0.28);
  }
  .login-submit:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(27,77,62,0.18);
  }
  .login-submit-arrow { transition: transform 0.2s; }
  .login-submit:hover .login-submit-arrow { transform: translateX(4px); }

  .login-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 4px 0;
  }
  .login-divider-bar {
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .login-divider-text {
    font-size: 12px;
    color: var(--muted);
    font-weight: 400;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  .login-register-row {
    text-align: center;
    font-size: 13.5px;
    color: var(--muted);
  }
  .login-register-link {
    color: var(--green);
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13.5px;
    transition: opacity 0.2s;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 2px;
  }
  .login-register-link:hover {
    opacity: 0.75;
    text-decoration-color: var(--green);
  }

  .login-trust {
    margin-top: 36px;
    padding-top: 28px;
    border-top: 1px solid var(--stone);
    display: flex;
    justify-content: center;
    gap: 22px;
  }
  .login-trust-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    color: var(--muted);
    font-weight: 400;
  }
  .login-trust-icon { font-size: 12px; }

  @media (max-width: 820px) {
    .login-page { grid-template-columns: 1fr; }
    .login-left { display: none; }
    .login-right {
      padding: 48px 24px;
      border-left: none;
      min-height: 100vh;
    }
  }
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const loginDetails = { email, password };
    try {
      const response = await axios.post("http://localhost:8082/login", loginDetails);
      if (response.data.id) {
        localStorage.setItem('userId', response.data.id);
        alert("Login successful!");
        window.location.href = "/after-login";
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      alert("An error occurred during login. Please try again.");
      window.location.reload();
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div>
        <Navbar/>
      <div className="login-page">
    

        {/* LEFT */}
        <div className="login-left">
          <button className="login-back" onClick={() => window.location.href = '/'}>
            <span className="login-back-arrow">←</span> Back to home
          </button>

          <div className="login-brand">
            <div className="login-logomark" />
            <span className="login-wordmark">Campus<em>Nexus</em></span>
          </div>

          <h1 className="login-headline">
            Welcome<br />back to<br /><em>your campus</em>
          </h1>

          <p className="login-sub">
            Sign in to manage facility bookings, track maintenance tickets, and stay on top of campus operations.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">🏛️</div>
              Book lecture halls & labs instantly
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">🔧</div>
              Raise and track incident tickets
            </div>
            <div className="login-feature">
              <div className="login-feature-icon">🔔</div>
              Real-time booking notifications
            </div>
          </div>

          <div className="login-divider-line" />

          
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-card">

            <div className="login-card-header">
              <div className="login-card-title">Sign in</div>
              <div className="login-card-subtitle">Enter your credentials to access your account</div>
            </div>

            <form className="login-form" onSubmit={onSubmit}>

              <div className="login-field">
                <label className="login-label" htmlFor="email">Email address</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">✉</span>
                  <input
                    className="login-input"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@sliit.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🔒</span>
                  <input
                    className="login-input"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-row">
                <label className="login-remember">
                  <input type="checkbox" />
                  Remember me
                </label>
                <button type="button" className="login-forgot">Forgot password?</button>
              </div>

              <button type="submit" className="login-submit">
                Sign In <span className="login-submit-arrow">→</span>
              </button>

            </form>

            <div style={{ marginTop: 24 }}>
              <div className="login-divider">
                <div className="login-divider-bar" />
                <span className="login-divider-text">Don't have an account?</span>
                <div className="login-divider-bar" />
              </div>
            </div>

            <div className="login-register-row" style={{ marginTop: 16 }}>
              <button
                className="login-register-link"
                onClick={() => window.location.href = '/register'}
              >
                Create an account
              </button>
            </div>

            <div className="login-trust">
              <div className="login-trust-item">
                <span className="login-trust-icon">🔒</span>
                OAuth 2.0
              </div>
              <div className="login-trust-item">
                <span className="login-trust-icon">⚡</span>
                JWT Secured
              </div>
              <div className="login-trust-item">
                <span className="login-trust-icon">🛡️</span>
                Role-based Access
              </div>
            </div>

          </div>
        </div>
    </div>
        <Footer />
      </div>
    </>
  );
}

export default Login;