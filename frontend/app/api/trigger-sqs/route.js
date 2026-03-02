// import { NextResponse } from 'next/server';
// import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// // Initialize SQS Client
// const sqsClient = new SQSClient({
//     region: "ap-south-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
//     },
// });

// export async function POST(request) {
//     try {
//         const body = await request.json();
//         const { jobId, s3Key } = body;

//         if (!jobId || !s3Key) {
//             return NextResponse.json(
//                 { error: 'Missing jobId or s3Key' },
//                 { status: 400 }
//             );
//         }

//         // Send message to SQS Queue indicating the file is ready in S3
//         const sqsParams = {
//             QueueUrl: process.env.SQS_QUEUE_URL,
//             MessageBody: JSON.stringify({
//                 jobId,
//                 s3Key,
//             }),
//         };

//         const command = new SendMessageCommand(sqsParams);
//         await sqsClient.send(command);

//         return NextResponse.json({
//             success: true,
//             jobId,
//             message: 'Job successfully queued for processing',
//         }, { status: 200 });

//     } catch (error) {
//         console.error('Error in trigger-sqs API Route:', error);
//         return NextResponse.json(
//             { error: 'Internal Server Error' },
//             { status: 500 }
//         );
//     }
// }








import { NextResponse } from 'next/server';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function POST(request) {
    try {
        const body = await request.json();
        // 1. Extract userId and feature alongside the original data
        const { jobId, s3Key, userId, feature } = body;

        if (!jobId || !s3Key || !userId || !feature) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const sqsParams = {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({
                jobId,
                s3Key,
                userId,  // Send userId to Lambda
                feature  // Send feature to Lambda
            }),
        };

        const command = new SendMessageCommand(sqsParams);
        await sqsClient.send(command);

        return NextResponse.json({
            success: true,
            jobId,
            message: 'Job successfully queued for processing',
        }, { status: 200 });

    } catch (error) {
        console.error('Error in trigger-sqs API Route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}