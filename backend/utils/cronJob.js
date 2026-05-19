const cron = require('node-cron');
const { generateDailySet } = require('./generator');

// Run everyday at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily set generation cron job...');
  await generateDailySet();
  console.log('Daily set generation completed.');
});
