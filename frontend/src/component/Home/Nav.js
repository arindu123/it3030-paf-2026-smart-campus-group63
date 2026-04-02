import React, { useState, useEffect } from 'react';

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@300;400;500;600&display=swap');

  .cn-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 70px;
    display: flex;
    align-items: center;
    padding: 0 56px;
    transition: all 0.35s ease;
  }

  .cn-nav.scrolled {
    background: rgba(250, 250, 247, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 #E5DFD3, 0 4px 24px rgba(28,28,30,0.06);
  }

  .cn-nav.top {
    background: transparent;
  }

  /* LEFT — Logo */
  .cn-nav-logo {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
    cursor: pointer;
    flex-shrink: 0;
  }

  .cn-nav-mark {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: #1B4D3E;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(27,77,62,0.30);
    transition: box-shadow 0.25s;
  }
  .cn-nav-logo:hover .cn-nav-mark {
    box-shadow: 0 4px 20px rgba(27,77,62,0.40);
  }
  .cn-nav-mark::before {
    content: '';
    position: absolute;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 3px;
    transform: rotate(45deg);
  }
  .cn-nav-mark::after {
    content: '';
    position: absolute;
    width: 5px; height: 5px;
    background: #fff;
    border-radius: 1px;
    transform: rotate(45deg);
  }

  .cn-nav-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 700;
    color: #1C1C1E;
    letter-spacing: 0.01em;
    line-height: 1;
  }
  .cn-nav-wordmark em {
    font-style: normal;
    color: #1B4D3E;
  }

  /* CENTER — Links */
  .cn-nav-center {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: 4px;
  }

  .cn-nav-link {
    position: relative;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 400;
    color: #4A4A52;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    letter-spacing: 0.025em;
    white-space: nowrap;
    background: transparent;
    border: none;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .cn-nav-link:hover {
    color: #1B4D3E;
    background: rgba(27,77,62,0.06);
  }
  .cn-nav-link.active {
    color: #1B4D3E;
    font-weight: 500;
  }
  .cn-nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 2px;
    background: #1B4D3E;
    border-radius: 2px;
  }

  /* Badge for Notifications */
  .cn-nav-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #C4863A;
    color: #fff;
    font-size: 9.5px;
    font-weight: 600;
    min-width: 17px;
    height: 17px;
    border-radius: 9px;
    padding: 0 4px;
    letter-spacing: 0;
  }

  /* RIGHT — Actions */
  .cn-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .cn-nav-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #1B4D3E;
    background: rgba(27,77,62,0.08);
    border: 1px solid rgba(27,77,62,0.18);
    padding: 5px 12px;
    border-radius: 20px;
  }
  .cn-nav-pill-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #1B4D3E;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(0.85); }
  }

  .cn-nav-divider {
    width: 1px;
    height: 22px;
    background: #DDD8CE;
  }

  .cn-nav-btn-ghost {
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 400;
    color: #4A4A52;
    background: transparent;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
    letter-spacing: 0.02em;
  }
  .cn-nav-btn-ghost:hover {
    color: #1B4D3E;
    background: rgba(27,77,62,0.06);
  }

  .cn-nav-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    background: #1B4D3E;
    color: #fff;
    padding: 9px 22px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: all 0.22s;
    box-shadow: 0 2px 8px rgba(27,77,62,0.22);
  }
  .cn-nav-btn-primary:hover {
    background: #2A6B56;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(27,77,62,0.30);
  }
  .cn-nav-btn-primary .cn-arrow {
    transition: transform 0.2s;
    font-size: 14px;
  }
  .cn-nav-btn-primary:hover .cn-arrow {
    transform: translateX(3px);
  }

  /* Mobile */
  .cn-nav-hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 6px;
    background: none;
    border: none;
  }
  .cn-nav-hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: #1C1C1E;
    border-radius: 2px;
    transition: all 0.25s;
  }

  .cn-nav-mobile-menu {
    display: none;
    position: fixed;
    top: 70px;
    left: 0; right: 0;
    background: rgba(250,250,247,0.98);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #E5DFD3;
    padding: 16px 24px 24px;
    box-shadow: 0 16px 48px rgba(28,28,30,0.12);
    z-index: 99;
    animation: slideDown 0.25s ease;
  }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

  .cn-nav-mobile-menu.open { display: block; }

  .cn-nav-mobile-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: #4A4A52;
    padding: 13px 0;
    border-bottom: 1px solid #F0EDE8;
    cursor: pointer;
    transition: color 0.2s;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;
    width: 100%;
    text-align: left;
  }
  .cn-nav-mobile-link:last-of-type { border-bottom: none; }
  .cn-nav-mobile-link:hover { color: #1B4D3E; }

  .cn-nav-mobile-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  .cn-nav-mobile-actions .cn-nav-btn-ghost {
    flex: 1;
    text-align: center;
    border: 1.5px solid #DDD8CE;
    border-radius: 7px;
  }
  .cn-nav-mobile-actions .cn-nav-btn-primary {
    flex: 1;
    justify-content: center;
  }

  @media (max-width: 900px) {
    .cn-nav { padding: 0 20px; }
    .cn-nav-center { display: none; }
    .cn-nav-pill { display: none; }
    .cn-nav-divider { display: none; }
    .cn-nav-btn-ghost { display: none; }
    .cn-nav-btn-primary { display: none; }
    .cn-nav-hamburger { display: flex; }
  }
`;

const navLinks = [
  { label: 'Facilities & Assets Catalogue', anchor: null },
  { label: 'Booking Resource', anchor: null },
  { label: 'Maintenance & Incident Ticketing', anchor: null },
  { label: 'About', anchor: null },
  { label: 'Contact Us',anchor: null },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('userId'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (anchor) => {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setMobileOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      <style>{navStyles}</style>

      <nav className={`cn-nav ${scrolled ? 'scrolled' : 'top'}`}>
        {/* Logo */}
        <div className="cn-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="cn-nav-mark" />
          <span className="cn-nav-wordmark">Campus<em>Nexus</em></span>
        </div>

        {/* Center links */}
        <div className="cn-nav-center">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="cn-nav-link"
              onClick={() => scrollTo(link.anchor)}
            >
              {link.label}
              {link.badge && (
                <span className="cn-nav-badge">{link.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="cn-nav-right">

          <div className="cn-nav-divider" />
          {isLoggedIn ? (
            <>
              <button className="cn-nav-btn-ghost" onClick={() => window.location.href = '/after-login'}>
                Profile
              </button>
              <button className="cn-nav-btn-primary" onClick={handleLogout}>
                Logout <span className="cn-arrow">→</span>
              </button>
            </>
          ) : (
            <>
              <button className="cn-nav-btn-ghost" onClick={() => window.location.href = '/login'}>
                Sign In
              </button>
              <button className="cn-nav-btn-primary" onClick={() => window.location.href = '/register'}>
                Sign Up <span className="cn-arrow">→</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="cn-nav-hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span style={mobileOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
          <span style={mobileOpen ? { opacity: 0 } : {}} />
          <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`cn-nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <button
            key={link.label}
            className="cn-nav-mobile-link"
            onClick={() => scrollTo(link.anchor)}
          >
            {link.label}
            {link.badge ? <span className="cn-nav-badge">{link.badge}</span> : <span>›</span>}
          </button>
        ))}
        <div className="cn-nav-mobile-actions">
          {isLoggedIn ? (
            <>
              <button className="cn-nav-btn-ghost" onClick={() => window.location.href = '/after-login'}>Profile</button>
              <button className="cn-nav-btn-primary" onClick={handleLogout}>Logout →</button>
            </>
          ) : (
            <>
              <button className="cn-nav-btn-ghost" onClick={() => window.location.href = '/login'}>Sign In</button>
              <button className="cn-nav-btn-primary" onClick={() => window.location.href = '/register'}>Get Started →</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}