import React from 'react';
import { FormControl, InputLabel, FormHelperText, Button } from '@mui/material';
import { FieldError } from 'react-hook-form';
import { useControllableValue } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { UploadIcon } from '@milesight/shared/src/components';

import { Upload } from '@/components';
import { genImageUrl } from '@/utils';
import { useUploadImage } from './hooks';
import { CoverCropping } from './components';
import useDashboardListStore from '../../store';

import styles from './style.module.less';

export interface CoverSelectionProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    error?: FieldError;
    value?: string;
    onChange?: (newVal: string) => void;
}

/**
 * Cover Selection Component
 */
const CoverSelection: React.FC<CoverSelectionProps> = props => {
    const { getIntlText } = useI18n();

    const { label, required, error } = props;

    const [selectedImage, setSelectedImage] = useControllableValue<string>(props);
    const { handleUploadImage, resetManualImage, manualImage, originalImage } =
        useUploadImage(setSelectedImage);
    const { coverImages } = useDashboardListStore();

    const renderPreviewImage = () => {
        if (manualImage) {
            return <CoverCropping image={manualImage} originalImage={originalImage} />;
        }

        return (
            <div className={styles.image}>
                <img src={genImageUrl(selectedImage)} alt="failed" />
                <div className={styles.mask} />
            </div>
        );
    };

    return (
        <div className={styles['cover-selection']}>
            <FormControl fullWidth required={required}>
                <InputLabel required={required}>
                    {label || getIntlText('dashboard.label.cover')}
                </InputLabel>
                <div className={styles['cover-selection__container']}>
                    <div className={styles['cover-selection__preview']}>
                        {renderPreviewImage()}
                        <div className={styles.upload}>
                            <Upload
                                autoUpload={false}
                                onChange={handleUploadImage}
                                accept={{
                                    'image/jpg': ['.jpg', '.jpeg'],
                                    'image/png': [],
                                }}
                                maxSize={1024 * 1024 * 5}
                            >
                                <Button fullWidth variant="outlined" startIcon={<UploadIcon />}>
                                    {getIntlText('common.label.local_upload')}
                                </Button>
                            </Upload>
                        </div>
                    </div>
                    <div className={styles['cover-selection__images']}>
                        {coverImages.map(({ data }) => (
                            <div
                                key={data}
                                className={cls(styles.image, {
                                    [styles.active]: selectedImage === data,
                                })}
                                onClick={() => {
                                    resetManualImage();
                                    setSelectedImage(data);
                                }}
                            >
                                <img src={genImageUrl(data)} alt="failed" />
                            </div>
                        ))}
                    </div>
                </div>
                {!!error && (
                    <FormHelperText error sx={{ mt: 1 }}>
                        {error.message}
                    </FormHelperText>
                )}
            </FormControl>
        </div>
    );
};

export default CoverSelection;
