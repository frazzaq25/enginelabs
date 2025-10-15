import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { apiClient } from '../../lib/api/client';

export function HomePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['status'],
    queryFn: () => apiClient.get<{ status: string }>('/status')
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome"
        description="This is the starting point of your React + Tailwind application."
        actions={
          <Button asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Application Status">
          <div className="space-y-2">
            {isLoading && <p className="text-sm text-neutral-500">Checking backend status…</p>}
            {isError && (
              <p className="text-sm text-rose-600">
                {error instanceof Error ? error.message : 'Unable to reach the API.'}
              </p>
            )}
            {data && (
              <p className="text-sm text-neutral-700">
                API status: <span className="font-semibold">{data.status}</span>
              </p>
            )}
          </div>
        </Card>

        <Card title="Try the UI Kit">
          <form className="space-y-4">
            <Input label="Email address" name="email" placeholder="you@example.com" type="email" />
            <Input label="Password" name="password" placeholder="********" type="password" />
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
