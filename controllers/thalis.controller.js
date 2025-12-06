import { addThali, updateThali, deleteThali, getThalis, publishThali, getMessSpecificThali, getMessIdByUserId } from '../services/thalis.service.js';
export const addThaliController = async (req, res) => {
  try {
    const thaliData = req.body;
    const userId = req.userId;
    
    const result = await addThali(thaliData,userId);
    
    res.status(201).json({
      message: 'Thali added successfully',
      thaliId: result.thaliId,
      success: true
    });
  } catch (error) {
    console.error('Error adding thali:', error);
    res.status(500).json({ message: 'Error adding thali', error: error.message });
  } 
};

export const updateThaliController = async (req, res) => {
  try {
    const thaliId = req.params.id;
    const thaliData = req.body;
    const result = await updateThali(thaliId, thaliData);

    res.status(200).json({
      message: 'Thali updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating thali:', error);
    res.status(500).json({ message: 'Error updating thali', error: error.message });
  }
};

export const deleteThaliController = async (req, res) => {
  try {
    const thaliId = req.params.id;
    const result = await deleteThali(thaliId);

    res.status(200).json({
      message: 'Thali deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting thali:', error);
    res.status(500).json({ message: 'Error deleting thali', error: error.message });
  }
};


export const getThalisController = async (req, res) => {
  try {
    const { type, date } = req.query;
    const userid = req.userId;
    const Messid = await getMessIdByUserId(userid);
    

    const thalis = await getThalis(Messid, type, date);

    res.status(200).json({
      message: 'Thalis fetched successfully',
      data: thalis
    });
  } catch (error) {
    console.error('Error fetching thalis:', error);
    res.status(500).json({ message: 'Error fetching thalis', error: error.message });
  }
};
export const getMessSpecificThalis = async (req, res) => {
  try {
    const { messId, type, date } = req.query;

    const thalis = await getMessSpecificThali(messId, type, date);

    res.status(200).json({
      message: 'Thalis fetched successfully',
      data: thalis
    });
  } catch (error) {
    console.error('Error fetching thalis:', error);
    res.status(500).json({ message: 'Error fetching thalis', error: error.message });
  }
};

export const publishThaliController = async (req, res) => {
  try {
    const thaliId = req.params.id;
    const { published } = req.body;
    const result = await publishThali(thaliId, published);

    res.status(200).json({
      message: `Thali ${published ? 'published' : 'unpublished'} successfully`,
      success: true
    });
  } catch (error) {
    console.error('Error updating thali publish status:', error);
    res.status(500).json({ message: 'Error updating thali', error: error.message });
  }
};