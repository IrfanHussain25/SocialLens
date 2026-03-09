# Requirements Document

## Introduction

Social Lens is a cloud-native multimodal content analysis system hosted at **sociallensapp.com** (AWS ap-south-1). It is designed specifically for Indian content creators to provide comprehensive analysis of short-form video content (Reels/Shorts) with a focus on cultural context, linguistic diversity, and modern audience resonance. The system emphasizes a "Bharat-First" approach, understanding Indian cultural nuances and supporting Hinglish code-switching through a hybrid architecture of EC2 hosting and serverless AI processing.

## Glossary

- **Social_Lens_Platform**: The complete system hosted on AWS EC2 and serverless infrastructure.
- **Service_Hosting_Layer**: Amazon EC2 instance running the Next.js application, managed via Amazon Route 53.
- **Content_Ingestion_Service**: Pipeline utilizing specialized APIs (Scrape Creators, Gemini) for video and metadata extraction.
- **Multimodal_Analysis_Engine**: Core system processing visual (Rekognition), audio (Transcribe), and text data through Amazon Bedrock (NovaPro).
- **Multi_Agent_Societal_Simulator**: Advanced component that simulates generational audience reactions (GenZ, Millennials, Boomers).
- **Hinglish_Detector**: Specialized logic for detecting and analyzing Hindi-English code-switching and Romanized text.
- **AWS_AI_Services**: Amazon Rekognition, Amazon Transcribe, and Amazon Bedrock.

## Requirements

### Requirement 1: Content Ingestion and Scalable Processing

**User Story:** As an Indian content creator, I want to submit Reel/Shorts URLs for analysis via sociallensapp.com, so that I can understand my content's impact without manual uploads.

#### Acceptance Criteria

1. THE system SHALL provide a web interface on **sociallensapp.com** (hosted on EC2) for URL submission.
2. WHEN a user provides a YouTube or Instagram URL, THE system SHALL utilize specialized scraping APIs (Gemini for YT metadata, Scrape Creators for IG content) to extract media.
3. THE system SHALL decouple ingestion from analysis using **AWS SQS** queues to ensure fault tolerance.
4. THE system SHALL support high-resolution video content up to 60 seconds from Instagram Reels and YouTube Shorts.

### Requirement 2: Parallel Multimodal Content Analysis

**User Story:** As a content creator, I want comprehensive analysis of my video's visual, audio, and text elements simultaneously, so that I can get deep insights quickly.

#### Acceptance Criteria

1. THE system SHALL trigger parallel analysis of visual frames (AWS Rekognition) and audio tracks (AWS Transcribe).
2. THE Multimodal_Analysis_Engine SHALL extract object detection, scene markers, and facial expressions from visual data.
3. THE system SHALL synthesize visual, audio, and textual findings into a unified "Content DNA" using **Amazon Bedrock (NovaPro)**.
4. THE system SHALL identify specific Indian cultural context markers (festivals, regional symbols) to inform the synthesis.

### Requirement 3: Multi-Agent Societal Simulation

**User Story:** As a content creator targeting diverse Indian audiences, I want to see simulated reactions from different generations before I post.

#### Acceptance Criteria

1. THE system SHALL implement a **Multi-Agent Simulation** where AI "agents" representing GenZ, Millennials, and Boomers interact with the content.
2. THE simulator SHALL generate realistic comments, reaction scores, and sentiment heatmaps based on generational values.
3. THE system SHALL provide a "Verdict & Virality" assessment for each target demographic.
4. THE simulation SHALL be processed asynchronously via a dedicated SQS queue (`social-lens-societies-queue`).

### Requirement 4: Hinglish and Romanized Hindi Recognition

**User Story:** As an Indian content creator using Hinglish, I want the system to understand my mixed-language style and Romanized text.

#### Acceptance Criteria

1. THE system SHALL identify Hindi-English code-switching in audio transcriptions with high accuracy.
2. THE analysis SHALL recognize and interpret Romanized Hindi words (e.g., "Mubarak," "Jaldi") in video overlays.
3. THE system SHALL provide insights on the naturalness and audience accessibility of the Hinglish mix.

### Requirement 5: Performance and User Updates

**User Story:** As a creator on a timeline, I want my analysis results delivered reliably with clear status updates.

#### Acceptance Criteria

1. THE system SHALL deliver a complete "DNA Analysis" and "Societal Audit" within 30-45 seconds.
2. THE system SHALL provide real-time status updates (Queued, Processing, Analyzing) via the web interface.
3. THE Backend SHALL utilize SQS visibility timeouts and retry logic to handle transient AI service slowdowns.

### Requirement 6: Reliability and Security

**User Story:** As a user, I want my content handled securely and the service to be consistently available at my domain.

#### Acceptance Criteria

1. THE system SHALL maintain high availability via **Amazon Route 53** routing to a production-ready EC2 instance.
2. THE system SHALL utilize **Amazon Cognito** for secure user authentication and session management.
3. THE system SHALL store all analytical results in **Amazon DynamoDB** with partitioned data for rapid retrieval.
4. THE system SHALL ensure the security of raw content stored in temporary S3 buckets.