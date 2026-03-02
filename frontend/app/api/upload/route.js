// import { NextResponse } from 'next/server';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import crypto from 'crypto';

// // Initialize S3 Client
// const s3Client = new S3Client({
//     region: 'ap-south-1',
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//     },
// });

// export async function POST(request) {
//     try {
//         const body = await request.json();
//         const { fileName, fileType } = body;

//         if (!fileName || !fileType) {
//             return NextResponse.json(
//                 { error: 'Missing fileName or fileType' },
//                 { status: 400 }
//             );
//         }

//         // Generate a unique Job ID
//         const jobId = crypto.randomUUID();
//         // The S3 key follows the expected format: raw-videos/{jobId}.mp4
//         const s3Key = `raw-videos/${jobId}.mp4`;

//         // Create the PUT command
//         const command = new PutObjectCommand({
//             Bucket: 'social-lens-intake',
//             Key: s3Key,
//             ContentType: fileType,
//         });

//         // Generate Pre-signed URL valid for 5 minutes (300 seconds)
//         const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

//         return NextResponse.json({
//             jobId,
//             presignedUrl,
//             s3Key,
//             message: 'Presigned URL generated successfully'
//         }, { status: 200 });

//     } catch (error) {
//         console.error('Error in upload API Route:', error);
//         return NextResponse.json(
//             { error: 'Failed to generate pre-signed URL' },
//             { status: 500 }
//         );
//     }
// }








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
        // 1. Extract the new userId and feature variables from the frontend request
        const { fileName, fileType, userId, feature } = body;

        if (!fileName || !fileType || !userId || !feature) {
            return NextResponse.json(
                { error: 'Missing required fields: fileName, fileType, userId, or feature' },
                { status: 400 }
            );
        }

        // 🚨 THE FIX: Strip spaces and weird characters from the filename
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');

        const jobId = crypto.randomUUID();
        
        // 2. Build the exact S3 key using the SAFE filename!
        const s3Key = `${userId}/${feature}/${jobId}-${safeFileName}`;

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
            userId,  // Return this so the frontend can pass it to the SQS trigger
            feature, // Return this so the frontend can pass it to the SQS trigger
            message: 'Presigned URL generated successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error in upload API Route:', error);
        return NextResponse.json(
            { error: 'Failed to generate pre-signed URL' },
            { status: 500 }
        );
    }
}