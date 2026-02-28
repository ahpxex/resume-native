import type { FC } from 'react';
import type { TemplateProps } from './types';
import { ClassicTemplate } from './classic';
import { ModernTemplate } from './modern';
import { MinimalTemplate } from './minimal';

interface TemplateEntry {
  id: string;
  name: string;
  description: string;
  component: FC<TemplateProps>;
}

export const templateRegistry: Record<string, TemplateEntry> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout',
    component: ClassicTemplate,
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with sidebar',
    component: ModernTemplate,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, generous whitespace',
    component: MinimalTemplate,
  },
};
