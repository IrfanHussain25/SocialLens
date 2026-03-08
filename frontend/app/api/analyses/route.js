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

        const itemsWithUrls = await Promise.all(items.map(async (item) => {
            if (item.s3Key) {
                try {
                    const getObjCommand = new GetObjectCommand({
                        Bucket: 'social-lens-intake',
                        Key: item.s3Key,
                    });
                    item.videoUrl = await getSignedUrl(s3Client, getObjCommand, { expiresIn: 3600 });
                } catch (e) {
                    console.error(`Failed to generate signed URL for ${item.s3Key}:`, e);
                    item.videoUrl = null;
                }
            }
            return item;
        }));

        return NextResponse.json({ analyses: itemsWithUrls }, { status: 200 });
    } catch (error) {
        console.error('Error fetching analyses:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}




import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');
    const s3Key = searchParams.get('s3Key');

    if (!userId || !jobId) {
        return NextResponse.json({ error: 'Missing userId or jobId parameter' }, { status: 400 });
    }

    try {
        // 1. Delete from DynamoDB
        const deleteDbCommand = new DeleteCommand({
            TableName: 'social-lens-analyses',
            Key: {
                userId: userId,
                jobId: jobId
            }
        });
        await docClient.send(deleteDbCommand);

        // 2. Delete from S3 if s3Key is provided
        if (s3Key) {
            try {
                const deleteS3Command = new DeleteObjectCommand({
                    Bucket: 'social-lens-intake',
                    Key: s3Key,
                });
                await s3Client.send(deleteS3Command);
            } catch (s3Error) {
                console.error(`Failed to delete S3 object ${s3Key}:`, s3Error);
            }
        }

        return NextResponse.json({ success: true, message: 'Analysis deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting analysis:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}