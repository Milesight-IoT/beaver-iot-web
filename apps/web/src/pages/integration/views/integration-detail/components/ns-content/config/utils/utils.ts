import type { AxiosError, AxiosResponse } from 'axios';

interface RequestOptions<T> {
    /** request promise */
    promise: Promise<T>;
    /** error return object */
    errorExt?: object;
    /** search value */
    search?: string;
    /** page size */
    pageSize: number;
    /** page number */
    pageNumber: number;
    /** list data key eg: content, gateways */
    listKey: string;
}

// font page pagination
export const getRequestList = <T, U = AxiosError>({
    promise,
    search,
    pageSize,
    pageNumber,
    listKey,
    errorExt,
}: RequestOptions<T>): Promise<
    | [U, undefined]
    | [null, AxiosResponse<ApiResponse<SearchResponseType<ApiResponse['data']['data']>>>]
> => {
    return promise
        .then<[null, AxiosResponse<ApiResponse<ApiResponse['data']['data']>>]>(
            (data: ApiResponse['data']) => {
                if (data.data?.data) {
                    let list: T[] = listKey === '' ? data.data?.data : data.data?.data?.[listKey];
                    list = Array.isArray(list) ? list : [];
                    // filter search
                    if (search) {
                        list = list.filter((item: any) => item?.name?.includes(search));
                    }
                    const content = list?.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

                    const result: SearchResponseType<T[]> = {
                        content,
                        total: list?.length || 0,
                        page_size: pageSize,
                        page_number: pageNumber,
                    };

                    data = {
                        ...data,
                        data: {
                            ...data.data,
                            data: result,
                        },
                    };
                }

                return [null, data];
            },
        )
        .catch<[U, undefined]>((err: U) => {
            if (errorExt) {
                const parsedError = { ...err, ...errorExt };
                return [parsedError, undefined];
            }
            return [err, undefined];
        });
};
