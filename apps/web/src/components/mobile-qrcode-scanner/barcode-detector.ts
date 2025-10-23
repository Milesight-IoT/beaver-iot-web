import { BarcodeDetector, prepareZXingModule, ZXING_WASM_VERSION } from 'barcode-detector';
import { baseUrl } from '@milesight/shared/src/config';

prepareZXingModule({
    overrides: {
        locateFile(path: string, prefix: string) {
            if (path.endsWith('.wasm')) {
                return `${baseUrl}zxing-wasm/${ZXING_WASM_VERSION}/${path}`;
            }
            return prefix + path;
        },
    },
    fireImmediately: true,
});

export default BarcodeDetector;
