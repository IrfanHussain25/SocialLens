import { NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({
    region: process.env.NEXT_PUBLIC_SL_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.SL_ACCESS_KEY_ID,
        secretAccessKey: process.env.SL_SECRET_ACCESS_KEY,
    }
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { url, userId, feature, jobId } = body;

        if (!url || !userId || !feature || !jobId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Trigger your scraper lambda
        const command = new InvokeCommand({
            FunctionName: 'instagram-video-downloader', // <-- Update this to the actual name of your Scraper Lambda
            Payload: JSON.stringify({ url, userId, feature, jobId })
        });

        const response = await lambda.send(command);
        const result = JSON.parse(new TextDecoder("utf-8").decode(response.Payload));
        const responseBody = JSON.parse(result.body);

        if (result.statusCode !== 200) {
            throw new Error(responseBody.error || 'Failed to import video');
        }

        return NextResponse.json({
            success: true,
            s3Key: responseBody.s3Key
        }, { status: 200 });

    } catch (error) {
        console.error('Error importing from Instagram:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}