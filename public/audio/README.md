# Audio Files

This folder contains all audio files for the Burger Builder game:

## Required Audio Files:
- `background.mp3` - Background music loop [TBD]
- `ingredient-spawn.mp3` - Sound when a new ingredient appears
- `drop.mp3` - Sound when player drops an ingredient
- `impact.mp3` - Sound when ingredient lands on the stack
- `life-loss.mp3` - Sound when a life is lost
- `game-over.mp3` - Sound when the game ends

## Audio Format Recommendations:
- Use MP3 format for broad browser compatibility
- Keep file sizes small for fast loading
- Normalize volume levels across all files
- Background music should be around 30-50% volume
- Sound effects should be short and punchy (< 2 seconds)

## Notes:
- Audio files are loaded when the game starts
- All audio can be muted/unmuted using the mute button
- Background music loops automatically when playing
- Sound effects play once per trigger event