import Product from "../models/Product";

export const formatProductUrls = (product: any) => {
  const p = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
  const bucketName = process.env.GCS_BUCKET;
  const storageType = process.env.STORAGE_TYPE || "local";
  const gcsBaseUrl = `https://storage.googleapis.com/${bucketName}/`;

  if (storageType === "gcs" && bucketName) {
    if (p.imageUrl && !p.imageUrl.startsWith("http")) p.imageUrl = `${gcsBaseUrl}${p.imageUrl}`;
    if (p.testimonialAudioUrl && !p.testimonialAudioUrl.startsWith("http")) p.testimonialAudioUrl = `${gcsBaseUrl}${p.testimonialAudioUrl}`;
    if (p.testimonialImageUrl && !p.testimonialImageUrl.startsWith("http")) p.testimonialImageUrl = `${gcsBaseUrl}${p.testimonialImageUrl}`;
    if (p.pixImageUrl && !p.pixImageUrl.startsWith("http")) p.pixImageUrl = `${gcsBaseUrl}${p.pixImageUrl}`;
  } else if (p.imageUrl && !p.imageUrl.startsWith("http")) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    if (p.imageUrl) p.imageUrl = `${backendUrl}/public/${p.imageUrl}`;
    if (p.testimonialAudioUrl) p.testimonialAudioUrl = `${backendUrl}/public/${p.testimonialAudioUrl}`;
    if (p.testimonialImageUrl) p.testimonialImageUrl = `${backendUrl}/public/${p.testimonialImageUrl}`;
    if (p.pixImageUrl) p.pixImageUrl = `${backendUrl}/public/${p.pixImageUrl}`;
  }
  return p;
};

export const getFullUrl = (path: string) => {
  if (!path || path.startsWith("http")) return path;
  
  const bucketName = process.env.GCS_BUCKET;
  const storageType = process.env.STORAGE_TYPE || "local";
  
  if (storageType === "gcs" && bucketName) {
    return `https://storage.googleapis.com/${bucketName}/${path}`;
  } else {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return `${backendUrl}/public/${path}`;
  }
};
