const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'movies.db',
});


const Movie = sequelize.define('Movie', {
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  yearOfRelease: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});


async function syncDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
  
    await Movie.bulkCreate([
      {
        title: 'Movie 1',
        yearOfRelease: 2020,
        synopsis: 'Synopsis of Movie 1',
      },
      {
        title: 'Movie 2',
        yearOfRelease: 2019,
        synopsis: 'Synopsis of Movie 2',
      },
      {
        title: 'Movie 3',
        yearOfRelease: 2018,
        synopsis: 'Synopsis of Movie 3',
      },
    ]);
    console.log('Example data inserted');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();


const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/movies', async (req, res) => {
  try {
    const { title, yearOfRelease, synopsis } = req.body;
    const movie = await Movie.create({ title, yearOfRelease, synopsis });
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/movies', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const { count, rows } = await Movie.findAndCountAll({ limit, offset });
    res.json({ data: rows, total: count });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, yearOfRelease, synopsis } = req.body;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    await movie.update({ title, yearOfRelease, synopsis });
    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    await movie.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
