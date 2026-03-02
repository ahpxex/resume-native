import { pdf } from '@react-pdf/renderer';
import type { FC } from 'react';
import type { PersonalInfo, ResumeContent } from '../types';
import type { TemplateProps } from '../templates/types';

interface BuildResumePdfOptions {
  template: FC<TemplateProps>;
  personalInfo: PersonalInfo;
  content: ResumeContent;
}

export async function buildResumePdfBlob({
  template: TemplateComponent,
  personalInfo,
  content,
}: BuildResumePdfOptions): Promise<Blob> {
  return pdf(<TemplateComponent personalInfo={personalInfo} content={content} />).toBlob();
}
