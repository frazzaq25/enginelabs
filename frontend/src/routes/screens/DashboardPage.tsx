import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { apiClient } from '../../lib/api/client';

interface ProjectSummary {
  id: string;
  name: string;
  owner: string;
  updatedAt: string;
}

export function DashboardPage() {
  const [showArchived, setShowArchived] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ['projects', { archived: showArchived }],
    queryFn: () =>
      apiClient.get<ProjectSummary[]>(showArchived ? '/projects?archived=1' : '/projects'),
    keepPreviousData: true
  });

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track your workstreams and collaborate with your team."
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setShowArchived((prev) => !prev)}>
            {showArchived ? 'Hide archived' : 'Show archived'}
          </Button>
          <Button>Create project</Button>
        </div>
      </PageHeader>

      <Card title="Active projects">
        <DataTable
          isLoading={isFetching}
          columns={[
            { header: 'Project', accessor: 'name' },
            { header: 'Owner', accessor: 'owner' },
            { header: 'Last updated', accessor: 'updatedAt' }
          ]}
          rows={rows}
          emptyState="No projects yet. Start by creating a new one."
        />
      </Card>
    </div>
  );
}
