import { ButtonLink } from '@/components/ui/button';
import type { CtaSettings } from '@/lib/db/settings';
import { Reveal } from './reveal';

/** Closing call to action. A single dark, centred moment so the page ends deliberately. */
export function CtaBand({ settings }: { settings: CtaSettings }) {
  return (
    <section className="relative overflow-hidden bg-deep text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_50%_0%,oklch(var(--brand)/0.32),transparent_70%)]"
      />
      <div className="shell relative py-24 text-center md:py-36">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[3.75rem]">
            {settings.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl leading-snug text-white/70 md:text-2xl">
            {settings.subheading}
          </p>
          <div className="mt-10">
            <ButtonLink href={settings.cta_href} size="lg" variant="primary">
              {settings.cta_label}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
