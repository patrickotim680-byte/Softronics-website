import { ButtonLink } from '@/components/ui/button';
import type { CtaSettings } from '@/lib/db/settings';

/** Closing call to action. Full-bleed dark band so the page ends deliberately. */
export function CtaBand({ settings }: { settings: CtaSettings }) {
  return (
    <section className="relative overflow-hidden bg-deep text-white">
      <div className="grid-field-dark absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="shell relative py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[2.5rem]">
            {settings.heading}
          </h2>
          <p className="mt-3 text-xl text-brand-bright md:text-2xl">{settings.subheading}</p>
          <div className="mt-8">
            <ButtonLink href={settings.cta_href} size="lg" variant="primary">
              {settings.cta_label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
