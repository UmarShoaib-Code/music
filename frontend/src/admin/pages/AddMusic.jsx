import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../admin.css';

function AddMusic() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('');
  const [categoryType, setCategoryType] = useState(''); // New state for category type
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [duration, setDuration] = useState(0);
  const [displayDuration, setDisplayDuration] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategory(res.data[0]._id);
          // Optionally set the first type if available
          if (res.data[0].types.length > 0) {
            setCategoryType(res.data[0].types[0]._id);
          } else {
            setCategoryType('');
          }
        }
      } catch (err) {
        console.error('Fetch categories error:', err);
        setError('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const audio = new Audio(URL.createObjectURL(selectedFile));
    audio.onloadedmetadata = () => {
      const durationInSeconds = Math.round(audio.duration);
      setDuration(durationInSeconds);
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      setDisplayDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    audio.onerror = () => {
      setError('Could not read audio file');
      setFile(null);
    };
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    // Reset categoryType when category changes
    const selectedCategory = categories.find(cat => cat._id === newCategory);
    if (selectedCategory && selectedCategory.types.length > 0) {
      setCategoryType(selectedCategory.types[0]._id);
    } else {
      setCategoryType('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('category', category);
    if (categoryType) formData.append('categoryType', categoryType); // Add categoryType if selected
    formData.append('file', file);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    formData.append('duration', duration.toString());
    formData.append('releaseDate', releaseDate);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/music/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      
      setSuccess('Music added successfully!');
      setTitle('');
      setArtist('');
      setFile(null);
      setThumbnail(null);
      setDuration(0);
      setDisplayDuration('');
      setReleaseDate(new Date().toISOString().split('T')[0]);
      // Reset category and type to initial values
      if (categories.length > 0) {
        setCategory(categories[0]._id);
        setCategoryType(categories[0].types.length > 0 ? categories[0].types[0]._id : '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add music');
    }
  };

  const selectedCategory = categories.find(cat => cat._id === category) || { types: [] };

  return (
    <div className="card">
      <h2 className="card-title">Add Music</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title:</label>
          <input
            className="form-control"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Artist:</label>
          <input
            className="form-control"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category:</label>
          <select
            className="form-control"
            value={category}
            onChange={handleCategoryChange}
            required
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category Type (optional):</label>
          <select
            className="form-control"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            disabled={selectedCategory.types.length === 0}
          >
            {selectedCategory.types.length === 0 ? (
              <option value="">No types available</option>
            ) : (
              selectedCategory.types.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Audio File:</label>
          <input
            className="form-control"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Thumbnail (optional):</label>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration:</label>
          <input
            className="form-control"
            type="text"
            value={displayDuration}
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="form-label">Release Date:</label>
          <input
            className="form-control"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add Music
        </button>
      </form>
    </div>
  );
}

export default AddMusic;