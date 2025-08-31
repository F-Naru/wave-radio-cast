// nextjs-app/src/lib/config.ts
import path from 'path';

// Define the base path inside the Docker container where recordings will be mounted
const CONTAINER_RECORDINGS_BASE_PATH = '/app/recordings';

// LOCATION_PATHS will be populated based on environment variables
// or fallback to a default path (useful for local development outside Docker)
export const LOCATION_PATHS: { [key: string]: string } = {
    "hiroshimaVHF": process.env.LOCATION_HIROSHIMAVHF || path.join(CONTAINER_RECORDINGS_BASE_PATH, 'hiroshimaVHF'),
    "hiroshimaCH": process.env.LOCATION_HIROSHIMACH || path.join(CONTAINER_RECORDINGS_BASE_PATH, 'hiroshimaCH'),
    // Add more locations as needed
};
