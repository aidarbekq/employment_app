import React from 'react';
import { useTranslation } from 'react-i18next';
import { Database, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

type LegalSection = {
  title: string;
  body: string;
  items?: string[];
};

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const sections = t('legal.privacy.sections', { returnObjects: true }) as LegalSection[];

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-primary-100 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              {t('legal.privacy.badge')}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{t('legal.privacy.title')}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-primary-50 md:text-lg">
              {t('legal.privacy.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.4fr]">
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[2rem] border border-primary-100 bg-primary-50/80 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
                  <Database className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{t('legal.privacy.summaryTitle')}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{t('legal.privacy.summaryText')}</p>
              </div>
              <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Mail className="h-4 w-4 text-primary-600" />
                  {t('legal.contactTitle')}
                </div>
                <p className="text-sm leading-6 text-gray-600">{t('legal.contactText')}</p>
              </div>
            </aside>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm md:p-8">
              <div className="mb-8 flex flex-col gap-3 rounded-3xl bg-gray-50 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('legal.lastUpdated')}</p>
                  <p className="text-lg font-semibold text-gray-900">{t('legal.lastUpdatedValue')}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-700 ring-1 ring-primary-100">
                  <LockKeyhole className="h-4 w-4" />
                  {t('legal.privacy.safeData')}
                </div>
              </div>

              <div className="space-y-8">
                {sections.map((section, index) => (
                  <section key={section.title} className="scroll-mt-24">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700 ring-1 ring-primary-100">
                        {index + 1}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    </div>
                    <p className="text-sm leading-7 text-gray-600 md:text-base">{section.body}</p>
                    {section.items && section.items.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-6 text-gray-600">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
