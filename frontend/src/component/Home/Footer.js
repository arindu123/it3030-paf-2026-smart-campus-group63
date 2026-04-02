import React from 'react';

const footerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Sans:wght@300;400;500;600&display=swap');

  .cn-footer-wrap {
    background: #131315;
    color: rgba(255,255,255,0.55);
    font-family: 'Instrument Sans', sans-serif;
    border-top: 1px solid rgba(255,255,255,0.07);
    position: relative;
    overflow: hidden;
  }

  /* Subtle decorative gradient */
  .cn-footer-wrap::before {
    content: '';
    position: absolute;
    width: 500px; height: 300px;
    top: -160px; left: -100px;
    background: radial-gradient(ellipse at center, rgba(27,77,62,0.14) 0%, transparent 70%);
    pointer-events: none;
  }

  /* UPPER BAND */
  .cn-footer-upper {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 56px;
    padding: 64px 64px 52px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    position: relative;
  }

  /* Brand column */
  .cn-footer-brand {}
  .cn-footer-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    cursor: pointer;
  }
  .cn-footer-logomark {
    width: 34px; height: 34px;
    border-radius: 8px;
    background: #1B4D3E;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(27,77,62,0.35);
    flex-shrink: 0;
  }
  .cn-footer-logomark::before {
    content: '';
    position: absolute;
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.38);
    border-radius: 3px;
    transform: rotate(45deg);
  }
  .cn-footer-logomark::after {
    content: '';
    position: absolute;
    width: 5px; height: 5px;
    background: #fff;
    border-radius: 1px;
    transform: rotate(45deg);
  }
  .cn-footer-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 21px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.01em;
  }
  .cn-footer-wordmark em {
    font-style: normal;
    color: #C4863A;
  }

  .cn-footer-tagline {
    font-size: 13.5px;
    font-weight: 300;
    color: rgba(255,255,255,0.44);
    line-height: 1.72;
    max-width: 300px;
    margin-bottom: 28px;
  }

  /* Tech stack badges */
  .cn-footer-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .cn-footer-stack-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 4px 10px;
    border-radius: 4px;
  }
  .cn-footer-stack-badge .dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #1B4D3E;
  }
  .cn-footer-stack-badge.accent .dot {
    background: #C4863A;
  }

  /* Link columns */
  .cn-footer-col {}
  .cn-footer-col-title {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.75);
    margin-bottom: 20px;
  }
  .cn-footer-col-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cn-footer-col-link {
    font-size: 13.5px;
    font-weight: 300;
    color: rgba(255,255,255,0.44);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    background: none;
    border: none;
    padding: 0;
    text-align: left;
  }
  .cn-footer-col-link:hover {
    color: rgba(255,255,255,0.88);
  }
  .cn-footer-col-link .arrow {
    font-size: 11px;
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.2s;
  }
  .cn-footer-col-link:hover .arrow {
    opacity: 1;
    transform: translateX(0);
  }

  /* Role badges in link column */
  .cn-footer-role-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    font-weight: 300;
    color: rgba(255,255,255,0.44);
  }
  .cn-footer-role-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* LOWER BAND */
  .cn-footer-lower {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 64px;
    gap: 24px;
  }

  .cn-footer-copy {
    font-size: 12px;
    font-weight: 300;
    color: rgba(255,255,255,0.28);
    letter-spacing: 0.03em;
  }

  .cn-footer-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cn-footer-meta-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.04em;
  }
  .cn-footer-meta-sep {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
  }

  .cn-footer-back-top {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 400;
    color: rgba(255,255,255,0.32);
    cursor: pointer;
    transition: color 0.2s;
    background: none;
    border: none;
    letter-spacing: 0.04em;
  }
  .cn-footer-back-top:hover {
    color: rgba(255,255,255,0.72);
  }

  @media (max-width: 960px) {
    .cn-footer-upper {
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      padding: 48px 24px 40px;
    }
    .cn-footer-brand {
      grid-column: 1 / -1;
    }
    .cn-footer-lower {
      padding: 18px 24px;
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }
    .cn-footer-meta {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  @media (max-width: 520px) {
    .cn-footer-upper {
      grid-template-columns: 1fr;
    }
  }
`;

const platformLinks = [
  { label: 'Facility Booking',    anchor: 'modules' },
  { label: 'Incident Ticketing',  anchor: 'modules' },
  { label: 'Notifications',       anchor: null },
  { label: 'Admin Dashboard',     anchor: null },
  { label: 'API Endpoints',       anchor: null },
];

const accountLinks = [
  { label: 'Sign In',   href: '/login' },
  { label: 'Register',  href: '/register' },
  { label: 'My Bookings', href: null },
  { label: 'My Tickets',  href: null },
];

const roles = [
  { label: 'Admin',      color: '#C4863A' },
  { label: 'Technician', color: '#1B4D3E' },
  { label: 'User',       color: '#5A8FD4' },
];

const stackBadges = [
  { label: 'Spring Boot', accent: false },
  { label: 'React',       accent: false },
  { label: 'JWT Auth',    accent: false },
  { label: 'MySQL',       accent: true  },
];

export default function Footer() {
  const scrollTo = (anchor) => {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{footerStyles}</style>
      <footer className="cn-footer-wrap">

        {/* Upper section */}
        <div className="cn-footer-upper">

          {/* Brand */}
          <div className="cn-footer-brand">
            <div className="cn-footer-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="cn-footer-logomark" />
              <span className="cn-footer-wordmark">Campus<em>Nexus</em></span>
            </div>
            <p className="cn-footer-tagline">
              A unified campus operations platform for facility bookings, incident management, and role-based access — built for SLIIT IT3030.
            </p>
            <div className="cn-footer-stack">
              {stackBadges.map((b) => (
                <span key={b.label} className={`cn-footer-stack-badge${b.accent ? ' accent' : ''}`}>
                  <span className="dot" />{b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="cn-footer-col">
            <div className="cn-footer-col-title">Platform</div>
            <div className="cn-footer-col-links">
              {platformLinks.map((link) => (
                <button
                  key={link.label}
                  className="cn-footer-col-link"
                  onClick={() => scrollTo(link.anchor)}
                >
                  {link.label}
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account links */}
          <div className="cn-footer-col">
            <div className="cn-footer-col-title">Account</div>
            <div className="cn-footer-col-links">
              {accountLinks.map((link) => (
                <button
                  key={link.label}
                  className="cn-footer-col-link"
                  onClick={() => link.href && (window.location.href = link.href)}
                >
                  {link.label}
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Roles */}
          <div className="cn-footer-col">
            <div className="cn-footer-col-title">Access Roles</div>
            <div className="cn-footer-col-links">
              {roles.map((r) => (
                <div key={r.label} className="cn-footer-role-item">
                  <span className="cn-footer-role-dot" style={{ background: r.color }} />
                  {r.label}
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 300, letterSpacing: '0.02em' }}>
                  JWT-secured role-based<br />access control on all routes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower strip */}
        <div className="cn-footer-lower">
          <span className="cn-footer-copy">
            © 2026 CampusNexus · IT3030 PAF Assignment · SLIIT Faculty of Computing
          </span>

          <div className="cn-footer-meta">
            <span className="cn-footer-meta-badge">IT3030</span>
            <span className="cn-footer-meta-sep" />
            <span className="cn-footer-meta-badge">PAF Assignment</span>
            <span className="cn-footer-meta-sep" />
            <span className="cn-footer-meta-badge">SLIIT 2026</span>
          </div>

          <button
            className="cn-footer-back-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top ↑
          </button>
        </div>

      </footer>
    </>
  );
}