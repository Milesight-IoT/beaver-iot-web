export type InferCoordinate = [number, number, number, number];

/**
 * Inference response data
 */
export type InferenceResponse = {
    outputs: {
        data: {
            /* Image file name */
            file_name: string;
            detections: {
                /** Identify label */
                cls: string;
                /** Confidence level */
                conf: number;
                /**
                 * Rectangle coordinate [x_min, y_min, width, height]
                 */
                box?: InferCoordinate;
                /**
                 * Polygon coordinate [x, y][]
                 */
                masks?: [number, number][];
                /**
                 * Points of skeleton [x, y, pointId, conf][]
                 */
                points?: InferCoordinate[];
                /**
                 * Skeleton structure [startPointId, endPointId][]
                 */
                skeleton?: [number, number][];
            }[];
        }[];
    };
};
