# Ramp Discord Bot

A Discord bot that integrates with Ramp's corporate card platform to help manage expenses, track transactions, and coordinate team spending directly from Discord.

## Features

### Transaction Monitoring

- 🔔 Real-time transaction alerts
- 💰 Large transaction notifications
- 📊 Monthly spending reports
- 🏷️ Transaction categorization

### User Management

- ✅ Verify Discord users with Ramp accounts
- 👥 Invite team members
- 💳 Request new cards
- 👤 User role management

## Prerequisites

- Node.js (v16 or higher)
- Discord Bot Token
- Ramp API Credentials
- Google Service Account (for configuration spreadsheet)
- Discord Server with admin permissions

## Installation

1. Clone the repository:

```bash
git clone https://github.com/hitboxgames/ramp-discord-bot
cd ramp-discord-bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```env
DISCORD_ID=your_discord_bot_id
DISCORD_TOKEN=your_discord_bot_token
RAMP_CLIENT_ID=your_ramp_client_id
RAMP_CLIENT_SECRET=your_ramp_client_secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_ID=your_sheets_id
GUILD_ID=your_discord_server_id
```

## Configuration

The bot uses a Google Spreadsheet for configuration. The spreadsheet should have three sheets:

### 1. Verified Users Sheet

Tracks verified users and their associations:

- discordId
- rampId
- rampRole
- email
- verifiedAt

### 2. Config Sheet

Contains bot settings:
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| POLL_INTERVAL | 300000 | number | Transaction check interval (ms) |
| BUSINESS_LIMIT | 100000 | number | Monthly spend limit |
| LARGE_TRANSACTION | 1000 | number | Large transaction threshold |
| NEW_CARD_REQUESTS | TRUE | boolean | Enable card requests |
| MONTHLY_SPEND_REPORT | TRUE | boolean | Enable monthly reports |
| TEXT_CHANNEL_ALERTS | ramp-transactions | string | Alert channel name |

### 3. Channels Sheet

Maintains Discord channel mappings:

- channel_name
- channel_id

## Usage

### Starting the Bot

```bash
npm run start
```

### Basic Commands

- `/verify` - Link your Discord account with Ramp
- `/request-card` - Submit a new card request
- `/invite` - Invite a team member
- `/report` - Generate spending reports

## Transaction Alerts

The bot monitors transactions and sends alerts to the configured Discord channel:

- Regular transactions show:

  - Card holder
  - Amount
  - Merchant
  - Category
  - Link to transaction

- Large transactions (above threshold) include:
  - @here mention
  - Warning emoji
  - Additional visibility formatting
  - Immediate review request

## Permissions

The bot requires the following Discord permissions:

- Read Messages
- Send Messages
- Create Message Components
- Mention @here
- Manage Channels (for channel scanning)
- View Channel History

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ramp API Documentation
- Discord.js Community
- Google Sheets API Documentation
