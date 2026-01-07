// Custom Vite plugin to fix CommonJS module issues
export function commonjsFixPlugin() {
    return {
        name: 'commonjs-fix',
        config(config) {
            // Ensure proper CommonJS handling
            config.build = config.build || {};
            config.build.commonjsOptions = {
                ...config.build.commonjsOptions,
                transformMixedEsModules: true,
                include: [/node_modules/],
            };
        },
        resolveId(id) {
            // Handle specific problematic modules
            if (id === 'ua-parser-js') {
                return 'ua-parser-js/src/ua-parser.js';
            }
            if (id === 'sdp-transform') {
                return 'sdp-transform/lib/index.js';
            }
            return null;
        },
        load(id) {
            // Handle modules that need special treatment
            if (id.includes('ua-parser-js/src/ua-parser.js') || id.includes('sdp-transform/lib/index.js')) {
                // Let Vite handle the transformation
                return null;
            }
            return null;
        }
    };
}