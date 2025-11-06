import { useState } from 'react';

export function useDeviceData() {
    const [keyword, setKeyword] = useState('');

    return {
        keyword,
        setKeyword,
    };
}
