const { getAsArray, getAsObject } = require('@base-cms/object-path');

/**
 * Pipes results to the passed input stream
 * @param {object} args The function args
 * @param {object} args.client The service client
 * @param {string} args.action The service action
 * @param {string} args.params The service params
 * @param {number} limit The number of results to process in each chunk
 * @param {object} stream The json2csv AsyncProcessor input stream
 */
const executor = async (args) => {
  const {
    client,
    action,
    params,
    limit = 500,
    stream,
  } = args;
  const pagination = getAsObject(params, 'pagination');
  const data = await client.request(action, {
    ...params,
    pagination: {
      ...pagination,
      limit,
    },
  });
  const nodes = getAsArray(data, 'edges').map(edge => edge.node);
  stream.push(JSON.stringify(nodes));
  const { hasNextPage, endCursor } = getAsObject(data, 'pageInfo');
  if (hasNextPage) {
    await executor({
      ...args,
      params: {
        ...params,
        pagination: { ...pagination, limit, after: endCursor },
      },
    });
  }
  stream.push(null);
};

module.exports = executor;