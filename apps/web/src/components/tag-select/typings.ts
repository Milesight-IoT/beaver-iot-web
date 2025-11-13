import { type TagItemProps } from '@/services/http';

export type ValueType = Partial<TagItemProps> & {
    id: ApiKey;
};
