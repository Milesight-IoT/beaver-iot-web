/**
 * Network and IP related utilities
 */

/**
 * Check whether it is a local IP address
 * @param {String} ip
 * @returns
 */
export const isLocalIP = (ip: string): boolean => {
    // Check whether it is an IPv6 address
    if (ip.includes(':')) {
        return (
            /^fe80::/.test(ip) ||
            /^::1$/.test(ip) ||
            /^fd[0-9a-f]{2}(:[0-9a-f]{4}){3}:[0-9a-f]{4}:[0-9a-f]{4}:[0-9a-f]{4}:[0-9a-f]{4}$/.test(
                ip,
            )
        );
    }

    // Check whether it is an IPv4 address
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) {
        return false;
    }

    const firstPart = parseInt(ipParts[0]);
    const secondPart = parseInt(ipParts[1]);

    // Check whether it is a private address
    if (firstPart === 10) {
        return true;
    }
    if (firstPart === 172 && secondPart >= 16 && secondPart <= 31) {
        return true;
    }
    if (firstPart === 192 && ipParts[1] === '168') {
        return true;
    }

    // Check whether it is a loopback address
    return ip === '127.0.0.1' || ip === '::1';
};
