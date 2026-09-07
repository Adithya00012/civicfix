import sharp from "sharp";

// Generates a simple perceptual hash (aHash) for an image
export async function getImageHash(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    const resized = await sharp(buffer)
        .resize(8, 8, { fit: "fill" })
        .grayscale()
        .raw()
        .toBuffer();

    const pixels = Array.from(resized);
    const avg = pixels.reduce((sum, p) => sum + p, 0) / pixels.length;

    const hash = pixels.map((p) => (p > avg ? "1" : "0")).join("");
    return hash;
}

// Compares two hashes, returns similarity as a percentage (0-100)
export function compareHashes(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;
    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] === hash2[i]) matches++;
    }
    return (matches / hash1.length) * 100;
}