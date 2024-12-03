import { useState, useEffect } from 'react';

interface EntityProps {
    params?: Record<string, any>;
    autoSearch?: boolean;
}

const useEntity = (props?: EntityProps) => {
    const { params, autoSearch } = props || {};
    const [entity, setEntity] = useState(null);

    const fetchEntity = async (params?: Record<string, any>) => {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users}`, {
            ...(params || {}),
        });
        const data = await response.json();
        setEntity(data);
    };

    useEffect(() => {
        !!autoSearch && fetchEntity(params);
    }, [params, autoSearch]);

    return { entity, fetchEntity };
};

export default useEntity;
