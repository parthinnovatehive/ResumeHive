import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';
import type { TemplateName } from '@/types/resume';

import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { CompactTemplate } from './CompactTemplate';
import { SiliconTemplate } from './SiliconTemplate';

interface TemplateRendererProps {
  data: ResumeFormData;
  template: TemplateName;
}

export function TemplateRenderer({ data, template }: TemplateRendererProps) {
  switch (template) {
    case 'modern':
      return <ModernTemplate data={data} />;
    case 'professional':
      return <ProfessionalTemplate data={data} />;
    case 'minimal':
      return <MinimalTemplate data={data} />;
    case 'compact':
      return <CompactTemplate data={data} />;
    case 'silicon':
      return <SiliconTemplate data={data} />;
    case 'classic':
    default:
      return <ClassicTemplate data={data} />;
  }
}
