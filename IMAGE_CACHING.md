# Image Caching & Processing System

## Overview

This system implements a global image caching solution using Vercel Blob Storage with a queue system for large images. It follows the CDN → object storage → metadata cache pattern for optimal performance.

## Architecture

### Caching Strategy

- **Public-facing images** (quality > 70) are cached in Vercel Blob Storage
- **Profile images** (quality 85) are cached
- **Banner images** (quality 90) are cached
- **Regular thumbnails** (quality ≤ 70, except profile/banner) are NOT cached

### Processing Flow

1. **Synchronous Processing** (images ≤ 15MB):
   - Images are processed immediately
   - Results are uploaded to Vercel Blob Storage
   - CDN serves cached images globally

2. **Asynchronous Processing** (images > 15MB or > 40MP):
   - Large images are queued for background processing
   - Worker endpoint processes queued images
   - Results are uploaded to Vercel Blob Storage
   - Clients receive 202 status and retry after 2 seconds

## Components

### 1. Image Resize Handler (`/api/image`)

Main endpoint for image resizing and caching.

**Features:**
- Preflight checks for large images (HEAD request)
- Pixel count validation (max 40MP)
- Automatic queuing for large images
- Distributed locking to prevent duplicate processing
- Negative caching for failed requests

**Query Parameters:**
- `src`: Source image URL
- `w`: Width (optional)
- `q`: Quality (0-100)
- `f`: Format (avif, webp, jpeg, gif) - optional, defaults from Accept header

### 2. Image Queue Worker (`/api/image/worker`)

Background worker that processes queued images via QStash webhooks.

**Features:**
- Processes images in parallel (up to 5 concurrent)
- Handles large images with extended timeout (60s)
- Automatic retry logic via QStash (3 retries with exponential backoff)
- Error handling and negative caching
- QStash signature verification for security

**Setup:**
- Automatically called by QStash when messages are published
- No cron job needed - QStash handles scheduling
- Supports parallel processing for better throughput

### 3. Cache Key Generation

Deterministic cache keys based on:
- Source URL
- Width
- Format
- Quality

Format: `thumb/{hashPrefix}/{hash}/{widthSuffix}.{format}`

## Configuration

### Environment Variables

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage token (required)
- `QSTASH_TOKEN`: Upstash QStash token (required for queue system)
- `KV_REST_API_URL`: Vercel KV URL (for locks and metadata)
- `KV_REST_API_TOKEN`: Vercel KV token
- `NEXTAUTH_URL` or `VERCEL_URL`: Base URL for worker endpoint (required for QStash)

### Thresholds

- `MAX_SYNC_BYTES`: 15 MB (synchronous processing limit)
- `MAX_PIXELS`: 40 MP (pixel count limit)
- `TIMEOUT_MS`: 10s (synchronous processing timeout)
- `ASYNC_TIMEOUT_MS`: 60s (async worker timeout)

## Usage

### Client-Side

Images are automatically cached when using the image loader with quality > 70:

```typescript
import resizeLoader from "@/utils/imageLoader";

const imageUrl = resizeLoader({
  src: "https://example.com/image.jpg",
  width: 800,
  quality: 80, // Will be cached
});
```

### Manual Worker Trigger

To manually trigger the worker (useful for testing):

```bash
curl https://your-domain.com/api/image/worker
```

## Monitoring

### Queue Status

Check queue status:
- QStash Dashboard: Monitor queue status, retries, and processing times
- Vercel KV: Keys prefixed with `img:ready:` indicate processed items
- Vercel KV: Keys prefixed with `img:neg:` indicate failed items (negative cache)

### Performance

- **CDN Hit Rate**: Most requests should hit the CDN (Vercel Blob)
- **Origin Requests**: Only for cache misses
- **Queue Processing**: Background worker handles large images

## Cost Considerations

### Vercel Serverless Functions

- Synchronous processing: ~10s max per request
- Async worker: Runs every 2 minutes, processes up to 10 images
- Consider costs if processing many large images

### Optimization Options

If serverless function costs become high:

1. **Separate Image Processing Server**: 
   - Dedicated server for image processing
   - Better for high-volume, large image processing
   - Can use more powerful hardware

2. **Adjust Concurrency**:
   - Modify `MAX_CONCURRENT_PROCESSING` in worker
   - Balance between throughput and resource usage
   - Default: 5 concurrent images

3. **Cloudflare Workers**:
   - Lower cost for high-volume processing
   - Better edge computing capabilities

## Queue System: QStash

The system uses **Upstash QStash** for reliable message queuing:

### Benefits

- **Automatic Retries**: 3 retries with exponential backoff
- **Parallel Processing**: Multiple images processed concurrently (configurable)
- **No Polling**: QStash pushes messages to worker endpoint (no cron needed)
- **Reliability**: Built-in error handling and message persistence
- **Scalability**: Handles high-volume queues efficiently

### How It Works

1. Large images are published to QStash with worker endpoint URL
2. QStash automatically calls `/api/image/worker` (POST) with image data
3. Worker processes image and uploads to blob storage
4. If processing fails, QStash retries automatically
5. Ready flag is set in KV when processing completes

### Parallel Processing

- **Concurrency Limit**: 5 images processed simultaneously (configurable)
- **No Bottleneck**: Each QStash message triggers independent processing
- **Resource Management**: Concurrency limit prevents overwhelming serverless functions

## Cache Management & Cleanup

### Access Tracking

The system automatically tracks when cached images are last accessed:
- Every time an image is served from blob storage, the access time is recorded
- Access times are stored in Vercel KV with prefix `img:access:`
- No expiration on access records - they persist until manually cleaned up

### Cleanup Endpoint

Use `/api/image/cleanup` to delete stale cached images:

**Query Parameters:**
- `maxAge`: Maximum age in days (default: 90)
- `dryRun`: If `true`, only report what would be deleted (default: `false`)
- `limit`: Maximum number of images to delete per call (default: 100)

**Examples:**

```bash
# Dry run - see what would be deleted (images older than 90 days)
curl "https://your-domain.com/api/image/cleanup?dryRun=true&maxAge=90"

# Delete images older than 90 days (up to 100 at a time)
curl "https://your-domain.com/api/image/cleanup?maxAge=90&limit=100"

# Delete images older than 30 days
curl "https://your-domain.com/api/image/cleanup?maxAge=30"
```

**Response:**
```json
{
  "totalStale": 150,
  "processing": 100,
  "deleted": 100,
  "errors": 0,
  "dryRun": false
}
```

**Setting up automated cleanup:**

Add a Vercel Cron job to run cleanup periodically:

```json
{
  "crons": [
    {
      "path": "/api/image/cleanup?maxAge=90&limit=100",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

This runs every Sunday at 2 AM, deleting images older than 90 days (100 at a time).

### Access Tracking Functions

Available in `src/server/utils/kvCache.ts`:

- `trackAccess(key)`: Record access time for a cache key
- `getLastAccess(key)`: Get last access time for a cache key
- `getStaleImages(maxAge)`: Get all stale images (optionally filtered by age)
- `removeAccessTracking(key)`: Remove access tracking when deleting an image

## Future Improvements

- [ ] Implement streaming for very large images (avoid full buffer in memory)
- [ ] Add image format detection and optimization
- [ ] Implement progressive image loading
- [ ] Add metrics and monitoring dashboard
- [ ] Dynamic concurrency based on function load
- [ ] Automatic cleanup based on storage quotas
