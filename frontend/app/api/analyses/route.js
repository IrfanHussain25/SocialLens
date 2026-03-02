import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const docClient = DynamoDBDocumentClient.from(client);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    try {
        const command = new QueryCommand({
            TableName: 'social-lens-analyses',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            // We usually want newest first if there's a sort key configuration that allows it, 
            // but we might need to sort in memory if the sort key is jobId and not perfectly chronological, 
            // or if we have a robust GSI setup. Let's assume standard returning and then sort.
        });

        const response = await docClient.send(command);
        const items = response.Items || [];

        // Sort by createdAt descending
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({ analyses: items }, { status: 200 });
    } catch (error) {
        console.error('Error fetching analyses:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
