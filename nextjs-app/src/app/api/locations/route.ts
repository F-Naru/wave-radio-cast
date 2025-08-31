import { NextResponse } from 'next/server';
import fs from 'fs';

import { LOCATION_PATHS } from '@/lib/config'; // Add this import

export async function GET() {
    try {
        // 実際に存在するディレクトリの地点のみをリストアップ
        const availableLocations = Object.keys(LOCATION_PATHS).filter(location => {
            const locPath = LOCATION_PATHS[location];
            return fs.existsSync(locPath);
        });

        return NextResponse.json({ locations: availableLocations });

    } catch (error: unknown) {
        console.error("Error in /api/locations:", error);
        return NextResponse.json({ error: 'Failed to get locations.' }, { status: 500 });
    }
}
