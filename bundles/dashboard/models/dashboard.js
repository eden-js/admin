
// import dependencies
const Model = require('model');

/**
 * create user class
 */
class Dashboard extends Model {
  /**
   * sanitises dashboard
   *
   * @return {Promise}
   */
  async sanitise(req) {
    // return dashboard
    return {
      id          : this.get('_id') ? this.get('_id').toString() : null,
      type        : this.get('type'),
      name        : this.get('name'),
      public      : !!this.get('public'),
      placement   : await this.get('placement') ? await (await this.get('placement')).sanitise(req) : null,
      description : this.get('description'),
    };
  }
}

/**
 * export user class
 * @type {user}
 */
module.exports = Dashboard;
