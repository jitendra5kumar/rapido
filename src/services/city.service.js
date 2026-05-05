import City from '../models/city.model.js';

export const createCity = async (userId, { name, image }) => {
  // Check if city with same name already exists
  const existingCity = await City.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCity) {
    throw new Error('City with this name already exists');
  }

  const city = await new City({
    name,
    image,
    createdBy: userId,
  }).save();

  return city;
};

export const updateCity = async (cityId, userId, { name, image }) => {
  // Verify city exists
  const city = await City.findById(cityId);
  if (!city) {
    throw new Error('City not found');
  }

  // Check if user has permission (only creator can update)
  if (city.createdBy.toString() !== userId) {
    throw new Error('Unauthorized to update this city');
  }

  // Check if new name conflicts with existing cities
  if (name && name !== city.name) {
    const existingCity = await City.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: cityId }
    });
    if (existingCity) {
      throw new Error('City with this name already exists');
    }
  }

  // Update fields if provided
  if (name) city.name = name;
  if (image) city.image = image;

  await city.save();
  return city;
};

export const getCityById = async (cityId) => {
  const city = await City.findById(cityId).populate('createdBy', 'name phone');
  if (!city) {
    throw new Error('City not found');
  }
  return city;
};

export const getAllCities = async () => {
  const cities = await City.find().populate('createdBy', 'name phone').sort({ createdAt: -1 });
  return cities;
};

export const getUserCities = async (userId) => {
  const cities = await City.find({ createdBy: userId }).sort({ createdAt: -1 });
  return cities;
};

export const deleteCity = async (cityId, userId) => {
  const city = await City.findById(cityId);
  if (!city) {
    throw new Error('City not found');
  }

  if (city.createdBy.toString() !== userId) {
    throw new Error('Unauthorized to delete this city');
  }

  await City.findByIdAndDelete(cityId);
  return { message: 'City deleted successfully' };
};
