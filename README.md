# shinoAI

shinoAI is a versatile and intelligent chatbot built using the `fca-unofficial` library. It offers various features and commands to enhance your chat experience on Facebook Messenger. This bot dynamically loads commands from the `commands` directory and supports event handling and reply tracking.

## Features

- Dynamic command loading
- Customizable prefix
- Reply tracking and handling
- Easy-to-read logging
- Event-based architecture

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/milancodess/shinAI.git
    cd shinAI
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create an `appstate.json` file:
    - Login to your Facebook account using `fca-unofficial` and save the session cookies to `appstate.json` in the root directory of the project.

4. Run the bot:
    ```sh
    node index.js
    ```

## Usage

- The bot uses the `.` prefix by default for commands.
- You can list available commands using `.help`.

## Commands

The commands are loaded dynamically from the `commands` directory. Each command is a separate module with its configuration and logic. Here's an example of a command structure:

```javascript
module.exports = {
  config: {
    name: 'help',
    aliases: [],
    version: '1.0',
    author: 'YourName',
    countDown: 0,
    role: 0,
    category: 'system',
    description: {
      en: 'Shows the list of available commands and their descriptions.',
    },
    guide: {
      en: '{pn} [command_name]',
    },
  },
  onStart: async function ({ api, event, args }) {
    // Command logic here
  }
};
````

## For media
<details>
  <summary>Example Command: `sendImage`</summary>

  ```javascript
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');

  const cacheDir = path.join(__dirname, 'cache');
  fs.ensureDirSync(cacheDir);

  module.exports = {
    config: {
      name: 'sendImage',
      version: '1.0',
      aliases: ['image'],
      author: 'YourName',
      countDown: 10,
      role: 0,
      shortDescription: {
        en: 'Send an image from a URL.'
      },
      longDescription: {
        en: 'Fetches an image from a given URL, caches it locally, and sends it as an attachment.'
      },
      category: 'media',
      guide: '{pn} <image_url>',
    },

    onStart: async function ({ api, event, args }) {
      try {
        const imageUrl = args[0];
        if (!imageUrl) {
          return api.sendMessage('Please provide an image URL.', event.threadID, event.messageID);
        }

        const imagePath = path.join(cacheDir, `image_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(imagePath);
        const response = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'stream',
        });

        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        api.sendMessage({
          body: 'Here is your image!',
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
          fs.remove(imagePath); // Clean up the cache after sending the message
        });
      } catch (error) {
        console.error(error);
        api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
      }
    },
  };
````
</details>

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.SupportIf you have any questions or need help, feel free to open an issue on the GitHub repository.

## Acknowledgements
<ul>
<li>
  fca-unofficial for the Facebook chat API.
</li>
<li>
  All contributors and supporters
</li>
</ul>
