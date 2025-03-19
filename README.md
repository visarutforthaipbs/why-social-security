# MySocialSecurity Campaign Website

A website for a campaign to engage the public on social security in Thailand, specifically targeting Gen Z, Gen Y, and younger individuals, including insured persons under sections 33, 39, and 40.

## Project Overview

The website aims to:

- Educate users about social security in Thailand
- Collect feedback on desired benefits
- Encourage participation in a survey and forum
- Present information in a modern, user-friendly way for younger audiences

## Features

- **Home Page**: Overview of the campaign with a bold hero section
- **Section Selection**: Users can identify their social security category (33, 39, 40)
- **User Input Form**: Collects basic demographic information
- **Benefits Suggestion**: Users can propose benefits they want in their category
- **Educational Content**: Information about social security presented in an engaging way
- **Survey Integration**: Collects detailed feedback to be presented at the upcoming forum
- **MongoDB Integration**: Stores user feedback for analytics purposes

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Chakra UI
- React Icons
- MongoDB for data storage
- Mongoose for MongoDB object modeling

## Getting Started

First, install the dependencies:

```bash
npm install
```

### Setting up MongoDB

1. Create a `.env.local` file in the root directory
2. Copy the contents from `.env.local.example` and replace with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster-url/your-database
   MONGODB_DB=social-security-feedback
   ```
3. If you're using MongoDB Atlas:
   - Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Create a database user with read/write permissions
   - Add your IP address to the allowed list
   - Get the connection string and replace the placeholder in `.env.local`

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app`: Pages using Next.js App Router
- `/src/components`: Reusable UI components
- `/public`: Static assets like images and icons
- `/src/lib`: Utility functions including MongoDB connection
- `/src/models`: MongoDB schemas and models
- `/src/services`: Service functions for API calls
- `/src/app/api`: API routes for backend functionality

## Data Analytics

User feedback data is stored in MongoDB with the following structure:

- Section type (33, 39, 40)
- User demographic data
- Benefits used and suggestions
- Timestamp

This data can be analyzed to understand:

- Which benefits are most commonly used across different sections
- What additional benefits users want
- Demographics of respondents
- Patterns in benefit usage by age, occupation, etc.

## Deployment

This website is set to be launched on April 1st, with survey data being presented at a forum on April 9th.

## License

This project is licensed under the MIT License.
