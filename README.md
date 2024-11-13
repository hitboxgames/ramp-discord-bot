<img src="./assets/ramp-logo.jpeg" alt="ramp-logo" width="100"/>

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
| **discordId** | **rampId** | **rampRole** | **email** | **verifiedAt** |
|-----|-------|------|-------------|
| 19169470762411123225 | 01932303-145e-7126-abdb-19a8128c13e3 | BUSINESS_USER | raul@hitbox.gg | 2024-11-13T01:02:30.623Z |
| 1953367850253023428 | bf578552-483f-48b2-8658-92907d2bdb9b | BUSINESS_OWNER | gino@hitbox.gg | 2024-11-13T18:35:52.023Z |

### 2. Config Sheet

Contains bot settings:
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| BUSINESS_LIMIT | 100000 | number | Monthly spend limit |
| LARGE_TRANSACTION | 1000 | number | Large transaction threshold |
| NEW_CARD_REQUESTS | TRUE | boolean | Enable card requests |
| MONTHLY_SPEND_REPORT | TRUE | boolean | Enable monthly reports |
| TEXT_CHANNEL_ALERTS | ramp-transactions | string | Alert channel name |

### 3. Channels Sheet

Maintains Discord channel mappings:
| **channel_name** | **channel_id** |
|-----|-------|------|-------------|
| pitch-deck | 1060971429455204463 |
| design-general | 1042881930678501407 |
| 🔧・issues-backlog | 1226600544420757504 |
| platform-v1-final | 1085364305358237726 |
| brand | 1055969609339129856 |
| 📰・marketing | 1141555243151282296 |
| 🛋 Raul's Office 🖥 | 1273810818466709535 |
| 🐶metagotchi | 1043281989689671690 |
| 🚀・product | 1140507864746709014 |

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
  - Warning emoji
  - Additional visibility formatting
  - Immediate review request

## Permissions

The bot requires the following Discord permissions:

- Read Messages
- Send Messages
- Create Message Components
- Manage Channels (for channel scanning)
- View Channel History

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ramp API](https://docs.ramp.com/developer-api/v1/overview/introduction)
- [Discord.js](https://github.com/discordjs/discord.js)
- [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)
