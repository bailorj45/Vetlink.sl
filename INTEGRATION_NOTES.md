# Realtime Integration Notes

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New OpenAI variables
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

## Database Setup

1. **Run the SQL schema**:
   - Open Supabase Dashboard → SQL Editor
   - Copy and paste contents of `DATABASE_SCHEMA.sql`
   - Execute the script

2. **Enable Realtime**:
   - The SQL script automatically enables Realtime for:
     - `cases`
     - `messages`
     - `appointments`
     - `notifications`

3. **Storage Setup**:
   - The script creates a `case-images` storage bucket
   - Make sure storage is enabled in your Supabase project

## OpenAI Realtime API Setup

1. **Get API Key**:
   - Sign up at https://platform.openai.com
   - Create an API key with Realtime API access
   - Add to `.env.local` as `NEXT_PUBLIC_OPENAI_API_KEY`

2. **Model Access**:
   - Ensure you have access to `gpt-4o-realtime-preview-2024-10-01`
   - Or update the model name in `lib/utils/voice.ts`

## Testing in Cursor

### 1. Test Voice Recording

```bash
# Navigate to report case page
http://localhost:3000/farmer/report-case

# Click and hold the microphone button
# Speak symptoms
# Release to stop
# Verify transcription appears
# Verify AI response is received
```

### 2. Test Realtime Messaging

```bash
# Open two browser windows:
# Window 1: Farmer account
http://localhost:3000/farmer/messages

# Window 2: Vet account (or use different browser)
http://localhost:3000/vet/messages

# Send message from farmer
# Verify it appears instantly in vet window
```

### 3. Test Dashboard Updates

```bash
# Open dashboard
http://localhost:3000/farmer/dashboard

# In another window, create a new case
# Verify it appears in dashboard without refresh
```

### 4. Test Notifications

```bash
# Open dashboard with notification bell
# Trigger an event (new message, case update)
# Verify notification appears in bell
```

## Known Issues & Solutions

### Issue: WebSocket connection fails
**Solution**: 
- Check OpenAI API key is correct
- Verify model name is accessible
- Check browser console for errors
- Ensure microphone permissions are granted

### Issue: Realtime not working
**Solution**:
- Verify Realtime is enabled in Supabase Dashboard
- Check RLS policies allow access
- Verify user is authenticated
- Check browser console for subscription errors

### Issue: Audio not playing
**Solution**:
- Check browser audio permissions
- Verify AudioContext is supported
- Check console for audio decoding errors
- Try different browser (Chrome recommended)

### Issue: Images not uploading
**Solution**:
- Verify storage bucket exists
- Check storage policies allow uploads
- Verify file size is within limits
- Check Supabase storage settings

## File Structure

```
lib/utils/
  voice.ts          # Voice streaming utilities
  ai.ts             # AI diagnosis functions
  db.ts             # Supabase realtime database utilities

hooks/
  useVoice.ts       # React hook for voice recording
  useNotifications.ts # React hook for notifications

components/
  VoiceRecorder.tsx # Voice recording UI component
  NotificationBell.tsx # Notification bell component

app/farmer/
  report-case/      # Case reporting with voice
  messages/         # Realtime messaging
  dashboard/        # Updated with realtime

app/vet/
  dashboard/        # Updated with realtime
```

## API Usage Examples

### Voice Recording

```typescript
import { useVoice } from '@/hooks/useVoice';

const { startRecording, stopRecording, transcription, aiResponse } = useVoice({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});
```

### AI Diagnosis

```typescript
import { diagnoseSymptom } from '@/lib/utils/ai';

const result = await diagnoseSymptom({
  text: 'Cattle showing signs of lameness',
  imageBase64: 'data:image/jpeg;base64,...',
  species: 'cattle',
}, apiKey);
```

### Realtime Database

```typescript
import { createCase, listenToCaseUpdates } from '@/lib/utils/db';

const case = await createCase({ ... });
const channel = listenToCaseUpdates(case.id, (updatedCase) => {
  console.log('Case updated:', updatedCase);
});
```

## Performance Considerations

1. **Voice Streaming**:
   - Audio chunks sent every 250ms
   - WebSocket connection maintained during session
   - Cleanup on component unmount

2. **Realtime Subscriptions**:
   - Limit number of active subscriptions
   - Unsubscribe when component unmounts
   - Use filters to reduce data transfer

3. **Image Uploads**:
   - Compress images before upload
   - Use appropriate image formats (JPEG for photos)
   - Consider CDN for image delivery

## Security Notes

1. **API Keys**:
   - Never commit API keys to git
   - Use environment variables
   - Rotate keys regularly

2. **RLS Policies**:
   - All tables have Row Level Security enabled
   - Users can only access their own data
   - Vets can access assigned cases only

3. **File Uploads**:
   - Validate file types
   - Limit file sizes
   - Scan for malicious content (in production)

## Next Steps

1. Add error boundaries for better error handling
2. Implement retry logic for failed API calls
3. Add loading states for better UX
4. Implement offline support with service workers
5. Add analytics for usage tracking
6. Implement rate limiting for API calls

