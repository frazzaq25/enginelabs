import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Switch } from '../../components/ui/Switch';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications, and integrations."
      />

      <Card title="Profile">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Full name">
            <Input name="fullName" placeholder="Ada Lovelace" />
          </FormField>
          <FormField label="Job title">
            <Input name="title" placeholder="Software Architect" />
          </FormField>
        </div>
      </Card>

      <Card title="Notifications">
        <div className="space-y-4">
          <FormField
            className="flex items-center justify-between"
            label="Email alerts"
            description="Get updates for mentions, assignments, and important status changes."
          >
            <Switch name="emailAlerts" defaultChecked />
          </FormField>

          <FormField
            className="flex items-center justify-between"
            label="Digest summary"
            description="Receive a weekly overview of project progress."
          >
            <Switch name="digest" />
          </FormField>
        </div>
      </Card>
    </div>
  );
}
