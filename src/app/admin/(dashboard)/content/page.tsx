import { PageHeader } from '@/components/admin/page-header';
import { SettingsForm, type SettingsFieldDef } from '@/components/admin/settings-form';
import { Alert } from '@/components/ui/alert';
import { getSettings } from '@/lib/db/settings';

export const metadata = { title: 'Site content' };

const GROUPS: {
  key: 'general' | 'home_hero' | 'home_cta' | 'about';
  title: string;
  description: string;
  fields: SettingsFieldDef[];
}[] = [
  {
    key: 'general',
    title: 'General',
    description: 'Company details used in the header, footer and contact page.',
    fields: [
      { name: 'company_name', label: 'Company name' },
      { name: 'tagline', label: 'Tagline', hint: 'Shown in the footer.' },
      { name: 'contact_email', label: 'Contact email' },
      {
        name: 'whatsapp_number',
        label: 'WhatsApp number',
        hint: 'Digits with country code. Leave empty to hide the WhatsApp link.',
      },
      { name: 'location_label', label: 'Location label' },
    ],
  },
  {
    key: 'home_hero',
    title: 'Homepage hero',
    description: 'The first thing a visitor reads.',
    fields: [
      { name: 'heading', label: 'Heading', multiline: true },
      { name: 'description', label: 'Description', multiline: true },
      { name: 'primary_cta_label', label: 'Primary button label' },
      { name: 'primary_cta_href', label: 'Primary button link' },
      { name: 'secondary_cta_label', label: 'Secondary button label' },
      { name: 'secondary_cta_href', label: 'Secondary button link' },
    ],
  },
  {
    key: 'home_cta',
    title: 'Closing call to action',
    description: 'The dark band at the end of the homepage, solutions and products pages.',
    fields: [
      { name: 'heading', label: 'Heading', multiline: true },
      { name: 'subheading', label: 'Subheading' },
      { name: 'cta_label', label: 'Button label' },
      { name: 'cta_href', label: 'Button link' },
    ],
  },
  {
    key: 'about',
    title: 'About page',
    description: 'The philosophy statement at the top of /about.',
    fields: [
      { name: 'philosophy_heading', label: 'Heading', multiline: true },
      { name: 'philosophy_body', label: 'Body', multiline: true },
    ],
  },
];

export default async function AdminContentPage() {
  const values = await Promise.all(GROUPS.map((group) => getSettings(group.key)));

  return (
    <div className="space-y-7">
      <PageHeader
        title="Site content"
        description="Copy that lives on fixed sections of the website. Saved values override the built-in defaults."
      />

      <Alert tone="info" title="How this works">
        <p>
          Leaving a field empty restores the built-in default rather than blanking the website, so
          the site can never render with missing copy.
        </p>
      </Alert>

      <div className="space-y-6">
        {GROUPS.map((group, index) => (
          <SettingsForm
            key={group.key}
            settingsKey={group.key}
            title={group.title}
            description={group.description}
            fields={group.fields}
            values={values[index] as unknown as Record<string, string>}
          />
        ))}
      </div>
    </div>
  );
}
