import { z } from 'zod'
import { generalStatusSchema, localeSchema, slugSchema, uuidSchema } from '@/shared/validation/common'

const codeSchema = z.string().min(1).max(10)

export const currencyCreateSchema = z.object({
  code: z.string().length(3),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10),
  decimalDigits: z.number().int().min(0).max(6).default(0),
}).strict()
export const currencyUpdateSchema = currencyCreateSchema.omit({ code: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const languageCreateSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  nativeName: z.string().min(1).max(100),
}).strict()
export const languageUpdateSchema = languageCreateSchema.omit({ code: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const countryCreateSchema = z.object({
  code: z.string().length(2),
  name: z.string().min(1).max(100),
  nativeName: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  defaultCurrencyCode: z.string().length(3).optional(),
}).strict()
export const countryUpdateSchema = countryCreateSchema.omit({ code: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const provinceCreateSchema = z.object({
  countryCode: z.string().length(2),
  name: z.string().min(1).max(100),
  code: codeSchema,
}).strict()
export const provinceUpdateSchema = provinceCreateSchema.omit({ countryCode: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const cityCreateSchema = z.object({
  provinceId: uuidSchema,
  name: z.string().min(1).max(100),
}).strict()
export const cityUpdateSchema = cityCreateSchema.omit({ provinceId: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

const destinationTypeSchema = z.enum(['COUNTRY', 'REGION', 'PROVINCE_CITY', 'DESTINATION', 'ATTRACTION'])

export const destinationCreateSchema = z.object({
  parentDestinationId: uuidSchema.optional(),
  destinationType: destinationTypeSchema,
  countryCode: z.string().length(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isFeatured: z.boolean().default(false),
  translations: z
    .array(z.object({ locale: localeSchema, name: z.string().min(1).max(200), slug: slugSchema, description: z.string().max(2000).optional() }))
    .min(1),
}).strict()

export const destinationUpdateSchema = destinationCreateSchema.omit({ translations: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const productTypeCreateSchema = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
}).strict()
export const productTypeUpdateSchema = productTypeCreateSchema.omit({ code: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export const customerTypeCreateSchema = z.object({
  code: codeSchema,
  name: z.string().min(1).max(100),
}).strict()
export const customerTypeUpdateSchema = customerTypeCreateSchema.omit({ code: true }).partial().extend({
  status: generalStatusSchema.optional(),
}).strict()

export type CurrencyCreateInput = z.infer<typeof currencyCreateSchema>
export type CurrencyUpdateInput = z.infer<typeof currencyUpdateSchema>
export type LanguageCreateInput = z.infer<typeof languageCreateSchema>
export type LanguageUpdateInput = z.infer<typeof languageUpdateSchema>
export type CountryCreateInput = z.infer<typeof countryCreateSchema>
export type CountryUpdateInput = z.infer<typeof countryUpdateSchema>
export type ProvinceCreateInput = z.infer<typeof provinceCreateSchema>
export type ProvinceUpdateInput = z.infer<typeof provinceUpdateSchema>
export type CityCreateInput = z.infer<typeof cityCreateSchema>
export type CityUpdateInput = z.infer<typeof cityUpdateSchema>
export type DestinationCreateInput = z.infer<typeof destinationCreateSchema>
export type DestinationUpdateInput = z.infer<typeof destinationUpdateSchema>
export type ProductTypeCreateInput = z.infer<typeof productTypeCreateSchema>
export type ProductTypeUpdateInput = z.infer<typeof productTypeUpdateSchema>
export type CustomerTypeCreateInput = z.infer<typeof customerTypeCreateSchema>
export type CustomerTypeUpdateInput = z.infer<typeof customerTypeUpdateSchema>
