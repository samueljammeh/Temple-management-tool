import { Template, TemplateSchema } from "./schema";

export const validateTemplate = (payload: unknown): Template => {
  return TemplateSchema.parse(payload);
};
