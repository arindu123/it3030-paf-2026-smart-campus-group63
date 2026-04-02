
import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../Home/Nav';
import Footer from '../Home/Footer';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700&family=Instrument+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --cream:    #FAFAF7;
    --stone:    #E5DFD3;
    --charcoal: #1C1C1E;
    --mid:      #4A4A52;
    --muted:    #8A8A96;
    --green:    #1B4D3E;
    --green-l:  #2A6B56;
    --border:   #DDD8CE;
    --danger:   #B42318;
  }

  .register-page {
    font-family: 'Instrument Sans', sans-serif;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--cream);
    color: var(--charcoal);
  }

  .register-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px 72px;
    position: relative;
    overflow: hidden;
  }

  .register-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 80%, rgba(27,77,62,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(196,134,58,0.06) 0%, transparent 50%);
    pointer-events: none;
  }

  .register-back {
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
  }
  .register-back:hover { color: var(--green); }

  .register-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 48px;
    position: relative;
    z-index: 1;
  }
  .register-logomark {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--green);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(27,77,62,0.28);
  }
  .register-logomark::before {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 3px;
    transform: rotate(45deg);
  }
  .register-logomark::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 1px;
    transform: rotate(45deg);
  }
  .register-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--charcoal);
  }
  .register-wordmark em { font-style: normal; color: var(--green); }

  .register-headline {
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
  .register-headline em { font-style: italic; color: var(--green); }

  .register-sub {
    font-size: 15px;
    font-weight: 300;
    color: var(--mid);
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .register-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 64px;
    background: #fff;
    border-left: 1px solid var(--border);
  }

  .register-card {
    width: 100%;
    max-width: 460px;
  }

  .register-card-header {
    margin-bottom: 28px;
  }
  .register-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 700;
    color: var(--charcoal);
    margin-bottom: 6px;
  }
  .register-card-subtitle {
    font-size: 14px;
    font-weight: 300;
    color: var(--muted);
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .register-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .register-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .register-field.full {
    grid-column: 1 / -1;
  }

  .register-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--mid);
  }

  .register-input {
    width: 100%;
    height: 48px;
    padding: 0 14px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    color: var(--charcoal);
    background: var(--cream);
    border: 1.5px solid var(--border);
    border-radius: 9px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .register-input:hover {
    border-color: #C8C3BA;
    background: #F8F6F2;
  }
  .register-input:focus {
    border-color: var(--green);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(27,77,62,0.10);
  }

  .register-error {
    font-size: 13px;
    color: var(--danger);
    background: rgba(180,35,24,0.08);
    border: 1px solid rgba(180,35,24,0.25);
    border-radius: 8px;
    padding: 10px 12px;
  }

  .register-submit {
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
    margin-top: 6px;
  }
  .register-submit:hover {
    background: var(--green-l);
    transform: translateY(-2px);
  }

  .register-login-row {
    text-align: center;
    margin-top: 18px;
    font-size: 13.5px;
    color: var(--muted);
  }
  .register-login-link {
    color: var(--green);
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'Instrument Sans', sans-serif;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 2px;
  }
  .register-login-link:hover {
    text-decoration-color: var(--green);
  }

  @media (max-width: 900px) {
    .register-page { grid-template-columns: 1fr; }
    .register-left { display: none; }
    .register-right {
      border-left: none;
      padding: 48px 20px;
    }
  }

  @media (max-width: 540px) {
    .register-grid { grid-template-columns: 1fr; }
  }
`;

function Register() {
  const [user, setUser] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const { fullname, email, password, confirmPassword, phone } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    try {
      await axios.post('http://localhost:8082/user', user);
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div>
        <Navbar />
        <div className="register-page">
          <div className="register-left">
            <button className="register-back" onClick={() => { window.location.href = '/'; }}>
              <span>←</span> Back to home
            </button>

            <div className="register-brand">
              <div className="register-logomark" />
              <span className="register-wordmark">Campus<em>Nexus</em></span>
            </div>

            <h1 className="register-headline">
              Build your<br /><em>smart campus</em><br />account
            </h1>

            <p className="register-sub">
              Create your profile to access facility bookings, notifications, and issue tracking from one unified dashboard.
            </p>
          </div>

          <div className="register-right">
            <div className="register-card">
              <div className="register-card-header">
                <div className="register-card-title">Create account</div>
                <div className="register-card-subtitle">Fill your details to get started</div>
              </div>

              <form className="register-form" onSubmit={onSubmit}>
                <div className="register-grid">
                  <div className="register-field full">
                    <label className="register-label" htmlFor="fullname">Full name</label>
                    <input
                      className="register-input"
                      type="text"
                      id="fullname"
                      name="fullname"
                      value={fullname}
                      onChange={onInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="register-field full">
                    <label className="register-label" htmlFor="email">Email address</label>
                    <input
                      className="register-input"
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={onInputChange}
                      placeholder="you@sliit.lk"
                      required
                    />
                  </div>

                  <div className="register-field">
                    <label className="register-label" htmlFor="password">Password</label>
                    <input
                      className="register-input"
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={onInputChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <div className="register-field">
                    <label className="register-label" htmlFor="confirmPassword">Confirm password</label>
                    <input
                      className="register-input"
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onInputChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>

                  <div className="register-field full">
                    <label className="register-label" htmlFor="phone">Phone number</label>
                    <input
                      className="register-input"
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={onInputChange}
                      placeholder="07X XXX XXXX"
                      required
                    />
                  </div>
                </div>

                {errorMessage && <div className="register-error">{errorMessage}</div>}

                <button type="submit" className="register-submit">
                  Register <span>→</span>
                </button>
              </form>

              <div className="register-login-row">
                Already have an account?{' '}
                <button className="register-login-link" onClick={() => { window.location.href = '/login'; }}>
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Register;
