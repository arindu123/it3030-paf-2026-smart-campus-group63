// "use client";

// import Link from "next/link";
// import Image from "next/image";

// const footerLinks = [
//   { href: "/", label: "Home" },
//   { href: "/Component/resources", label: "Resources" },
//   { href: "/Component/bookings", label: "Bookings" },
//   { href: "/Component/Ticket", label: "Tickets" },
// ];

// export default function Footer() {
//   return (
//     <footer className="mt-auto">
//       {/* Black Gradient Container */}
//       <div className="w-full overflow-hidden rounded-[0rem] bg-[linear-gradient(135deg,#000000_0%,#0f172a_100%)] text-white shadow-2xl border border-white/5">
        
//         {/* Main Section */}
//         <div className="grid gap-12 px-8 py-14 lg:grid-cols-[1.5fr_0.8fr_0.7fr] lg:px-16">
          
//           {/* Brand Info */}
//           <div className="flex flex-col items-start">
//             <Image
//               src="/uni desk logo dark.png" 
//               alt="UniDesk logo"
//               width={280}
//               height={82}
//               className="h-16 w-auto object-contain transition-transform hover:scale-105"
//               priority
//             />
//             <h2 className="mt-6 text-2xl font-bold tracking-tight text-white/90">
//               Designed for unified workspace management.
//             </h2>
//             <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
//               Manage resources, bookings, support tickets, and campus operations from a unified, smart platform.
//             </p>
//             {/* Logo Color Accent Line */}
//             <div className="mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-[#EE9B13] to-[#D78A0F]" />
//           </div>

//           {/* Navigation */}
//           <div className="lg:pl-12">
//             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#EE9B13]">
//               Quick Links
//             </p>
//             <div className="mt-8 grid gap-4">
//               {footerLinks.map((item) => (
//                 <Link 
//                   key={item.href} 
//                   href={item.href} 
//                   className="group flex items-center text-sm font-medium text-slate-300 transition hover:text-white"
//                 >
//                   <span className="mr-3 h-[2px] w-0 bg-[#EE9B13] transition-all duration-300 group-hover:w-4" />
//                   {item.label}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* Contact Details */}
//           <div>
//             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#EE9B13]">
//               Contact Desk
//             </p>
//             <div className="mt-8 space-y-5 text-sm font-medium text-slate-300">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#EE9B13]">
//                   <span className="text-lg">@</span>
//                 </div>
//                 <p>support@unidesk.local</p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#EE9B13]">
//                   <span className="text-lg">🕒</span>
//                 </div>
//                 <p className="leading-tight">Mon - Fri <br/><span className="text-xs text-slate-500">8:00 AM - 6:00 PM</span></p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Copyright Bar */}
//         <div className="border-t border-white/5 bg-black/40 px-8 py-6 lg:px-16">
//           <div className="flex flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:flex-row">
//             <p>© 2026 UNIDESK PLATFORM • YOUR SMART CAMPUS HELPER</p>
//             <div className="flex gap-8">
//               <Link href="#" className="hover:text-[#EE9B13] transition-colors">Privacy Policy</Link>
//               <Link href="#" className="hover:text-[#EE9B13] transition-colors">Terms of Use</Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/Component/resources", label: "Resources" },
  { href: "/Component/bookings", label: "Bookings" },
  { href: "/Component/Ticket", label: "Tickets" },
];

// අලුතින් එක් කළ Column එක සඳහා දත්ත
const serviceLinks = [
  { href: "#", label: "Help Center" },
  { href: "#", label: "Campus Map" },
  { href: "#", label: "Lab Schedules" },
  { href: "#", label: "Emergency Contacts" },
];

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Black Gradient Container */}
      <div className="w-full overflow-hidden rounded-[0rem] bg-[linear-gradient(135deg,#000000_0%,#0f172a_100%)] text-white shadow-2xl border border-white/5">
        
        {/* Main Section - Grid එක තීරු 4කට බෙදා ඇත */}
        <div className="grid gap-10 px-8 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.8fr] lg:px-16">
          
          {/* 1. Brand Info Column */}
          <div className="flex flex-col items-start">
            <Image
              src="/uni desk logo dark.png" 
              alt="UniDesk logo"
              width={280}
              height={82}
              className="h-14 w-auto object-contain transition-transform hover:scale-105"
              priority
            />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
              Your unified campus partner for smarter workspace management, resource allocation, and instant support.
            </p>
            {/* Social Icons Placeholder */}
            <div className="mt-6 flex gap-4">
              {['FB', 'X', 'LN', 'IG'].map((social) => (
                <div key={social} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-[#EE9B13] hover:text-white transition-all">
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Navigation Column */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#EE9B13]">
              Quick Links
            </p>
            <div className="mt-8 grid gap-4">
              {footerLinks.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="group flex items-center text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  <span className="mr-2 h-[2px] w-0 bg-[#EE9B13] transition-all duration-300 group-hover:w-3" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. NEW: Campus Services Column */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#EE9B13]">
              Services
            </p>
            <div className="mt-8 grid gap-4">
              {serviceLinks.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className="group flex items-center text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  <span className="mr-2 h-[2px] w-0 bg-[#EE9B13] transition-all duration-300 group-hover:w-3" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 4. Contact Column */}
          <div className="lg:pl-4">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#EE9B13]">
              Get Support
            </p>
            <div className="mt-8 space-y-5 text-sm font-medium text-slate-300">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#EE9B13]">
                  <span>✉</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email us</p>
                  <p className="text-white">support@unidesk.local</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#EE9B13]">
                  <span>📍</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Location</p>
                  <p className="text-white leading-tight text-xs">Faculty of Computing, <br/>Main Campus Road.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-white/5 bg-black/40 px-8 py-6 lg:px-16">
          <div className="flex flex-col items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:flex-row">
            <p>© 2026 UNIDESK PLATFORM • YOUR SMART CAMPUS HELPER</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-[#EE9B13] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#EE9B13] transition-colors">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}