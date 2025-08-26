import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/lib/prisma";

// Define the program API response type
interface ProgramResponse {
  success: boolean;
  program?: any;
  error?: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await the params object to avoid the NextJS warning
    const params = await context.params;
    const { id } = params;

    // Check if ID is provided
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Program ID is required" },
        { status: 400 }
      );
    }

    // Fetch the program from the Yieldkit API
    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Missing API key or API secret configuration");
      return NextResponse.json(
        { success: false, error: "API configuration error" },
        { status: 500 }
      );
    }
    
    // Get user to retrieve their siteId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || !user.siteId) {
      return NextResponse.json({ error: 'User has no associated site ID' }, { status: 400 });
    }
    
    // We need to fetch all programs and find the specific one by ID
    const apiUrl = `https://api.yieldkit.com/v1/advertiser?api_key=${apiKey}&api_secret=${apiSecret}&site_id=${user.siteId}&format=json`;

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);

      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch program: ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    // Find the specific program by ID in the advertisers array
    const program = responseData.advertisers?.find((advertiser: any) => advertiser.id === id);
    
    if (!program) {
      return NextResponse.json(
        { success: false, error: "Program not found" },
        { status: 404 }
      );
    }
    
    // Use the found program as programData
    const programData = program;

    // Check if the user has joined this program
    const userId = session.user.id;
    const programRequest = await prisma.programRequest.findFirst({
      where: {
        userId: userId,
        programId: id,
      },
    });

    // Add join status to the program data
    const programWithStatus = {
      ...programData,
      joinStatus: programRequest ? programRequest.status : null
    };

    const result: ProgramResponse = {
      success: true,
      program: programWithStatus
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching program details:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "An error occurred while fetching program details"
      },
      { status: 500 }
    );
  }
}
