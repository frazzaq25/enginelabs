import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Page } from '../../components/ui/Page';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let message = 'Something went wrong.';
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Page className="flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">We hit a snag</h1>
      <p className="max-w-md text-sm text-neutral-600">{message}</p>
      <Button onClick={() => window.location.assign('/')}>Go home</Button>
    </Page>
  );
}
