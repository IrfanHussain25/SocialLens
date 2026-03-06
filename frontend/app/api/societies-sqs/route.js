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
        const { jobId, userId, postType, content } = body;

        if (!jobId || !userId || !postType || !content) {
            return NextResponse.json(
                { error: 'Missing required fields: jobId, userId, postType, or content' },
                { status: 400 }
            );
        }

        const sqsParams = {
            QueueUrl: process.env.SOCIETIES_SQS_QUEUE_URL,
            MessageBody: JSON.stringify({
                jobId,
                userId,
                postType,
                content
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
        console.error('Error in societies-sqs API Route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
