// import React, {useEffect, useState} from 'react';

// function Home() {
// 			return (
// 				<div>
// 					<button onClick={() => (window.location.href='/register')}>Register</button>
// 					<button onClick={() => (window.location.href='/login')}>Login</button>
// 				</div>
// 			)
// }

// export default Home;


import React, { useEffect, useState } from 'react';
import Navbar from './Nav';
import Footer from './Footer';


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Instrument+Sans:wght@300;400;500;600&display=swap');

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
    --white:    #FFFFFF;
  }

  .cn { font-family: 'Instrument Sans', sans-serif; background: var(--cream); color: var(--charcoal); min-height: 100vh; overflow-x: hidden; }

  .cn-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250,250,247,0.93);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 64px; height: 68px;
    animation: fadeDown 0.5s ease both;
  }
  @keyframes fadeDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }

  .cn-logo { display:flex; align-items:center; gap:10px; text-decoration:none; cursor:pointer; }
  .cn-logomark {
    width:34px; height:34px; border-radius:8px;
    background: var(--green);
    display:flex; align-items:center; justify-content:center;
    position: relative;
  }
  .cn-logomark::before {
    content:''; position:absolute;
    width:13px; height:13px;
    border:2px solid rgba(255,255,255,0.45);
    border-radius:3px; transform:rotate(45deg);
  }
  .cn-logomark::after {
    content:''; position:absolute;
    width:5px; height:5px;
    background:#fff; border-radius:1px; transform:rotate(45deg);
  }
  .cn-logoname { font-family:'Cormorant Garamond',serif; font-size:21px; font-weight:700; color:var(--charcoal); letter-spacing:0.01em; }
  .cn-logoname em { font-style:normal; color:var(--green); }

  .cn-navlinks { display:flex; align-items:center; gap:32px; }
  .cn-navlink { font-size:13.5px; font-weight:400; color:var(--mid); text-decoration:none; letter-spacing:0.02em; transition:color 0.2s; cursor:pointer; }
  .cn-navlink:hover { color:var(--green); }

  .cn-nav-cta {
    display:inline-flex; align-items:center; gap:7px;
    font-family:'Instrument Sans',sans-serif; font-size:13px; font-weight:500;
    background:var(--green); color:#fff;
    padding:9px 22px; border-radius:6px; border:none; cursor:pointer;
    transition:all 0.22s; letter-spacing:0.03em;
  }
  .cn-nav-cta:hover { background:var(--green-l); transform:translateY(-1px); box-shadow:0 6px 20px rgba(27,77,62,0.22); }

  .cn-hero {
    display:grid; grid-template-columns:1fr 1fr;
    min-height: calc(100vh - 68px);
    animation: fadeUp 0.6s 0.1s ease both;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

  .cn-hero-left {
    display:flex; flex-direction:column; justify-content:center;
    padding: 80px 72px 80px 64px;
    border-right: 1px solid var(--border);
  }

  .cn-pill {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--green-xs); border:1px solid rgba(27,77,62,0.2);
    color:var(--green); font-size:11px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase;
    padding:5px 14px; border-radius:20px; width:fit-content;
    margin-bottom:28px;
  }
  .cn-pill-dot { width:5px; height:5px; background:var(--green); border-radius:50%; }

  .cn-h1 {
    font-family:'Cormorant Garamond',serif;
    font-size: clamp(44px, 4.5vw, 66px);
    font-weight:700; line-height:1.07;
    letter-spacing:-0.02em; color:var(--charcoal);
    margin-bottom:8px;
  }
  .cn-h1 em { font-style:italic; color:var(--green); }

  .cn-divider { width:52px; height:2px; background:var(--accent); margin:24px 0; border-radius:2px; }

  .cn-lead {
    font-size:16px; font-weight:300; color:var(--mid);
    line-height:1.75; max-width:460px; margin-bottom:40px;
  }

  .cn-actions { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:52px; }

  .cn-btn-primary {
    display:inline-flex; align-items:center; gap:9px;
    font-family:'Instrument Sans',sans-serif; font-size:14px; font-weight:500;
    background:var(--green); color:#fff;
    padding:14px 32px; border-radius:7px; border:none; cursor:pointer;
    transition:all 0.22s; letter-spacing:0.03em;
  }
  .cn-btn-primary:hover { background:var(--green-l); transform:translateY(-2px); box-shadow:0 10px 30px rgba(27,77,62,0.25); }
  .cn-btn-primary .arr { transition:transform 0.2s; }
  .cn-btn-primary:hover .arr { transform:translateX(4px); }

  .cn-btn-secondary {
    display:inline-flex; align-items:center; gap:9px;
    font-family:'Instrument Sans',sans-serif; font-size:14px; font-weight:500;
    background:transparent; color:var(--charcoal);
    padding:14px 32px; border-radius:7px;
    border:1.5px solid var(--border); cursor:pointer;
    transition:all 0.22s; letter-spacing:0.03em;
  }
  .cn-btn-secondary:hover { border-color:var(--green); color:var(--green); transform:translateY(-2px); }

  .cn-trust { display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
  .cn-trust-item { display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--muted); font-weight:400; }
  .cn-trust-icon { font-size:14px; }
  .cn-trust-sep { width:1px; height:16px; background:var(--border); }

  .cn-hero-right { position:relative; overflow:hidden; background:var(--cream2); }
  .cn-photo { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(0.88) contrast(1.05); }
  .cn-photo-overlay {
    position:absolute; inset:0;
    background: linear-gradient(135deg, rgba(27,77,62,0.18) 0%, transparent 60%),
                linear-gradient(to top, rgba(28,28,30,0.38) 0%, transparent 52%);
  }

  .cn-stat-card {
    position:absolute; bottom:36px; left:36px;
    background:rgba(255,255,255,0.96);
    backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,0.8);
    border-radius:12px; padding:18px 24px;
    box-shadow:0 20px 60px rgba(0,0,0,0.14);
    display:flex; gap:24px;
  }
  .cn-stat-item { text-align:center; }
  .cn-stat-num { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700; color:var(--green); line-height:1; }
  .cn-stat-label { font-size:10.5px; font-weight:500; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-top:3px; }
  .cn-stat-div { width:1px; background:var(--border); }

  .cn-role-badge {
    position:absolute; top:32px; right:32px;
    background:rgba(255,255,255,0.96); backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,0.8);
    border-radius:10px; padding:13px 18px;
    box-shadow:0 8px 32px rgba(0,0,0,0.11);
  }
  .cn-role-label { color:var(--muted); font-weight:500; margin-bottom:9px; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; }
  .cn-role-item { display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:500; color:var(--charcoal); padding:3px 0; }
  .cn-role-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .cn-role-dot.admin { background:#C4863A; }
  .cn-role-dot.tech  { background:var(--green); }
  .cn-role-dot.user  { background:#5A8FD4; }

  .cn-modules { padding:96px 64px; background:var(--white); border-top:1px solid var(--border); }
  .cn-section-label { font-size:11px; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:var(--accent); margin-bottom:14px; }
  .cn-section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,3vw,46px); font-weight:700; color:var(--charcoal); line-height:1.12; max-width:540px; margin-bottom:16px; }
  .cn-section-sub { font-size:15px; font-weight:300; color:var(--mid); max-width:520px; line-height:1.7; margin-bottom:56px; }

  .cn-modules-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:2px; background:var(--border); border-radius:14px; overflow:hidden; border:1px solid var(--border); }
  .cn-module { background:var(--white); padding:32px 28px; transition:background 0.22s; cursor:default; }
  .cn-module:hover { background:var(--green-xs); }
  .cn-module-icon { width:46px; height:46px; border-radius:11px; background:var(--green-xs); border:1px solid rgba(27,77,62,0.15); display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:18px; transition:background 0.22s; }
  .cn-module:hover .cn-module-icon { background:var(--green-sm); }
  .cn-module-tag { font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin-bottom:7px; }
  .cn-module-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:600; color:var(--charcoal); margin-bottom:8px; line-height:1.2; }
  .cn-module-desc { font-size:13px; font-weight:300; color:var(--mid); line-height:1.65; }

  .cn-how { padding:96px 64px; background:var(--cream); border-top:1px solid var(--border); }
  .cn-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:48px; margin-top:56px; position:relative; }
  .cn-steps::before { content:''; position:absolute; top:24px; left:calc(16.6% + 16px); right:calc(16.6% + 16px); height:1px; background:var(--border); z-index:0; }
  .cn-step { text-align:center; position:relative; z-index:1; }
  .cn-step-num { width:48px; height:48px; border-radius:50%; background:var(--white); border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:700; color:var(--green); margin:0 auto 20px; box-shadow:0 2px 12px rgba(0,0,0,0.06); transition:all 0.22s; }
  .cn-step:hover .cn-step-num { background:var(--green); color:#fff; border-color:var(--green); box-shadow:0 6px 24px rgba(27,77,62,0.25); }
  .cn-step-title { font-size:16px; font-weight:500; color:var(--charcoal); margin-bottom:8px; }
  .cn-step-desc { font-size:13.5px; font-weight:300; color:var(--mid); line-height:1.65; max-width:240px; margin:0 auto; }

  .cn-cta-section {
    margin:0 64px 96px;
    background:var(--green);
    border-radius:16px; padding:64px 72px;
    display:flex; align-items:center; justify-content:space-between; gap:40px;
    position:relative; overflow:hidden;
  }
  .cn-cta-section::before { content:''; position:absolute; width:400px; height:400px; border-radius:50%; background:rgba(255,255,255,0.04); top:-120px; right:-80px; }
  .cn-cta-section::after  { content:''; position:absolute; width:250px; height:250px; border-radius:50%; background:rgba(255,255,255,0.04); bottom:-100px; left:200px; }
  .cn-cta-text { position:relative; z-index:1; }
  .cn-cta-title { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,3vw,40px); font-weight:700; color:#fff; margin-bottom:10px; line-height:1.15; }
  .cn-cta-sub { font-size:15px; font-weight:300; color:rgba(255,255,255,0.72); max-width:420px; line-height:1.65; }
  .cn-cta-actions { display:flex; gap:14px; flex-shrink:0; position:relative; z-index:1; }
  .cn-cta-primary { display:inline-flex; align-items:center; gap:8px; font-family:'Instrument Sans',sans-serif; font-size:14px; font-weight:500; background:#fff; color:var(--green); padding:13px 30px; border-radius:7px; border:none; cursor:pointer; transition:all 0.22s; }
  .cn-cta-primary:hover { background:var(--cream); transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.18); }
  .cn-cta-secondary { display:inline-flex; align-items:center; gap:8px; font-family:'Instrument Sans',sans-serif; font-size:14px; font-weight:400; background:transparent; color:rgba(255,255,255,0.85); padding:13px 30px; border-radius:7px; border:1.5px solid rgba(255,255,255,0.3); cursor:pointer; transition:all 0.22s; }
  .cn-cta-secondary:hover { border-color:rgba(255,255,255,0.7); color:#fff; }

  .cn-footer { background:var(--charcoal); color:rgba(255,255,255,0.5); padding:32px 64px; display:flex; align-items:center; justify-content:space-between; font-size:12.5px; letter-spacing:0.03em; }
  .cn-footer-logo { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:700; color:#fff; }
  .cn-footer-logo em { font-style:normal; color:var(--accent); }
  .cn-footer-links { display:flex; gap:24px; }
  .cn-footer-link { color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; cursor:pointer; }
  .cn-footer-link:hover { color:rgba(255,255,255,0.8); }

  @media (max-width: 960px) {
    .cn-nav { padding:0 24px; }
    .cn-navlinks { display:none; }
    .cn-hero { grid-template-columns:1fr; min-height:auto; }
    .cn-hero-right { height:340px; }
    .cn-hero-left { padding:52px 24px; }
    .cn-modules { padding:64px 24px; }
    .cn-how { padding:64px 24px; }
    .cn-steps { grid-template-columns:1fr; gap:32px; }
    .cn-steps::before { display:none; }
    .cn-cta-section { margin:0 24px 64px; padding:44px 32px; flex-direction:column; align-items:flex-start; }
    .cn-footer { padding:24px; flex-direction:column; gap:16px; text-align:center; }
    .cn-footer-links { flex-wrap:wrap; justify-content:center; }
  }
`;

const modules = [
  { icon:'🏛️', tag:'Module A', name:'Facilities & Assets',    desc:'Catalogue lecture halls, labs, meeting rooms and equipment with live status (ACTIVE / OUT_OF_SERVICE) and availability windows.' },
  { icon:'📅', tag:'Module B', name:'Booking Management',     desc:'Submit booking requests with conflict detection. Full PENDING → APPROVED / REJECTED → CANCELLED workflow with admin oversight.' },
  { icon:'🔧', tag:'Module C', name:'Incident Ticketing',     desc:'Raise fault tickets with up to 3 image attachments. Assign technicians and track from OPEN through IN_PROGRESS to CLOSED.' },
  { icon:'🔔', tag:'Module D', name:'Smart Notifications',    desc:'Real-time alerts for booking decisions, ticket status changes and new comments — accessible via the in-app notification panel.' },
  { icon:'🔐', tag:'Module E', name:'Auth & Role Management', desc:'Google OAuth 2.0 sign-in with JWT-secured endpoints. Role-based access for USER, TECHNICIAN and ADMIN across all routes.' },
];

const steps = [
  { num:'01', title:'Create an Account',  desc:'Sign up via Google OAuth or register directly. Your assigned role determines the modules and actions available to you.' },
  { num:'02', title:'Browse & Book',      desc:'Search available facilities, check real-time slot availability, and submit booking requests — approved or rejected by admin.' },
  { num:'03', title:'Track Everything',   desc:'Receive notifications on every status change. Raise incident tickets, add comments, and follow resolutions to closure.' },
];

export default function Home() {
  const [, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="cn">

        {/* NAV */}
        {/* <nav className="cn-nav">
          <div className="cn-logo">
            <div className="cn-logomark" />
            <span className="cn-logoname">Campus<em>Nexus</em></span>
          </div>
          <div className="cn-navlinks">
            <span className="cn-navlink" onClick={() => document.getElementById('modules').scrollIntoView({behavior:'smooth'})}>Modules</span>
            <span className="cn-navlink" onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>How It Works</span>
            <span className="cn-navlink">About</span>
            <span className="cn-navlink">Contact</span>
          </div>
          <button className="cn-nav-cta" onClick={() => window.location.href='/login'}>Sign In →</button>
        </nav> */}
		<Navbar />

        {/* HERO */}
        <section className="cn-hero">
          <div className="cn-hero-left">
            <h1 className="cn-h1">
              Smart Operations<br />for the Modern<br /><em>University Campus</em>
            </h1>
            <div className="cn-divider" />
            <p className="cn-lead">
              CampusNexus unifies facility bookings, maintenance incidents, and team communications into one secure, role-aware platform — powered by Spring Boot and React.
            </p>
            <div className="cn-actions">
              <button className="cn-btn-primary" onClick={() => window.location.href='/register'}>
                Get Started <span className="arr">→</span>
              </button>
              <button className="cn-btn-secondary" onClick={() => window.location.href='/login'}>
                Sign In
              </button>
            </div>
            <div className="cn-trust">
              <div className="cn-trust-item"><span className="cn-trust-icon">🔒</span>OAuth 2.0 Secured</div>
              <div className="cn-trust-sep" />
              <div className="cn-trust-item"><span className="cn-trust-icon">⚡</span>Spring Boot REST API</div>
              <div className="cn-trust-sep" />
              <div className="cn-trust-item"><span className="cn-trust-icon">☁️</span>GitHub CI / CD</div>
            </div>
          </div>

          <div className="cn-hero-right">
            <img
              className="cn-photo"
              src="/sliit_student.jpg"
              alt="University campus building"
            />
            <div className="cn-photo-overlay" />

            <div className="cn-stat-card">
              <div className="cn-stat-item">
                <div className="cn-stat-num">5</div>
                <div className="cn-stat-label">Modules</div>
              </div>
              <div className="cn-stat-div" />
              <div className="cn-stat-item">
                <div className="cn-stat-num">20+</div>
                <div className="cn-stat-label">API Endpoints</div>
              </div>
              <div className="cn-stat-div" />
              <div className="cn-stat-item">
                <div className="cn-stat-num">3</div>
                <div className="cn-stat-label">User Roles</div>
              </div>
            </div>

            <div className="cn-role-badge">
              <div className="cn-role-label">Access Roles</div>
              <div className="cn-role-item"><span className="cn-role-dot admin" />Admin</div>
              <div className="cn-role-item"><span className="cn-role-dot tech"  />Technician</div>
              <div className="cn-role-item"><span className="cn-role-dot user"  />User</div>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section className="cn-modules" id="modules">
          <div className="cn-section-label">Core Modules</div>
          <h2 className="cn-section-title">Everything the campus needs, in one place</h2>
          <p className="cn-section-sub">Five integrated modules cover every operational workflow — from booking a lecture hall to resolving a broken projector.</p>
          <div className="cn-modules-grid">
            {modules.map((m,i) => (
              <div className="cn-module" key={i}>
                <div className="cn-module-icon">{m.icon}</div>
                <div className="cn-module-tag">{m.tag}</div>
                <div className="cn-module-name">{m.name}</div>
                <div className="cn-module-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="cn-how" id="how">
          <div className="cn-section-label">Workflow</div>
          <h2 className="cn-section-title">Up and running in three steps</h2>
          <p className="cn-section-sub">A clean, guided experience from sign-up to full campus operations management.</p>
          <div className="cn-steps">
            {steps.map((s,i) => (
              <div className="cn-step" key={i}>
                <div className="cn-step-num">{s.num}</div>
                <div className="cn-step-title">{s.title}</div>
                <div className="cn-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="cn-cta-section">
          <div className="cn-cta-text">
            <div className="cn-cta-title">Ready to modernise<br />your campus operations?</div>
            <p className="cn-cta-sub">Join staff, technicians and administrators already managing bookings and incidents through CampusNexus.</p>
          </div>
          <div className="cn-cta-actions">
            <button className="cn-cta-primary"    onClick={() => window.location.href='/register'}>Create Account →</button>
            <button className="cn-cta-secondary"  onClick={() => window.location.href='/login'}>Sign In</button>
          </div>
        </div>

        {/* FOOTER */}
        {/* <footer className="cn-footer">
          <span className="cn-footer-logo">Campus<em>Nexus</em></span>
          <span>© 2026 IT3030 · PAF Assignment · SLIIT Faculty of Computing</span>
          <div className="cn-footer-links">
            <span className="cn-footer-link" onClick={() => document.getElementById('modules').scrollIntoView({behavior:'smooth'})}>Modules</span>
            <span className="cn-footer-link" onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>How It Works</span>
            <span className="cn-footer-link" onClick={() => window.location.href='/login'}>Sign In</span>
            <span className="cn-footer-link" onClick={() => window.location.href='/register'}>Register</span>
          </div>
        </footer> */}
		<Footer />

      </div>
    </>
  );
}