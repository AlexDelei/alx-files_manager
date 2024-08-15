import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import dbClient from './db';
import userUtils from './user';
import basicUtility from './basic';

const fileUtils = {
  /**
   * validateBody(request) - validates file information
   * @param {*} req - incoming request from the client
   * @returns an object with valid file data
  */
  async validateBody(req) {
    const {
      name, type, isPublic = false, data,
    } = req.body;
    let { parentId = 0 } = req.body;

    const typesAllowed = ['folder', 'file', 'image'];
    let msg = null;

    if (parentId === '0') parentId = 0;

    if (!name) {
      msg = 'Missing name';
    }
    if (!type || !typesAllowed.includes(type)) {
      msg = 'Missing type';
    }
    if (!data && type !== 'folder') {
      msg = 'Missing data';
    }
    if (parentId && parentId !== '0') {
      let file = null;

      if (basicUtility.isValid(parentId)) {
        file = await this.getFile({ _id: ObjectId(parentId) });
      }

      if (!file) {
        msg = 'Parent not found';
      }
      if (file.type !== 'folder') {
        msg = 'Parent is not a folder';
      }
    }

    const obj = {
      error: msg,
      fileParams: {
        name, type, parentId, isPublic, data,
      },
    };
    return obj;
  },

  /**
   * getFile - queries the db to find the file with the id provided
   * @param {*} query - file identity; file id
   * @returns - the file
   */
  async getFile(query) {
    const file = await dbClient.db.collection('files').findOne(query);
    return file;
  },

  /**
   * getFilesOfParentId - a list of files belonging to a parentId
   * @param {*} query - query object with the parent id
   * @returns - an array of files
   */
  async getFilesOfParentId(query) {
    const filesArray = await dbClient.db.collection('files').aggregate(query);
    return filesArray;
  },

  /**
   * saveFile - saves files to db and disk
   * @param {string} userId - user id to find the file
   * @param {obj} fileParams - object with attributes of file to save
   * @param {*} FOLDER_PATH - path to save file in disk
   * @returns object with error if present and file
   */
  async saveFile(userId, fileParams, FOLDER_PATH) {
    const {
      name, type, isPublic, data,
    } = fileParams;
    let { parentId } = fileParams;

    if (parentId !== 0) parentId = ObjectId(parentId);
    const query = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    };

    if (fileParams.type !== 'folder') {
      const fileNameUuid = uuidv4();
      const fileDataDecoded = Buffer.from(data, 'base64');
      const path = `${FOLDER_PATH}/${fileNameUuid}`;

      query.localPath = path;
      try {
        await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
        await fsPromises.writeFile(path, fileDataDecoded);
      } catch (error) {
        return { error: error.message, code: 400 };
      }
    }

    const result = await dbClient.db.collection('files').insertOne(query);
    const file = this.processFile(query);
    const newFile = { id: result.insertedId, ...file };

    return { error: null, newFile };
  },

  /**
   * updateFile - updates a file document in database
   * @param {obj} query - query to find document to update
   * @param {obj} set - object with quer info to update in Mongo
   * @returns an updated file
   */
  async updateFile(query, set) {
    const fileList = await dbClient.db.collection('files').findOneAndUpdate(
      query, set,
      { returnOriginal: false },
    );
    return fileList;
  },

  /**
   * publishUnpublish - makes a file public or private
   * @param {request} req - incoming request from the client
   * @param {boolean} setPublish - boolean value
   * @returns {obj} an object with error, status code and updated file
   */
  async publishUnpublish(req, setPublish) {
    const { id: fileId } = req.params;
    if (!basicUtility.isValid(fileId)) {
      return { error: 'Unauthorized', code: 401 };
    }

    const { userId } = await userUtils.getUserCreds(req);
    if (!basicUtility.isValid(userId)) {
      return { error: 'Unauthorized', code: 401 };
    }

    const user = await userUtils.getUser({ _id: ObjectId(userId) });
    if (!user) {
      return { error: 'Unauthorized', code: 401 };
    }

    const file = await this.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) {
      return { error: 'Not found', code: 404 };
    }

    const result = await this.updateFile(
      { _id: ObjectId(fileId), userId: ObjectId(userId) },
      { $set: { isPublic: setPublish } },
    );

    const {
      _id: id, userId: resultUserId, name, type, isPublic, parentId,
    } = result.value;
    const updatedFile = {
      id, userId: resultUserId, name, type, isPublic, parentId,
    };

    return {
      error: null, code: 200, updatedFile,
    };
  },

  /**
   * processFile - transform _id into id in a file document
   * @param {*} doc - document to be processed
   * @returns - processed document
   */
  processFile(doc) {
    const file = { id: doc._id, ...doc };

    delete file.localPath;
    delete file._id;

    return file;
  },

  /**
   * isOwnerAndPublic - checks if a file is public and belongs to a specific user
   * @param {*} file - file to evaluate
   * @param {*} userId - id of user to check ownership
   * @returns { boolean} - true or false
   */
  isOwnerAndPublic(file, userId) {
    if (
      (!file.isPublic && !userId) || (userId && file.userId.toString() !== userId && !file.isPublic)
    ) {
      return false;
    }
    return true;
  },

  /**
   * getFileData - get files from database
   * @param {*} file - file to read
   * @param {*} size - size of the file
   * @returns {obj} the data of the file or error
   */
  async getFileData(file, size) {
    let { localPath } = file;
    let data;

    if (size) localPath = `${localPath}_${size}`;

    try {
      data = await fsPromises.readFile(localPath);
    } catch (error) {
      return { error: 'Not found', code: 404 };
    }
    return { data };
  },
};

export default fileUtils;
