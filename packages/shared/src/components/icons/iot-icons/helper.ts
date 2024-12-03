export const loadSvgSource = (source: string, id = '__svg_icon_source_iot__') => {
    const insertBefore = (newNode: Node, referenceNode: Node) => {
        referenceNode.parentNode?.insertBefore(newNode, referenceNode);
    };

    const injectSvg = () => {
        const div = document.createElement('div');

        div.id = id;
        div.innerHTML = source;

        const svg = div.getElementsByTagName('svg')[0];

        if (!svg || document.getElementById(id)) {
            console.warn('SVG source already loaded.');
            return;
        }

        svg.setAttribute('aria-hidden', 'true');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.overflow = 'hidden';
        const body = document?.body;
        if (body.firstChild) {
            insertBefore(svg, body.firstChild);
        } else {
            body.appendChild(svg);
        }
    };

    if (document.addEventListener) {
        if (['complete', 'loaded', 'interactive'].includes(document.readyState)) {
            setTimeout(injectSvg, 0);
        } else {
            const onContentLoaded = () => {
                document.removeEventListener('DOMContentLoaded', onContentLoaded);
                injectSvg();
            };
            document.addEventListener('DOMContentLoaded', onContentLoaded);
        }
    } else if ((document as any).attachEvent) {
        const onReadyStateChange = () => {
            if (document.readyState === 'complete') {
                (document as any).detachEvent('onreadystatechange', onReadyStateChange);
                injectSvg();
            }
        };

        const doScrollCheck = () => {
            try {
                (document.documentElement as any).doScroll('left');
            } catch (error) {
                setTimeout(doScrollCheck, 50);
                return;
            }
            injectSvg();
        };

        (document as any).attachEvent('onreadystatechange', onReadyStateChange);
        doScrollCheck();
    }
};
