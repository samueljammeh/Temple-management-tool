import { z } from "zod";

export const TenantIdSchema = z.string().min(1);
export const TemplateIdSchema = z.string().min(1);
export const ComponentIdSchema = z.string().min(1);

export const PositionSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive()
});

export const TextStyleSchema = z.object({
  fontFamily: z.string().min(1).default("Helvetica"),
  fontSize: z.number().positive().default(10),
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/).default("#000000"),
  align: z.enum(["left", "center", "right"]).default("left")
});

export const BindingSchema = z.object({
  path: z.string().min(1),
  fallback: z.string().default("")
});

export const TextComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("text"),
  position: PositionSchema,
  content: z.string().optional(),
  binding: BindingSchema.optional(),
  style: TextStyleSchema
}).refine((value) => value.content || value.binding, {
  message: "Text component must include content or binding"
});

export const ImageComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("image"),
  position: PositionSchema,
  assetId: z.string().min(1),
  description: z.string().default("")
});

export const DividerComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("divider"),
  position: PositionSchema,
  strokeWidth: z.number().positive().default(1),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/).default("#000000")
});

export const TableColumnSchema = z.object({
  id: z.string().min(1),
  header: z.string().min(1),
  width: z.number().positive(),
  binding: BindingSchema
});

export const TableComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("table"),
  position: PositionSchema,
  rowBinding: BindingSchema,
  columns: z.array(TableColumnSchema).min(1)
});

export const TotalsComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("totals"),
  position: PositionSchema,
  label: z.string().default("Total"),
  amountBinding: BindingSchema
});

export const PaymentComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("payment"),
  position: PositionSchema,
  instruction: z.string().min(1),
  accountBinding: BindingSchema
});

export const CalloutComponentSchema = z.object({
  id: ComponentIdSchema,
  type: z.literal("callout"),
  position: PositionSchema,
  title: z.string().min(1),
  body: z.string().min(1)
});

export const ComponentSchema = z.discriminatedUnion("type", [
  TextComponentSchema,
  ImageComponentSchema,
  DividerComponentSchema,
  TableComponentSchema,
  TotalsComponentSchema,
  PaymentComponentSchema,
  CalloutComponentSchema
]);

export const RegionSchema = z.object({
  components: z.array(ComponentSchema).default([])
});

export const PageSchema = z.object({
  id: z.string().min(1),
  pageNumber: z.number().int().positive(),
  size: z.literal("A4"),
  header: RegionSchema,
  body: RegionSchema,
  footer: RegionSchema
});

export const TemplateSchema = z.object({
  schemaVersion: z.literal("1.0"),
  tenantId: TenantIdSchema,
  templateId: TemplateIdSchema,
  name: z.string().min(1),
  description: z.string().default(""),
  status: z.enum(["draft", "published"]),
  version: z.number().int().positive(),
  pages: z.array(PageSchema).min(1),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1)
});

export type Template = z.infer<typeof TemplateSchema>;
export type Component = z.infer<typeof ComponentSchema>;
