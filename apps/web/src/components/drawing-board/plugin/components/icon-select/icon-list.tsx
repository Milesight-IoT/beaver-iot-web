import { useState, useEffect } from 'react';
import { OutlinedInput, InputAdornment, Tooltip } from '@mui/material';
import * as Icons from '@milesight/shared/src/components/icons';
import { PerfectScrollbar } from '@milesight/shared/src/components';

interface IconListProps {
    options: OptionsProps[];
    onChange: (value?: string | number) => void;
    isShow: boolean;
    value?: string;
}

const IconList = (props: IconListProps) => {
    const { options, onChange, isShow, value } = props;
    const [searchValue, setSearchValue] = useState('');

    const filterOptions = () => {
        return options.filter((option: OptionsProps) => {
            return option?.label?.toLowerCase()?.includes(searchValue.toLowerCase());
        });
    };

    useEffect(() => {
        setSearchValue('');
    }, [isShow]);

    return (
        <div
            onClick={(e: any) => {
                e.stopPropagation();
            }}
            className="icon-select-list"
        >
            <div className="icon-select-list-search">
                <OutlinedInput
                    sx={{ width: '100%' }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Icons.SearchIcon />
                        </InputAdornment>
                    }
                    value={searchValue}
                    onChange={(e: any) => setSearchValue(e.target.value)}
                    size="small"
                />
            </div>
            <PerfectScrollbar className="icon-select-list-container">
                <div className="icon-select-list-main">
                    {filterOptions().map((option: OptionsProps) => {
                        const IconTag: any = (Icons as any)[option.label as string];
                        return (
                            <Tooltip title={option.label} key={option.value}>
                                <span
                                    className={`icon-select-icon ${
                                        value === option.value ? 'icon-select-icon-active' : ''
                                    }`}
                                    onClick={() => onChange(option.value)}
                                >
                                    <IconTag className="icon-select-icon-img" />
                                </span>
                            </Tooltip>
                        );
                    })}
                </div>
            </PerfectScrollbar>
        </div>
    );
};

export default IconList;
