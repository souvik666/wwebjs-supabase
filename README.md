# wwebjs-supabase

[![npm version](https://badge.fury.io/js/wwebjs-supabase.svg)](https://badge.fury.io/js/wwebjs-supabase)
[![npm downloads](https://img.shields.io/npm/dm/wwebjs-supabase.svg)](https://www.npmjs.com/package/wwebjs-supabase)
[![GitHub license](https://img.shields.io/github/license/souvik666/wwebjs-supabase.svg)](https://github.com/souvik666/wwebjs-supabase/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/souvik666/wwebjs-supabase.svg)](https://github.com/souvik666/wwebjs-supabase/issues)

A Supabase plugin for whatsapp-web.js!

Use SupabaseStore to save your WhatsApp MultiDevice session on a Supabase Database.

## Quick Links

- [Guide / Getting Started](#getting-started)
- [GitHub](https://github.com/souvik666/wwebjs-supabase)
- [npm](https://www.npmjs.com/package/wwebjs-supabase)
- [GitHub Packages](https://github.com/souvik666/wwebjs-supabase/packages)

## Installation

The module is available on npm:

```bash
npm i wwebjs-supabase
```

## Getting Started

This plugin allows you to store your WhatsApp Web.js session data in Supabase, providing a reliable and scalable database solution for your WhatsApp bot sessions.

### Prerequisites

- Node.js (v14 or higher)
- A Supabase project with database access
- whatsapp-web.js installed

## Example Usage

```javascript
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { SupabaseStore } = require('wwebjs-supabase');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Create store instance
const store = new SupabaseStore({ 
    supabase: supabase,
    tableName: 'whatsapp_sessions' // optional, defaults to 'sessions'
});

// Initialize WhatsApp client with Supabase store
const client = new Client({
    authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000
    })
});

client.initialize();
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Create a table in your Supabase database:

```sql
CREATE TABLE whatsapp_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX idx_whatsapp_sessions_session_id ON whatsapp_sessions(session_id);
```

## API Reference

### SupabaseStore

#### Constructor Options

- `supabase` (required): Supabase client instance
- `tableName` (optional): Name of the table to store sessions (default: 'sessions')

#### Methods

##### `delete(options)`

Force delete a specific remote session from the database:

```javascript
await store.delete({ session: 'yourSessionName' });
```

##### `save(sessionId, data)`

Save session data to Supabase:

```javascript
await store.save('sessionId', sessionData);
```

##### `extract(sessionId)`

Extract session data from Supabase:

```javascript
const sessionData = await store.extract('sessionId');
```

## Error Handling

```javascript
const client = new Client({
    authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000
    })
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/souvik666/wwebjs-supabase/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the issue

## Changelog

### Version 1.0.0
- Initial release
- Basic Supabase integration for whatsapp-web.js
- Session management functionality
- CRUD operations for session data

## Related Projects

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API for Node.js
- [Supabase](https://supabase.com/) - Open source Firebase alternative

## Acknowledgments

- Inspired by [wwebjs-mongo](https://github.com/jtouris/wwebjs-mongo)
- Built for the whatsapp-web.js community
- Thanks to the Supabase team for their excellent database platform
