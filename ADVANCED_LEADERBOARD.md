# Advanced Leaderboard Features

## Overview

The Boss Burger Builder bot now includes advanced leaderboard capabilities using Telegram's lower-level API methods. This provides detailed score analytics and enhanced leaderboard functionality beyond the standard Telegram Games integration.

## Features

### Standard Leaderboard (`/highscores`)
- Uses Telegram's built-in game message leaderboard display
- Automatically shows top scores when players submit scores via `setGameScore`
- Updates game messages in real-time
- Works seamlessly with Telegram's native UI

### Advanced Leaderboard (`/advanced_scores`)
- Uses the `messages.getGameHighScores` API method for detailed data retrieval
- Provides comprehensive player statistics
- Shows detailed user information (names, usernames, user IDs)
- Includes score analytics (min, max, average scores)
- Displays player rankings with emoji indicators
- Offers refresh functionality for real-time updates

## API Methods Used

### `setGameScore` (Standard)
```javascript
await ctx.api.setGameScore({
  user_id: userId,
  score: score,
  chat_id: chatId,
  message_id: messageId,
  force: true,
  disable_edit_message: false
});
```

### `getGameHighScores` (Advanced)
```javascript
const highScoresResult = await ctx.api.raw.getGameHighScores({
  user_id: ctx.from.id,
  chat_id: ctx.chat.id,
  message_id: messageId
});
```

## Commands Available

| Command | Description | Use Case |
|---------|-------------|----------|
| `/start` | Launch the game | Primary game entry point |
| `/highscores` | Standard leaderboard | Quick leaderboard view |
| `/advanced_scores` | Detailed analytics | Comprehensive score analysis |
| `/scores` | Score status info | General score information |
| `/submitscore [score]` | Manual score submission | Testing and debugging |
| `/help` | Show all commands | User guidance |

## Data Structure

The `getGameHighScores` API returns data in this format:

```javascript
{
  "ok": true,
  "result": [
    {
      "position": 1,
      "user": {
        "id": 123456789,
        "is_bot": false,
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe"
      },
      "score": 150
    }
    // ... more entries
  ]
}
```

## Features Breakdown

### Score Analytics
- **Total Players**: Count of all players who have submitted scores
- **Highest Score**: Maximum score achieved
- **Lowest Score**: Minimum score recorded
- **Average Score**: Calculated mean of all scores
- **Player Rankings**: Position-based ranking with emoji indicators

### User Information Display
- **Full Name**: First name + last name if available
- **Username**: @username if available
- **User ID**: Telegram user ID for technical reference
- **Position**: Ranking position with appropriate emoji

### Real-time Updates
- **Refresh Button**: Updates scores without creating new messages
- **Live Data**: Queries Telegram's API for current data
- **Error Handling**: Graceful handling of API limitations

## Error Handling

The advanced leaderboard system handles various error scenarios:

- **No Scores Available**: When no players have submitted scores
- **API Errors**: When Telegram API calls fail
- **Permission Issues**: When bot lacks necessary permissions
- **Invalid Messages**: When message data is corrupted or unavailable

## Performance Considerations

- **API Rate Limits**: Respects Telegram's API rate limiting
- **Caching**: Efficient data retrieval to minimize API calls
- **Graceful Degradation**: Falls back to standard methods when advanced features fail

## Integration with Game

The advanced leaderboard integrates seamlessly with the existing game:

1. **Score Submission**: Players submit scores through game UI
2. **Standard Processing**: Scores are processed via `setGameScore`
3. **Advanced Retrieval**: Detailed data retrieved via `getGameHighScores`
4. **User Experience**: Both standard and advanced views available

## Use Cases

### For Players
- **Quick Check**: Use `/highscores` for standard leaderboard
- **Detailed Analysis**: Use `/advanced_scores` for comprehensive data
- **Competition**: Compare detailed statistics with other players

### For Administrators
- **Analytics**: Detailed player behavior analysis
- **Debugging**: Technical score data for troubleshooting
- **Community Management**: Comprehensive player statistics

### For Developers
- **Testing**: Manual score submission for development
- **Debugging**: Detailed API response logging
- **Enhancement**: Foundation for additional analytics features

## Future Enhancements

Potential future features using the advanced API:

- **Historical Data**: Track score changes over time
- **Tournament Mode**: Organize competitions with detailed brackets
- **Achievement System**: Award badges based on score milestones
- **Export Functionality**: Download score data for external analysis
- **Cross-Chat Leaderboards**: Compare scores across multiple groups

## Technical Notes

- The advanced leaderboard requires a valid game message to query scores
- Score data is tied to specific message IDs in Telegram's system
- The API provides position-based rankings automatically
- User privacy is respected according to Telegram's guidelines

## Troubleshooting

Common issues and solutions:

1. **"No scores found"**: Ensure players have submitted scores via the game
2. **"Permission denied"**: Check bot permissions in the chat
3. **"API Error"**: Verify bot token and message validity
4. **"Invalid message data"**: Create a new game message and try again

This advanced leaderboard system provides a comprehensive solution for score tracking and player analytics while maintaining compatibility with Telegram's standard game features.
