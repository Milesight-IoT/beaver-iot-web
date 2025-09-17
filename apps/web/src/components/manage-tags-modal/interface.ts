import { type UseFormReset } from 'react-hook-form';
import { TagOperationEnums } from '@/services/http';

export interface ManageTagsProps {
    action: TagOperationEnums;
    tags: ApiKey[];
    originalTag: ApiKey;
    replaceTag: ApiKey;
}

export interface ManageTagsFormSubmitProps {
    params: ManageTagsProps;
    reset: UseFormReset<ManageTagsProps>;
    resetTagForm: () => void;
    getTagList: () => void;
}
