exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => {
  // Invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  // Duplicate key (email / rollNumber)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists.` });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};
