import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { s3Key } = body;

        if (!s3Key) {
            return NextResponse.json(
                { error: 'Missing required field: s3Key' },
                { status: 400 }
            );
        }

        const command = new GetObjectCommand({
            Bucket: 'social-lens-intake',
            Key: s3Key,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({
            presignedUrl,
            message: 'Presigned GET URL generated successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error in video API Route:', error);
        return NextResponse.json(
            { error: 'Failed to generate pre-signed GET URL' },
            { status: 500 }
        );
    }
}
