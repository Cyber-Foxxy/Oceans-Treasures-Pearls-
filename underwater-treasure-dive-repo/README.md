# Underwater Treasure Dive

A browser-based canvas game where a diver explores coral mazes, collects treasure, avoids sharks, and fires harpoons.

## Features

- Arrow-key diver movement
- Coral walls loaded from external JSON
- Collectibles loaded from external JSON
- Sharks that patrol and can be defeated with harpoons
- 3 lives
- Score, lives, and items HUD
- Random collectible respawn after all are collected
- Start screen and restart button
- Background images for gameplay, start, and game-over states

## Controls

- Arrow keys: move the diver
- Spacebar: shoot harpoon

## Files

- `index.html`
- `style.css`
- `script.js`
- `obstacles.json`
- `collectibles.json`
- `AdobeStock_587296092-scaled.jpeg`
- `Blog_Cover_Image_1.webp`
- `underwater-ocean-scene-sunlight-rays-illuminate-school-fish-swimming-deep-blue-sea_891417-3978.jpg`

## Run locally

Because the project loads JSON files with `fetch()`, do not open `index.html` by double-clicking it.

Use one of these options instead:

### VS Code Live Server
1. Open the project folder in VS Code.
2. Install the Live Server extension.
3. Right-click `index.html`.
4. Choose **Open with Live Server**.

### Python server
```bash
python -m http.server
```
Then open:
```text
http://localhost:8000
```

## Upload to GitHub

1. Create a new empty repository on GitHub.
2. Upload all files from this folder.
3. Commit the files.
4. Enable GitHub Pages if you want to host it online.

### Git commands
```bash
git init
git add .
git commit -m "Add underwater treasure dive game"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Notes

- Pearl is the highest-value collectible.
- When the diver is hit by a shark, a life is lost and the diver returns to the start.
- If the player had collected more than 3 items before dying, the item count resets to 3. Otherwise it resets to 0.
