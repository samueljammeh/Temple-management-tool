import { Template } from "./schema";

export const exampleTemplate: Template = {
  schemaVersion: "1.0",
  tenantId: "tenant-demo",
  templateId: "template-demo",
  name: "Orbyt Statement",
  description: "Example statement template",
  status: "draft",
  version: 1,
  createdBy: "designer@orbyt",
  updatedBy: "designer@orbyt",
  pages: [
    {
      id: "page-1",
      pageNumber: 1,
      size: "A4",
      header: {
        components: []
      },
      body: {
        components: []
      },
      footer: {
        components: []
      }
    }
  ]
};
