import { NextRequest, NextResponse } from 'next/server'; // Add NextRequest
import fs from 'fs'; // Using callback-based fs for streams
import fsp from 'fs/promises'; // To check file stats
import path from 'path';
import { Readable } from 'stream';
import { LOCATION_PATHS } from '@/lib/config'; // Add this import

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string[] }> } // Change params to Promise<params>
) {
    const { slug } = await context.params; // Access slug from context.params
    
    if (!Array.isArray(slug) || slug.length !== 6) {
        return new NextResponse('Invalid path', { status: 400 });
    }

    const [location, frequency, year, month, day, filename] = slug;

    const basePath = LOCATION_PATHS[location];
    if (!basePath) {
        return new NextResponse('Invalid location', { status: 404 });
    }

    const filePath = path.join(basePath, frequency, year, month, day, filename);

    try {
        const stats = await fsp.stat(filePath);
        const stream = fs.createReadStream(filePath);

        const body = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

        return new NextResponse(body, {
            status: 200,
            headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': stats.size.toString(),
            },
        });

    } catch (error: unknown) {
        // Type guard for ENOENT error
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            return new NextResponse('File not found', { status: 404 });
        }
        // Generic error handling
        console.error('Error serving recording:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}