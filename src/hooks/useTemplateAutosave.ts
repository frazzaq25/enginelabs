import { useEffect, useMemo, useRef, useState } from 'react';
import { ZodError } from 'zod';

import { Template, AutosaveStatus } from '../types/template';
import { TemplateSchema } from '../schema/templateSchema';
import { deepEqual } from '../utils/equality';

export interface AutosaveState {
  status: AutosaveStatus;
  message: string | null;
  lastSavedAt: string | null;
  validationErrors: string[];
}

const DEFAULT_STATE: AutosaveState = {
  status: 'idle',
  message: null,
  lastSavedAt: null,
  validationErrors: []
};

export interface UseTemplateAutosaveOptions {
  delayMs?: number;
}

export const useTemplateAutosave = (
  template: Template | null,
  saveFn: (next: Template) => Promise<Template>,
  options: UseTemplateAutosaveOptions = {}
): AutosaveState => {
  const { delayMs = 900 } = options;
  const [state, setState] = useState<AutosaveState>(DEFAULT_STATE);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<Template | null>(null);
  const initialisedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!template) {
      setState(DEFAULT_STATE);
      return;
    }

    if (!initialisedRef.current) {
      initialisedRef.current = true;
      lastSavedRef.current = template;
      setState((prev) => ({
        ...prev,
        lastSavedAt: template.updatedAt
      }));
      return;
    }

    if (lastSavedRef.current && deepEqual(template, lastSavedRef.current)) {
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'saving',
      message: 'Saving changes…',
      validationErrors: []
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const timer = setTimeout(async () => {
      try {
        const validated = TemplateSchema.parse(template);
        const saved = await saveFn(validated);
        if (!mountedRef.current) {
          return;
        }

        lastSavedRef.current = saved;
        setState({
          status: 'saved',
          message: 'All changes saved',
          lastSavedAt: saved.updatedAt,
          validationErrors: []
        });
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        if (error instanceof ZodError) {
          const messages = error.errors.map((issue) => issue.message);
          setState({
            status: 'error',
            message: messages[0] ?? 'Validation error',
            lastSavedAt: lastSavedRef.current?.updatedAt ?? null,
            validationErrors: messages
          });
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Failed to save template';
        setState({
          status: 'error',
          message,
          lastSavedAt: lastSavedRef.current?.updatedAt ?? null,
          validationErrors: []
        });
      }
    }, delayMs);

    timeoutRef.current = timer;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [template, saveFn, delayMs]);

  return useMemo(() => state, [state]);
};
