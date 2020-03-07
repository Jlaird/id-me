const { createError } = require('micro');
const { createRequiredParamError } = require('@base-cms/micro').service;
const { handleError } = require('@identity-x/utils').mongoose;
const { isObject } = require('@base-cms/utils');

const { Application, CommentStream } = require('../../mongodb/models');

module.exports = async ({ applicationId, payload } = {}) => {
  if (!applicationId) throw createRequiredParamError('applicationId');
  if (!isObject(payload)) throw createRequiredParamError('payload');

  const application = await Application.findById(applicationId, ['id']);
  if (!application) throw createError(404, `No application was found for '${applicationId}'`);

  const {
    title,
    description,
    identifier,
    url,
  } = payload;

  try {
    const stream = new CommentStream({
      applicationId,
      title,
      description,
      identifier,
      ...(url && { urls: [url] }),
    });

    await stream.validate();
    const criteria = { applicationId, identifier };
    await CommentStream.updateOne(criteria, {
      $setOnInsert: criteria,
      $set: { title, description },
      ...(url && { $addToSet: { urls: url } }),
    }, { upsert: true });
    return CommentStream.findOne(criteria);
  } catch (e) {
    throw handleError(createError, e);
  }
};
