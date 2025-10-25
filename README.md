# AI Prompt Library

A lightweight, fast, and intuitive web application for storing, organizing, and quickly accessing your AI prompts. Perfect for users of ChatGPT, Claude, Gemini, and other AI tools.

![AI Prompt Library](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- **Prompt Management**: Create, edit, and delete prompts with ease
- **Smart Organization**: Categorize prompts (Coding, Writing, Design, Marketing, Research, Other)
- **Tagging System**: Add multiple tags to prompts for better organization
- **Real-time Search**: Instantly filter prompts by title, content, or tags
- **One-Click Copy**: Copy prompts to clipboard with visual feedback
- **Usage Tracking**: See how many times you've used each prompt
- **Export/Import**: Backup and share your prompts via JSON files

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **No Backend Required**: All data stored locally in your browser
- **Fast Performance**: Handles 100+ prompts without lag
- **Toast Notifications**: Visual feedback for all actions
- **Clean UI**: Minimal, modern design focused on usability

## Quick Start

### Installation

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Start adding prompts!**

That's it! No build process, no dependencies, no server needed.

### Usage

#### Adding a Prompt
1. Click the "+ Add Prompt" button
2. Fill in the form:
   - **Title**: Give your prompt a descriptive name
   - **Prompt Text**: Enter the full prompt text
   - **Category**: Select from predefined categories
   - **Tags**: Add comma-separated tags (optional)
3. Click "Save Prompt"

#### Using a Prompt
1. Browse or search for the prompt you need
2. Click the "Copy" button
3. Paste into your AI tool of choice
4. The use count will increment automatically

#### Organizing Prompts
- **Search**: Use the search bar to filter by title, text, or tags
- **Filter by Category**: Select a category from the dropdown
- **Sort**: Choose from multiple sorting options:
  - Newest First
  - Oldest First
  - A-Z (Alphabetical)
  - By Category
  - Most Used

#### Editing and Deleting
- **Edit**: Click the edit icon on any prompt card
- **Delete**: Click the delete icon (requires confirmation)

#### Backup and Sharing
- **Export**: Click "Export Prompts" to download a JSON file
- **Import**: Click "Import Prompts" to upload a JSON file

## File Structure

```
ai-prompt-library/
├── index.html      # Main HTML structure
├── style.css       # All styling and responsive design
├── app.js          # Application logic and data management
└── README.md       # Documentation (this file)
```

## Data Structure

Each prompt is stored as a JSON object with the following structure:

```json
{
  "id": "1234567890",
  "title": "Code Review Assistant",
  "text": "Please review this code for...",
  "category": "Coding",
  "tags": ["code-review", "best-practices"],
  "dateAdded": "2025-10-25T12:00:00.000Z",
  "useCount": 5
}
```

## Technical Details

### Technologies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks or libraries
- **LocalStorage API**: For persistent data storage

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Key Features Implementation

#### LocalStorage
All data is stored in your browser's LocalStorage under the key `aiPromptLibrary`. This means:
- ✅ Data persists after closing the browser
- ✅ No server or database needed
- ✅ Works offline
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete prompts (use export for backup!)

#### Search Algorithm
The search function filters prompts in real-time by checking:
- Prompt title
- Prompt text content
- All associated tags

#### Clipboard API
Uses the modern `navigator.clipboard.writeText()` API for reliable copying across all modern browsers.

## Customization

### Adding New Categories
Edit `index.html` and `app.js` to add custom categories:

```html
<!-- In index.html, add to both dropdowns -->
<option value="YourCategory">Your Category</option>
```

### Changing Colors
Modify CSS custom properties in `style.css`:

```css
:root {
    --primary-color: #6366f1;  /* Change to your preferred color */
    --primary-hover: #4f46e5;
    /* ... other colors ... */
}
```

## Deployment

### GitHub Pages
1. Push code to a GitHub repository
2. Go to Settings > Pages
3. Select the main branch
4. Your app will be live at `https://yourusername.github.io/repository-name`

### Netlify
1. Drag and drop the project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your app will be instantly deployed

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

## Future Enhancements

Planned features for future versions:
- ⭐ Favorite/star prompts
- 📁 Folder organization
- 🔗 Share prompts via URL
- 🌙 Dark mode toggle
- ☁️ Cloud sync option
- 📊 Usage analytics
- 🎨 Custom themes
- 🔍 Advanced search filters

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you find this tool useful, please:
- ⭐ Star the repository
- 🐛 Report issues
- 💡 Share your feedback

## Acknowledgments

Built as a practical tool for AI enthusiasts and professionals who want a simple, fast way to manage their prompt libraries.

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Author**: AI Prompt Library Contributors
