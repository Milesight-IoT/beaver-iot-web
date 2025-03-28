interface RequestOptions<T> {
    /** request promise */
    dataList: T[];
    /** search value */
    search?: string;
    /** page size */
    pageSize: number;
    /** page number */
    pageNumber: number;
}

/** font page pagination */
export const paginationList = <T>({
    dataList,
    search,
    pageSize,
    pageNumber,
}: RequestOptions<T>): SearchResponseType<T[]> => {
    let list: T[] = dataList;
    // filter search
    if (search) {
        list = list.filter((item: any) => item?.name?.includes(search));
    }
    const content = list?.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    const paginationList: SearchResponseType<T[]> = {
        content,
        total: list?.length || 0,
        page_size: pageSize,
        page_number: pageNumber,
    };

    return paginationList;
};
