import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LOCATION_PATHS } from '@/lib/config'; // Add this import

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const frequency = searchParams.get('frequency');
    const dateStr = searchParams.get('date');

    if (!location || !frequency || !dateStr) {
        return NextResponse.json({ error: 'Location, frequency, and date parameters are required.' }, { status: 400 });
    }

    const basePath = LOCATION_PATHS[location];
    if (!basePath) {
        return NextResponse.json({ error: `Invalid location: ${location}` }, { status: 404 });
    }

    try {
        const dtObj = new Date(dateStr);
        if (isNaN(dtObj.getTime())) {
            throw new Error('Invalid date format');
        }

        const year = dtObj.getFullYear().toString();
        const month = (dtObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dtObj.getDate().toString().padStart(2, '0');
        const hours = dtObj.getHours().toString().padStart(2, '0');
        const minutes = dtObj.getMinutes().toString().padStart(2, '0');

        const filenameDateStr = `${year}${month}${day}${hours}${minutes}`;
        const fileName = `${location}_${frequency}_${filenameDateStr}.wav`;
        
        const filePath = path.join(basePath, frequency, year, month, day, fileName);

        await fs.access(filePath);

        const url = `/api/recordings/${location}/${frequency}/${year}/${month}/${day}/${fileName}`;
        return NextResponse.json({ success: true, url: url });

    } catch (error: unknown) {
        // Type guard for ENOENT error
        if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            return NextResponse.json({ success: false, error: 'File not found.' }, { status: 404 });
        }
        if (error instanceof Error && error.message === 'Invalid date format') { // Add type guard for error.message
            return NextResponse.json({ error: 'Invalid date format. Expected ISO format.' }, { status: 400 });
        }
        console.error('Error in /api/search:', error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
