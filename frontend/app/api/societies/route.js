import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    try {
        const command = new QueryCommand({
            TableName: 'social-lens-societies',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        });

        const response = await docClient.send(command);
        const items = response.Items || [];

        // Sort by createdAt descending
        items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const itemsWithUrls = await Promise.all(items.map(async (item) => {
            if (item.s3Key && item.postType !== 'text') {
                try {
                    const getObjCommand = new GetObjectCommand({
                        Bucket: 'social-lens-intake',
                        Key: item.s3Key,
                    });
                    item.mediaUrl = await getSignedUrl(s3Client, getObjCommand, { expiresIn: 3600 });
                } catch (e) {
                    console.error(`Failed to generate signed URL for ${item.s3Key}:`, e);
                    item.mediaUrl = null;
                }
            }
            return item;
        }));

        return NextResponse.json({ audits: itemsWithUrls }, { status: 200 });
    } catch (error) {
        console.error('Error fetching societies audits:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
