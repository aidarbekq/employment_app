import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';

const UNIVERSITY_URL = 'https://kstu.kg/';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: t('footer.About University'), href: UNIVERSITY_URL, external: true },
    { label: t('footer.Privacy Policy'), href: '/privacy-policy', external: false },
    { label: t('footer.Terms of Service'), href: '/terms-of-service', external: false },
  ];

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-12 md:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-400/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold leading-6 text-white">{t('app.name')}</span>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">{t('app.tagline')}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-400/10 px-3 py-1.5 text-xs font-medium text-primary-100">
              <ShieldCheck className="h-4 w-4" />
              {t('footer.departmentSystem')}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              {t('footer.Contact Us')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />
                <span className="leading-6 text-slate-300">{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Phone className="h-5 w-5 shrink-0 text-primary-300" />
                <span className="text-slate-300">+996 312 54 51 25</span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Mail className="h-5 w-5 shrink-0 text-primary-300" />
                <span className="text-slate-300">rector@kstu.kg</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              {t('footer.Quick Links')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-primary-400/40 hover:bg-primary-400/10 hover:text-white"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-primary-200" />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-primary-400/40 hover:bg-primary-400/10 hover:text-white"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-primary-200" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          <p>© {currentYear} {t('app.name')} — {t('footer.All Rights Reserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
