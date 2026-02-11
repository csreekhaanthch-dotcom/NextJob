# Job Board Aggregator

A zero-cost job board aggregator that scrapes public job listings from various sources and presents them in a clean, searchable interface.

## Features

- Aggregates jobs from popular job boards (Lever, Greenhouse, Ashby, YC Jobs)
- Clean, responsive UI with search and filtering capabilities
- Real-time job updates via scheduled scraping
- Mobile-friendly design
- TypeScript support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-board-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. To run the job scraper:
```bash
npm run scrape
```

### Development

- `npm run dev` - Starts the development server
- `npm run build` - Builds the production version
- `npm run preview` - Previews the built app
- `npm run scrape` - Runs the job scraping script

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── scripts/        # Scraping scripts
├── types/          # TypeScript types
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

### Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- Cheerio (for scraping)
- SQLite (for job storage)
- Node-cron (for scheduling)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.