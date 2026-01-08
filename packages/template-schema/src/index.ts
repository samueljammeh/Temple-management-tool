import { z } from 'zod';

export const TemplateVersion = z.literal('1.0');

export const Position = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const DataBinding = z.object({
  path: z.string().min(1),
});

export const TextComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('text'),
  position: Position,
  text: z.string().optional(),
  binding: DataBinding.optional(),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().default(12),
});

export const ImageComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('image'),
  position: Position,
  assetKey: z.string().min(1),
});

export const DividerComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('divider'),
  position: Position,
});

export const TableRepeaterComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('table-repeater'),
  position: Position,
  rowsPath: z.string().min(1),
  columns: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().min(1),
      width: z.number().min(1),
      binding: z.string().min(1),
    }),
  ),
});

export const TotalsBlockComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('totals-block'),
  position: Position,
  totalPath: z.string().min(1),
});

export const PaymentBlockComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('payment-block'),
  position: Position,
  instructions: z.string().min(1),
});

export const CalloutBlockComponent = z.object({
  id: z.string().uuid(),
  type: z.literal('callout-block'),
  position: Position,
  title: z.string().min(1),
  body: z.string().min(1),
});

export const Component = z.discriminatedUnion('type', [
  TextComponent,
  ImageComponent,
  DividerComponent,
  TableRepeaterComponent,
  TotalsBlockComponent,
  PaymentBlockComponent,
  CalloutBlockComponent,
]);

export const Region = z.object({
  id: z.string().uuid(),
  name: z.enum(['header', 'body', 'footer']),
  components: z.array(Component),
});

export const Page = z.object({
  id: z.string().uuid(),
  pageNumber: z.number().min(1),
  size: z.literal('A4'),
  regions: z.array(Region),
});

export const TemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().min(1),
  version: TemplateVersion,
  name: z.string().min(1),
  pages: z.array(Page).length(2),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Template = z.infer<typeof TemplateSchema>;

export const ExampleTemplate: Template = {
  id: '00000000-0000-0000-0000-000000000001',
  tenantId: 'demo-tenant',
  version: '1.0',
  name: 'Default Template',
  pages: [
    {
      id: '00000000-0000-0000-0000-000000000010',
      pageNumber: 1,
      size: 'A4',
      regions: [
        {
          id: '00000000-0000-0000-0000-000000000020',
          name: 'header',
          components: [
            {
              id: '00000000-0000-0000-0000-000000000030',
              type: 'text',
              position: { x: 24, y: 24, width: 300, height: 24 },
              text: 'Statement',
              fontFamily: 'Inter',
              fontSize: 18,
            },
          ],
        },
        {
          id: '00000000-0000-0000-0000-000000000040',
          name: 'body',
          components: [],
        },
        {
          id: '00000000-0000-0000-0000-000000000050',
          name: 'footer',
          components: [],
        },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      pageNumber: 2,
      size: 'A4',
      regions: [
        {
          id: '00000000-0000-0000-0000-000000000021',
          name: 'header',
          components: [],
        },
        {
          id: '00000000-0000-0000-0000-000000000041',
          name: 'body',
          components: [],
        },
        {
          id: '00000000-0000-0000-0000-000000000051',
          name: 'footer',
          components: [],
        },
      ],
    },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
