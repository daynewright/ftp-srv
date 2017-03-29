const when = require('when');
const escapePath = require('../../helpers/escape-path');

module.exports = {
  directive: ['MKD', 'XMKD'],
  handler: function ({log, command} = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.mkdir) return this.reply(402, 'Not supported by file system');

    return when.try(this.fs.mkdir.bind(this.fs), command._[1])
    .then(dir => {
      const path = dir ? `"${escapePath(dir)}"` : undefined;
      return this.reply(257, path);
    })
    .catch(err => {
      log.error(err);
      return this.reply(550);
    });
  },
  syntax: '{{cmd}}[path]',
  description: 'Make directory'
};
