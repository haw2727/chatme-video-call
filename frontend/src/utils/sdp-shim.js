// SDP module shim to fix import issues
// This creates a proper ES module wrapper around the CommonJS SDP module

let SDPUtils;

try {
    // Try to import the SDP module
    const sdpModule = await import('sdp');
    SDPUtils = sdpModule.default || sdpModule;
} catch (error) {
    console.warn('SDP module import failed, using fallback:', error);
    // Fallback - create a minimal SDP utils object
    SDPUtils = {
        generateIdentifier: () => Math.random().toString(36).substring(2, 12),
        localCName: Math.random().toString(36).substring(2, 12),
        splitLines: (blob) => blob.trim().split('\n').map(line => line.trim()),
    };
}

export default SDPUtils;
export { SDPUtils };