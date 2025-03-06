// momentConfig.js
const moment = require('moment');

// Set locale (for example, Ukrainian)
moment.locale('uk'); // You can use any locale you need here, e.g., 'en', 'fr', etc.

// You can also use moment.js features with the locale set
const formattedDate = moment().format('LLLL'); // Example format: 'dddd, MMMM Do YYYY, h:mm:ss a'

// Export moment instance
module.exports = moment;