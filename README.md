# U-Bahn Departures App

A static single-page application for displaying U-Bahn departure information and news.

## Configuration

The app uses environment variables for API configuration. These are already set up in your Vercel project:

- `NEXT_PUBLIC_DEPARTURES_API` - Your departures API endpoint
- `NEXT_PUBLIC_NEWS_API` - Your news API endpoint  
- `NEXT_PUBLIC_API_KEY` - Your API key (if required)

### Local Development

Create a `.env.local` file in the project root:

\`\`\`bash
NEXT_PUBLIC_DEPARTURES_API=https://your-actual-api-endpoint.com/departures
NEXT_PUBLIC_NEWS_API=https://your-actual-news-api-endpoint.com/news
NEXT_PUBLIC_API_KEY=your-api-key-if-needed
\`\`\`

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

In development mode, you'll see a debug panel showing which API endpoints are being used.

## Build for Production

\`\`\`bash
npm run build
\`\`\`

The static files will be generated in the `dist` folder.

## API Requirements

Your APIs should return data in the following formats:

### Departures API Response
\`\`\`json
[
  {
    "plannedDepartureTime": 1748624640000,
    "realtime": true,
    "delayInMinutes": 0,
    "realtimeDepartureTime": 1748624640000,
    "transportType": "UBAHN",
    "label": "U6",
    "destination": "Fürstenried West",
    "cancelled": false,
    "platform": 1,
    "platformChanged": false,
    "occupancy": "LOW"
  }
]
\`\`\`

### News API Response
\`\`\`json
[
  {
    "title": "Service Update",
    "description": "Description of the news item",
    "publication": 1748624700000,
    "type": "INCIDENT",
    "provider": "MVG",
    "lines": [
      {
        "label": "U6",
        "transportType": "UBAHN"
      }
    ],
    "validFrom": 1748624700000,
    "validTo": 1748637000000
  }
]
\`\`\`

## Deployment

The app is configured for automatic deployment on Vercel with the environment variables already set up.

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Ensure your API server allows requests from your domain
2. Check that the API endpoints are correct
3. Verify the API key is valid (if required)

### No Data Showing
1. Check the browser console for error messages
2. Verify the API endpoints are returning data in the expected format
3. Ensure the APIs are accessible from the browser

## Features

- ✅ Fully static - no server required
- ✅ Mobile-optimized responsive design
- ✅ Auto-refresh every minute
- ✅ Real-time countdown to departures
- ✅ U6 line news filtering
- ✅ Expandable departure list
- ✅ Offline-capable (after first load)
