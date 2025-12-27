# Content Files

This folder contains static content for the TenantX frontend project. All text and labels are stored in JSON files for easy editing.

## Files

- `landing.json`: Landing page content (title, description, features)
- `auth.json`: Login and registration page content
- `dashboard.json`: Dashboard page labels and messages

## Usage

Content is imported in `lib/content.ts` and used throughout the app. Components import from the `content` object.

## Editing

Just edit the JSON files directly. No fancy CMS needed for this learning project!
3. Set up webhooks to redeploy on content changes

Example TinaCMS config (tinacms.config.js):

```js
import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'landing',
        label: 'Landing Page',
        path: 'content',
        format: 'json',
        fields: [
          { name: 'title', label: 'Title', type: 'string' },
          { name: 'description', label: 'Description', type: 'string' },
          // etc.
        ],
      },
      // Add collections for auth and dashboard
    ],
  },
})
```

This allows non-developers to edit content through a user-friendly interface, with changes committed to git.