import { type CamthinkAPISchema } from '@/services/http';

export type ValueType = Partial<CamthinkAPISchema['getDevices']['response']['content'][0]> & {
    id: ApiKey;
};
