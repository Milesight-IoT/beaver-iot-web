import { FileValueType } from '@/components/upload';

export type ImageDataType = 'entity' | 'upload' | 'url';

export interface ImageConfigType {
    label?: string;
    dataType?: ImageDataType;
    entity?: EntityOptionType;
    file?: FileValueType;
    url?: string;
}
