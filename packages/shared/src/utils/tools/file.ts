/**
 * File download and validation utilities
 */
import axios, { type Canceler } from 'axios';

/**
 * Download file based `a` tag
 * @param {string | Blob} assets - File address or blob data
 * @param {string} fileName - File name
 *
 * @description
 * ** Advantage: ** Streaming download, reducing the CPU and memory pressure when downloading large files
 *
 * ** Limited conditions: **
 * 1. For cross domain URL downloads, the `fileName` parameter will fail and cannot be renamed. You
 * can use the `xhrDownload` method to download;
 * 2. Edge and other browsers will automatically open the file preview when downloading Office files. You
 *  can use the `xhrDownload` method to download;
 */
export const linkDownload = (assets: string | Blob, fileName: string) => {
    if (!assets) return;

    const fileUrl = assets instanceof Blob ? window.URL.createObjectURL(assets) : assets;

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = fileUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(fileUrl);
    document.body.removeChild(link);
};

interface DownloadOptions {
    /**
     * File address or blob data
     */
    assets: string | Blob;
    /**
     * File name
     */
    fileName: string;
    /**
     * Download progress callback
     * @param percent Download progress percentage
     */
    onProgress?: (percent: number) => void;
    /**
     * Custom request header
     */
    header?: Record<string, string>;
}
interface xhrDownloadResponse<T> {
    /**
     * Interrupt download
     */
    abort: () => void;
    /**
     * Download success callback
     */
    then: Promise<T>['then'];
    /**
     * Download failed callback
     */
    catch: Promise<T>['catch'];
}
/**
 * HTTP-based file download
 * @param {DownloadOptions} options Download options
 * @param {string | Blob} options.assets File address or blob data
 * @param {string} options.fileName fileName
 * @param {Function} [options.onProgress] Download progress callback
 * @return {xhrDownloadResponse} return PromiseLike object
 */
export const xhrDownload = ({
    assets,
    fileName,
    onProgress,
    header,
}: DownloadOptions): xhrDownloadResponse<string> => {
    if (!assets) {
        throw new Error('assets is required');
    }

    const isBlob = assets instanceof Blob;
    const fileUrl = isBlob ? window.URL.createObjectURL(assets) : assets;

    const { CancelToken } = axios;
    let cancel: Canceler | null = null;
    const client = new Promise<string>((resolve, reject) => {
        // Use Axios to download files
        axios
            .request({
                headers: header,
                url: fileUrl,
                method: 'GET',
                responseType: 'blob',
                cancelToken: new CancelToken(c => {
                    cancel = c;
                }),
                onDownloadProgress: event => {
                    const percent = (event?.progress || 0) * 100;
                    onProgress?.(percent);
                },
            })
            .then(response => {
                const fileStream = response.data as Blob;
                linkDownload(fileStream, fileName);
                resolve(fileName);
            })
            .catch(error => {
                reject(error);
            })
            .finally(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                isBlob && window.URL.revokeObjectURL(fileUrl);
            });
    });

    return {
        abort: () => cancel?.(),
        then: client.then.bind(client),
        catch: client.catch.bind(client),
    };
};

/** Whether it is a valid file name */
export const isFileName = (name: string) => {
    const fileNameRegex = /^[^\\/:*?"<>|]+\.[a-zA-Z0-9]+$/;
    return fileNameRegex.test(name);
};
