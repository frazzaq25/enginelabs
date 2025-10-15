import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DefaultOptions, QueryClientConfig } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

interface RenderOptions {
  route?: string;
  path?: string;
  queryClientConfig?: QueryClientConfig;
}

const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: false,
    refetchOnWindowFocus: false
  }
};

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', path, queryClientConfig }: RenderOptions = {}
) => {
  const mergedDefaultOptions: DefaultOptions = {
    ...defaultQueryOptions,
    ...queryClientConfig?.defaultOptions,
    queries: {
      ...defaultQueryOptions.queries,
      ...queryClientConfig?.defaultOptions?.queries
    },
    mutations: {
      ...defaultQueryOptions.mutations,
      ...queryClientConfig?.defaultOptions?.mutations
    }
  };

  const queryClient = new QueryClient({
    ...queryClientConfig,
    defaultOptions: mergedDefaultOptions
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {path ? (
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        ) : (
          children
        )}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper })
  };
};
