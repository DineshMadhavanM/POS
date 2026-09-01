// Root entry point fallback for Render and cloud hosts
try {
  require('./backend/dist/server.js');
} catch (err1) {
  try {
    require('./dist/server.js');
  } catch (err2) {
    console.error('Failed to locate server entrypoint:', err1, err2);
    process.exit(1);
  }
}
