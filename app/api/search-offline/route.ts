import { NextRequest, NextResponse } from 'next/server';
import { MOCK_STORES } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const lat = parseFloat(searchParams.get('lat') || '10.7769');
    const lng = parseFloat(searchParams.get('lng') || '106.7009');

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1000));

    // Sort by distance
    const stores = [...MOCK_STORES].sort((a, b) => a.distanceMeters - b.distanceMeters);

    return NextResponse.json({
      stores,
      keyword,
      userLocation: { lat, lng },
    });
  } catch (error) {
    console.error('search-offline error:', error);
    return NextResponse.json(
      { error: 'Không thể tìm cửa hàng gần đây. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
