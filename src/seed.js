// seed database with Sources

// use current database connection
require('./db/mongoose');

const fs = require('fs').promises;
const path = require('path');
const newsapi = require('./newsapi');
const Source = require('./models/source');

const categories = ['business', 'entertainment', 'health', 'science', 'sports', 'technology'];
const baseParam = { language: 'en', country: 'us' };

async function getImageFiles(category) {
  const imagePath = path.join(__dirname, `assets/images/${category}Logos`);
  const imageFiles = await fs.readdir(imagePath);
  return imageFiles;
}

async function seedDatabaseWithSources(categories, param) {
  try {
    let counter = 0;
    for (let category of categories) {
      let sourceParam = {...param, category };
  
      const sources = await (await newsapi.v2.sources(sourceParam)).sources;

      // Image Files
      const imageFiles = await getImageFiles(category);
      for (const imageFile of imageFiles) {
        const imageFilePath = `${__dirname}/assets/images/${category}Logos/${imageFile}`;

        const source = new Source({
          ...sources[counter], 
          image: await fs.readFile(imageFilePath)
        });

        await source.save();
        // File name
        // console.log(path.basename(imageFile)); 
        // Buffer to base64
        // console.log(source.image.toString('base64'));  string
        counter += 1;
      }
      counter = 0;
    }
  } catch (error) {
    console.error(error);
  }  
}

// seed with business sources
seedDatabaseWithSources(categories, baseParam);
