import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

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
        const { fileName, fileType, userId } = body;

        if (!fileName || !fileType || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: fileName, fileType, or userId' },
                { status: 400 }
            );
        }

        // Generate a UUID for jobId
        const jobId = crypto.randomUUID();

        // Strip special characters from fileName
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');

        // Build S3 key to the specific isolated folder structure
        const s3Key = `${userId}/societies/${jobId}-${safeFileName}`;

        const command = new PutObjectCommand({
            Bucket: 'social-lens-intake',
            Key: s3Key,
            ContentType: fileType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return NextResponse.json({
            jobId,
            presignedUrl,
            s3Key,
            message: 'Presigned URL generated successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error in societies-upload API Route:', error);
        return NextResponse.json(
            { error: 'Failed to generate pre-signed URL' },
            { status: 500 }
        );
    }
}
