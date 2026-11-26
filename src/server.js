require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Missing JWT_SECRET or MONGO_URI in .env');
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Student API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
