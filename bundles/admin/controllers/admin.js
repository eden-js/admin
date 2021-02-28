// Require local class dependencies
const config     = require('config');
const Controller = require('controller');

// require models
const Dashboard = model('dashboard');

/**
 * Create Admin Controller class. Only visible to people with the 'admin.view' role
 *
 * @acl   admin.view
 * @fail  /
 *
 * @mount /admin
 */
class AdminController extends Controller {
  /**
   * Construct Admin Controller class
   */
  constructor() {
    // Run super
    super();

    // Bind public methods
    this.indexAction = this.indexAction.bind(this);
  }

  /**
   * Admin index action
   *
   * @param    {Request}  req Express request
   * @param    {Response} res Express response
   *
   * @menu     {MAIN}  Admin
   * @menu     {ADMIN} Admin Home
   * @icon     fa fa-lock
   * @view     admin
   * @route    {get}   /
   * @layout   admin
   * @priority 100
   */
  async indexAction(req, res) {
    // Render admin page
    res.render('admin', {
      name      : 'Admin Home',
      type      : 'admin.home',
      jumbotron : `Welcome back, ${req.user.get('username')}!`,
    });
  }

  /**
   * Admin index action
   *
   * @param    {Request}  req Express request
   * @param    {Response} res Express response
   *
   * @menu     {ADMIN} Admin Config
   * @icon     fa fa-cog
   * @view     admin
   * @route    {get}   /config
   * @layout   admin
   * @priority -100
   */
  async configAction(req, res) {
    // get dashboards
    const dashboards = await Dashboard.where({
      type : 'admin.config',
    }).or({
      'user.id' : req.user.get('_id').toString(),
    }, {
      public : true,
    }).find();

    // Render admin page
    res.render('admin', {
      name       : 'Admin Config',
      type       : 'admin.config',
      blocks     : blockHelper.renderBlocks('admin'),
      jumbotron  : `${config.get('title')} config`,
      dashboards : await Promise.all(dashboards.map(async (dashboard, i) => {
        // return sanitise promise
        return dashboard.sanitise(i === 0 ? req : null);
      })),
    });
  }
}

/**
 * Exports Admin Controller class
 *
 * @type {AdminController}
 */
module.exports = AdminController;
