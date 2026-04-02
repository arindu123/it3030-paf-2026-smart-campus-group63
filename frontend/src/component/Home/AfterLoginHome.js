import React from 'react';
import Navbar from './Nav';
import Footer from './Footer';

const styles = `
	@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Instrument+Sans:wght@300;400;500;600&display=swap');

	:root {
		--cream: #fafaf7;
		--paper: #ffffff;
		--stone: #e5dfd3;
		--ink: #1c1c1e;
		--text: #4a4a52;
		--muted: #8a8a96;
		--green: #1b4d3e;
		--green-2: #2a6b56;
		--gold: #c4863a;
		--mint: rgba(27, 77, 62, 0.08);
	}

	.al-shell {
		font-family: 'Instrument Sans', sans-serif;
		min-height: 100vh;
		color: var(--ink);
		background: linear-gradient(180deg, #f7f6f2 0%, #fafaf7 36%, #ffffff 100%);
	}

	.al-main {
		padding: 36px 64px 72px;
		display: grid;
		gap: 32px;
	}

	.al-hero {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--stone);
		border-radius: 20px;
		background:
			radial-gradient(circle at 82% 18%, rgba(196, 134, 58, 0.14) 0%, transparent 42%),
			radial-gradient(circle at 20% 100%, rgba(27, 77, 62, 0.13) 0%, transparent 48%),
			linear-gradient(130deg, #ffffff 0%, #f4f1ea 100%);
		padding: 42px 44px;
		animation: rise 0.55s ease both;
	}

	.al-hero::after {
		content: '';
		position: absolute;
		width: 340px;
		height: 340px;
		right: -120px;
		top: -140px;
		border-radius: 50%;
		background: rgba(27, 77, 62, 0.08);
	}

	.al-tag {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		border: 1px solid rgba(27, 77, 62, 0.24);
		background: rgba(27, 77, 62, 0.06);
		color: var(--green);
		border-radius: 999px;
		padding: 6px 13px;
		position: relative;
		z-index: 1;
	}

	.al-tag-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--green);
	}

	.al-title {
		margin-top: 18px;
		font-family: 'Cormorant Garamond', serif;
		font-size: clamp(32px, 4vw, 50px);
		line-height: 1.08;
		letter-spacing: -0.02em;
		max-width: 740px;
		position: relative;
		z-index: 1;
	}

	.al-title em {
		font-style: italic;
		color: var(--green);
	}

	.al-sub {
		margin-top: 14px;
		color: var(--text);
		font-size: 15px;
		line-height: 1.7;
		max-width: 700px;
		position: relative;
		z-index: 1;
	}

	.al-actions {
		margin-top: 24px;
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		position: relative;
		z-index: 1;
	}

	.al-btn-primary,
	.al-btn-secondary {
		border-radius: 8px;
		border: none;
		font-family: 'Instrument Sans', sans-serif;
		font-size: 13.5px;
		cursor: pointer;
		transition: all 0.22s ease;
		padding: 12px 20px;
	}

	.al-btn-primary {
		background: var(--green);
		color: #fff;
		font-weight: 500;
		box-shadow: 0 8px 24px rgba(27, 77, 62, 0.25);
	}

	.al-btn-primary:hover {
		background: var(--green-2);
		transform: translateY(-2px);
	}

	.al-btn-secondary {
		background: #fff;
		color: var(--ink);
		border: 1.5px solid var(--stone);
		font-weight: 400;
	}

	.al-btn-secondary:hover {
		border-color: var(--green);
		color: var(--green);
		transform: translateY(-2px);
	}

	.al-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 24px;
	}

	.al-card {
		background: var(--paper);
		border: 1px solid var(--stone);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 12px 30px rgba(21, 24, 30, 0.05);
	}

	.al-card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 18px;
	}

	.al-card-title {
		font-size: 17px;
		font-weight: 500;
		color: var(--ink);
	}

	.al-link {
		border: none;
		background: transparent;
		color: var(--green);
		font-size: 13px;
		cursor: pointer;
		padding: 0;
	}

	.al-link:hover { text-decoration: underline; }

	.al-kpi-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	.al-kpi {
		padding: 16px;
		border: 1px solid var(--stone);
		border-radius: 12px;
		background: linear-gradient(180deg, #fff 0%, #fcfbf8 100%);
	}

	.al-kpi-label {
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 10px;
	}

	.al-kpi-value {
		font-family: 'Cormorant Garamond', serif;
		font-size: 34px;
		line-height: 1;
		color: var(--green);
	}

	.al-kpi-note {
		margin-top: 8px;
		font-size: 12px;
		color: var(--text);
	}

	.al-activity-list {
		display: grid;
		gap: 10px;
	}

	.al-activity {
		border: 1px solid var(--stone);
		border-radius: 12px;
		padding: 12px 14px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		background: #fff;
	}

	.al-activity-meta {
		font-size: 12px;
		color: var(--muted);
		margin-top: 4px;
	}

	.al-chip {
		font-size: 11px;
		border-radius: 999px;
		padding: 5px 10px;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.al-chip.approved {
		color: #1b6a44;
		background: rgba(27, 106, 68, 0.12);
	}

	.al-chip.pending {
		color: #7b5b19;
		background: rgba(196, 134, 58, 0.15);
	}

	.al-chip.progress {
		color: #1b4d3e;
		background: var(--mint);
	}

	.al-side-list {
		display: grid;
		gap: 10px;
	}

	.al-side-item {
		border: 1px solid var(--stone);
		border-radius: 12px;
		padding: 12px;
		background: #fff;
	}

	.al-side-time {
		display: inline-block;
		margin-top: 6px;
		font-size: 11px;
		color: var(--muted);
	}

	.al-modules {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 12px;
	}

	.al-module {
		border: 1px solid var(--stone);
		border-radius: 12px;
		padding: 16px;
		background: linear-gradient(180deg, #fff 0%, #fcfaf6 100%);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.al-module:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 22px rgba(28, 28, 30, 0.08);
	}

	.al-module-name {
		font-size: 15px;
		font-weight: 500;
		margin: 10px 0 6px;
	}

	.al-module-desc {
		font-size: 13px;
		color: var(--text);
		line-height: 1.6;
	}

	@keyframes rise {
		from { opacity: 0; transform: translateY(14px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 960px) {
		.al-main {
			padding: 24px;
			gap: 22px;
		}

		.al-hero {
			padding: 28px 24px;
		}

		.al-grid {
			grid-template-columns: 1fr;
		}

		.al-kpi-row {
			grid-template-columns: 1fr;
		}
	}
`;

const quickModules = [
	{ icon: '🏛️', name: 'Facility Booking', desc: 'Reserve lecture halls and labs with conflict-safe time slots.' },
	{ icon: '🛠️', name: 'Incident Tickets', desc: 'Report issues, attach images, and track technician updates.' },
	{ icon: '🔔', name: 'Notifications', desc: 'Get instant alerts for booking decisions and ticket changes.' },
	{ icon: '📊', name: 'Usage Insights', desc: 'View occupancy trends and recurring maintenance hotspots.' },
];

const activityItems = [
	{ text: 'Booking request approved for Lab A-302', time: '2 mins ago', status: 'approved' },
	{ text: 'Ticket #INC-214 moved to IN_PROGRESS', time: '18 mins ago', status: 'progress' },
	{ text: 'New booking request for Seminar Hall 2', time: '1 hour ago', status: 'pending' },
];

const notificationItems = [
	{ title: 'Admin comment added on Ticket #INC-198', time: '5 mins ago' },
	{ title: 'Your booking for Auditorium is tomorrow 9:00 AM', time: '35 mins ago' },
	{ title: 'Technician assigned to Projector issue (LH-01)', time: '2 hours ago' },
];

export default function AfterLoginHome() {
	return (
		<>
			<style>{styles}</style>
			<div className="al-shell">
				<Navbar />

				<main className="al-main">
					<section className="al-hero">
						<span className="al-tag"><span className="al-tag-dot" /> Signed In Dashboard</span>
						<h1 className="al-title">Welcome back. Your <em>campus operations</em> are all in one place.</h1>
						<p className="al-sub">
							Track bookings, incidents, and role-based tasks from a single modern workspace designed for staff,
							technicians, and administrators.
						</p>
						<div className="al-actions">
							<button className="al-btn-primary" onClick={() => window.location.href = '/'}>Explore Platform</button>
							<button className="al-btn-secondary" onClick={() => window.location.href = '/login'}>Switch Account</button>
						</div>
					</section>

					<section className="al-grid" id="how">
						<article className="al-card">
							<div className="al-card-head">
								<h2 className="al-card-title">Today at a glance</h2>
								<button className="al-link">View reports</button>
							</div>

							<div className="al-kpi-row">
								<div className="al-kpi">
									<div className="al-kpi-label">Active Bookings</div>
									<div className="al-kpi-value">28</div>
									<div className="al-kpi-note">+6 from yesterday</div>
								</div>
								<div className="al-kpi">
									<div className="al-kpi-label">Open Tickets</div>
									<div className="al-kpi-value">14</div>
									<div className="al-kpi-note">4 high-priority incidents</div>
								</div>
								<div className="al-kpi">
									<div className="al-kpi-label">Pending Approvals</div>
									<div className="al-kpi-value">09</div>
									<div className="al-kpi-note">Requires admin review</div>
								</div>
							</div>
						</article>

						<aside className="al-card">
							<div className="al-card-head">
								<h2 className="al-card-title">Recent Notifications</h2>
							</div>
							<div className="al-side-list">
								{notificationItems.map((item, index) => (
									<div className="al-side-item" key={index}>
										<div>{item.title}</div>
										<span className="al-side-time">{item.time}</span>
									</div>
								))}
							</div>
						</aside>
					</section>

					<section className="al-card" id="modules">
						<div className="al-card-head">
							<h2 className="al-card-title">Quick Access Modules</h2>
						</div>
						<div className="al-modules">
							{quickModules.map((module) => (
								<div className="al-module" key={module.name}>
									<div>{module.icon}</div>
									<h3 className="al-module-name">{module.name}</h3>
									<p className="al-module-desc">{module.desc}</p>
								</div>
							))}
						</div>
					</section>

					<section className="al-card">
						<div className="al-card-head">
							<h2 className="al-card-title">Live Activity Feed</h2>
							<button className="al-link">Open all</button>
						</div>
						<div className="al-activity-list">
							{activityItems.map((item, index) => (
								<div className="al-activity" key={index}>
									<div>
										<div>{item.text}</div>
										<div className="al-activity-meta">{item.time}</div>
									</div>
									<span className={`al-chip ${item.status}`}>{item.status}</span>
								</div>
							))}
						</div>
					</section>
				</main>

				<Footer />
			</div>
		</>
	);
}
