import { ObjectId } from 'mongodb';

const basicUtility = {
  isValid(id) {
    try {
      ObjectId(id);
    } catch (error) {
      return false;
    }
    return true;
  },
};

export default basicUtility;
