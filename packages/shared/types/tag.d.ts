/**
 * Tag Data Model
 */
declare interface TagProps {
    id: ApiKey;
    /**
     * Tag name
     */
    name: string;
    /**
     * Tag color
     */
    color: string;
    /** Tag tip */
    description?: string;
}
