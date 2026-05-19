import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Landmark, ExternalLink, ShieldCheck, HelpCircle, Phone, Lock, BookOpen } from 'lucide-react';

export function SBIOnlinePage() {
  const portalLinks = [
    {
      title: 'SBI Personal Banking Login',
      description: 'Access individual banking, retail internet accounts, transaction queries, and personal deposits.',
      url: 'https://retail.onlinesbi.sbi/retail/login.htm',
      badge: 'Retail',
      badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      actionText: 'Launch Personal Portal'
    },
    {
      title: 'SBI Corporate Banking Login',
      description: 'Access corporate client login, commercial tracking, salary disbursements, and institutional tools.',
      url: 'https://corporate.onlinesbi.sbi/corporate/sbi_home.html',
      badge: 'Corporate',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      actionText: 'Launch Corporate Portal'
    },
    {
      title: 'SBI Yono Portal',
      description: 'Access the digital lifestyle banking platform for quick banking services and e-commerce integrations.',
      url: 'https://www.sbiyono.sbi/',
      badge: 'Yono Digital',
      badgeColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      actionText: 'Launch Yono Web'
    }
  ];

  const safetyGuidelines = [
    {
      icon: Lock,
      title: 'Official Secure URL Verification',
      text: 'Always check that the address bar displays the official HTTPS prefix and starts with secure domains like retail.onlinesbi.sbi.'
    },
    {
      icon: ShieldCheck,
      title: 'Confidentiality Shield',
      text: 'Forge India or SBI officials will NEVER ask for your password, PIN, OTP, or CVV. Never share banking credentials over call, email, or chat.'
    },
    {
      icon: BookOpen,
      title: 'Secure Session Logout',
      text: 'Always use the standard Logout button inside the SBI portal once your transaction tasks are complete, rather than just closing the tab.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Page Header */}
      <SectionHeader
        title="SBI Online Banking Portal"
        subtitle="Quick secure links to State Bank of India net banking portals for WFH operations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Brand Visuals and Safety Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Custom Brand Logo Card */}
          <Card className="p-8 text-center bg-white dark:bg-card-dark border-border-light dark:border-border-dark flex flex-col items-center justify-center relative overflow-hidden group shadow-md">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0057b7]"></div>
            
            {/* High-quality SVG recreation of the Forge India Logo */}
            <div className="w-32 h-32 mb-4 drop-shadow-sm select-none transition-transform group-hover:scale-105 duration-300">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Royal Blue F shape */}
                <path d="M 120 70 L 280 70 L 280 120 L 170 120 L 170 270 L 120 270 Z" fill="#0057b7" />
                {/* Gold/Yellow pyramid at the bottom */}
                <polygon points="200,215 130,285 270,285" fill="#ffd800" />
                {/* Gold/Yellow flag rectangle */}
                <rect x="180" y="145" width="60" height="35" fill="#ffd800" />
                {/* Elephant silhouette representation inside flag */}
                <path d="M 195 167 C 195 160, 202 153, 210 153 C 218 153, 225 160, 225 167 C 225 174, 222 176, 218 172 C 215 170, 212 170, 210 172 C 208 174, 205 174, 203 170 C 200 167, 195 170, 195 167 Z" fill="#0057b7" />
              </svg>
            </div>

            {/* Brand Typography */}
            <h2 className="text-2xl font-black tracking-tight select-none">
              <span className="text-[#0057b7]">FORGE</span>{' '}
              <span className="text-[#ffd800]">INDIA</span>
            </h2>
            <p className="text-sm font-bold text-[#0057b7] tracking-wider mt-1 select-none font-serif">
              CONN ECT PVT.LTD
            </p>
            <p className="text-[10px] text-text-muted font-bold tracking-[0.25em] uppercase mt-2 select-none">
              SHAPING FUTURE
            </p>
          </Card>

          {/* Secure Banking Guidelines */}
          <Card title="Portal Security Tips" className="p-6">
            <div className="space-y-5 mt-4">
              {safetyGuidelines.map((g, i) => {
                const Icon = g.icon;
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary dark:text-text-dark-primary">
                        {g.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {g.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Side: Banking Portals list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {portalLinks.map((p, i) => (
              <Card key={i} className="p-6 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary group-hover:text-accent transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full md:w-auto"
                    >
                      <Button
                        variant="accent"
                        icon={ExternalLink}
                        className="w-full md:w-auto shadow-sm shadow-accent/20"
                      >
                        {p.actionText}
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Helpline Support */}
          <Card className="p-6 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 border border-accent/20 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="p-3.5 rounded-full bg-accent text-white shadow-md shadow-accent/20">
                  <Phone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-text-primary dark:text-text-dark-primary">
                    SBI Net Banking Customer Helpline
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Facing issues logging in or need credential support? Contact SBI official support.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <a
                  href="tel:18001234"
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-sm font-bold text-text-primary dark:text-text-dark-primary hover:border-accent dark:hover:border-accent transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Phone className="w-4 h-4 text-accent" />
                  1800 123 4 / 1800 2100
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
