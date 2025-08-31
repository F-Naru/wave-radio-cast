import { NextResponse } from 'next/server';
import fs from 'fs/promises'; // Use promises version of fs

import { LOCATION_PATHS } from '@/lib/config'; // Add this import

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!location) {
        return NextResponse.json({ error: 'Location parameter is required.' }, { status: 400 });
    }

    const basePath = LOCATION_PATHS[location];
    if (!basePath) {
        return NextResponse.json({ error: `Configuration for location '${location}' not found.` }, { status: 404 });
    }

    try {
        // Check if base path exists
        await fs.access(basePath);

        const dirents = await fs.readdir(basePath, { withFileTypes: true });
        const frequencies = dirents
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        return NextResponse.json({ frequencies });

    } catch (error: unknown) {
        // Type guard for ENOENT error
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
             return NextResponse.json({ error: `Directory for location '${location}' not found.` }, { status: 404 });
        }
        console.error(`Error reading directory for location '${location}':`, error);
        return NextResponse.json({ error: `Failed to read directory for location '${location}'.` }, { status: 500 });
    }
}
