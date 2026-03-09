import { NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({
    region: process.env.NEXT_PUBLIC_SL_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.SL_ACCESS_KEY_ID,
        secretAccessKey: process.env.SL_SECRET_ACCESS_KEY,
    }
});

export async function POST(request) {
    try {
        const body = await request.json();
        const { youtubeUrl, userId, jobId, feature } = body;

        if (!youtubeUrl || !userId || !jobId || feature !== 'youtube-analysis') {
            return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
        }

        const sqsSimulatedEvent = {
            Records: [
                {
                    body: JSON.stringify({
                        youtubeUrl,
                        userId,
                        feature,
                        jobId
                    })
                }
            ]
        };

        const command = new InvokeCommand({
            FunctionName: 'youtube-video-analyzer',
            InvocationType: 'Event',
            Payload: JSON.stringify(sqsSimulatedEvent)
        });

        await lambdaClient.send(command);
        return NextResponse.json({
            success: true,
            jobId,
            message: "Lambda directly invoked asynchronously."
        }, { status: 200 });

    } catch (error) {
        console.error('Error invoking Lambda:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
