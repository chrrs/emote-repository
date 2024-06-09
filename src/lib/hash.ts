export async function sha1hex(blob: Blob): Promise<string> {
	const arrayBuffer = await blob.arrayBuffer();

	const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

	return hashHex;
}
