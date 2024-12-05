'use strict';

// 初始化云数据库
const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    // 从数据库获取数据
    const res = await db.collection('categories').get();
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
