import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
            TableName: 'social-lens-societies',
            Key: {
                userId: userId,
                jobId: jobId
            }
        });

        const response = await docClient.send(command);
        const item = response.Item;

        if (!item) {
            return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
        }

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

        return NextResponse.json({ audit: item }, { status: 200 });
    } catch (error) {
        console.error('Error fetching specific society audit:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// 🚨 DELETE ROUTE: Removes from DynamoDB AND S3
export async function DELETE(request, { params }) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resolvedParams = await params;
    const { jobId } = resolvedParams;

    if (!userId || !jobId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // 1. Fetch the item first to see if an S3 file is attached
        const getCmd = new GetCommand({
            TableName: 'social-lens-societies',
            Key: { userId, jobId }
        });
        const response = await docClient.send(getCmd);
        const item = response.Item;

        if (!item) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

        // 2. If it's a photo/video, delete it from the S3 vault permanently
        if (item.s3Key && item.postType !== 'text') {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: 'social-lens-intake',
                Key: item.s3Key
            }));
            console.log(`Deleted S3 Object: ${item.s3Key}`);
        }

        // 3. Delete the record from DynamoDB
        await docClient.send(new DeleteCommand({
            TableName: 'social-lens-societies',
            Key: { userId, jobId }
        }));

        return NextResponse.json({ success: true, message: 'Audit and assets permanently deleted' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting audit:', error);
        return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 });
    }
}

// ✏️ PATCH ROUTE: Updates the topic name in DynamoDB
export async function PATCH(request, { params }) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resolvedParams = await params;
    const { jobId } = resolvedParams; 
    
    try {
        const body = await request.json();
        const { newTopic } = body;

        if (!userId || !jobId || !newTopic) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Update the 'topic' column in DynamoDB
        const updateCmd = new UpdateCommand({
            TableName: 'social-lens-societies',
            Key: { userId, jobId },
            UpdateExpression: 'set topic = :t',
            ExpressionAttributeValues: {
                ':t': newTopic
            },
            ReturnValues: "ALL_NEW"
        });

        const result = await docClient.send(updateCmd);

        return NextResponse.json({ success: true, updatedItem: result.Attributes }, { status: 200 });

    } catch (error) {
        console.error('Error updating topic:', error);
        return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
    }
}