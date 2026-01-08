import type { Template } from '@orbyt/template-schema';

export const compileToFo = (template: Template): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-height="297mm" page-width="210mm" margin="10mm">
      <fo:region-body margin-top="20mm" margin-bottom="20mm" />
      <fo:region-before extent="20mm" />
      <fo:region-after extent="20mm" />
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-family="${template.pages[0]?.regions[0]?.components[0]?.type === 'text' ? 'Inter' : 'Inter'}" font-size="12pt">Hello from Orbyt Template Studio</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
};
