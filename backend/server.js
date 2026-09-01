// Backend folder entry point fallback for Render
try {
  require('./dist/server.js');
} catch (err1) {
  try {
    require('../backend/dist/server.js');
  } catch (err2) {
    console.error('Failed to load backend dist/server.js:', err1, err2);
    process.exit(1);
  }
}
