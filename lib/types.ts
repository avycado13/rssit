import { type InferSelectModel } from 'drizzle-orm';
import { entries, feeds } from './schema';

export type Entry = InferSelectModel<typeof entries>;
export type Feed = InferSelectModel<typeof feeds>;