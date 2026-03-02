import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const docClient = DynamoDBDocumentClient.from(client);

export async function GET(request, { params }) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resolvedParams = await params;
    const { jobId } = resolvedParams;

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
    }

    try {
        const command = new GetCommand({
            TableName: 'social-lens-analyses',
            Key: {
                userId: userId,
                jobId: jobId,
            }
        });

        const response = await docClient.send(command);

        if (!response.Item) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }

        return NextResponse.json({ analysis: response.Item }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching analysis for job ${jobId}:`, error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
