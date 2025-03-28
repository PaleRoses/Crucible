// src/app/api/[...route]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Your data store implementation
const dataStore = {
  "app-config": {
    title: "Your Application Title",
    description: "Your application description",
    navigation: [
      { id: "home", label: "Home", url: "/", isActive: true },
      { id: "products", label: "Products", url: "/products", isActive: false },
    ]
  },
  "main-content": {
    title: "Main Content",
    paragraphs: ["Your actual content here"]
  },
  // Include other data objects
};

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  // Validate params to prevent errors
  if (!params || !params.route || !Array.isArray(params.route)) {
    return NextResponse.json(
      { error: 'Invalid route parameters' },
      { status: 400 }
    );
  }
  
  // Safely join the route segments
  const endpoint = params.route.join('/');
  console.log(`[API] Request for: ${endpoint}`);
  
  try {
    // Return the data if it exists
    if (endpoint in dataStore) {
      return NextResponse.json(dataStore[endpoint as keyof typeof dataStore]);
    }
    
    // Handle endpoint not found
    return NextResponse.json(
      { error: `Endpoint '${endpoint}' not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`[API] Error handling '${endpoint}':`, error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}