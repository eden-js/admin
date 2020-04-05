
// require dependencies
const Controller = require('controller');

// require models
const Block     = model('block');
const Dashboard = model('dashboard');
const Placement = model('editablePlacement');

// require helpers
const modelHelper = helper('model');
const BlockHelper = helper('cms/block');

/**
 * build dashboard controller
 *
 * @mount /dashboard
 */
class DashboardController extends Controller {
  /**
   * construct user DashboardController controller
   */
  constructor() {
    // run super
    super();

    // bind methods
    this.viewAction = this.viewAction.bind(this);
    this.updateAction = this.updateAction.bind(this);
    this.removeAction = this.removeAction.bind(this);

    // register simple block
    BlockHelper.block('dashboard.notes', {
      acl         : ['admin.notes'],
      for         : ['admin'],
      title       : 'Notes Area',
      description : 'Lets you add notes to a block',
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // return
      return {
        tag     : 'notes',
        class   : blockModel.get('class') || null,
        title   : blockModel.get('title') || '',
        content : blockModel.get('content') || '',
      };
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // set data
      blockModel.set('class', req.body.data.class);
      blockModel.set('title', req.body.data.title);
      blockModel.set('content', req.body.data.content);

      // save block
      await blockModel.save(req.user);
    });
  }

  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.listen.dashboard
   * @return {Async}
   */
  async listenAction(id, uuid, opts) {
    // join room
    opts.socket.join(`dashboard.${id}`);

    // add to room
    return await modelHelper.addListener(await Dashboard.findById(id), {
      atomic    : true,
      user      : opts.user,
      listenID  : uuid,
      sessionID : opts.sessionID,
    });
  }

  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.deafen.dashboard
   * @return {Async}
   */
  async liveDeafenAction(id, uuid, opts) {
    // join room
    opts.socket.leave(`dashboard.${id}`);

    // add to room
    return await modelHelper.removeListener(await Dashboard.findById(id), {
      atomic    : true,
      user      : opts.user,
      listenID  : uuid,
      sessionID : opts.sessionID,
    });
  }

  /**
   * add/edit action
   *
   * @route    {get} /:id/view
   * @layout   admin
   * @priority 12
   */
  async viewAction(req, res) {
    // set website variable
    let dashboard = new Dashboard();

    // check for website model
    if (req.params.id) {
      // load by id
      dashboard = await Dashboard.findById(req.params.id);
    }

    // return JSON
    res.json({
      state   : 'success',
      result  : await dashboard.sanitise(),
      message : 'Successfully got blocks',
    });
  }

  /**
   * create submit action
   *
   * @route  {post} /create
   * @layout admin
   */
  createAction(...args) {
    // return update action
    return this.updateAction(...args);
  }

  /**
   * add/edit action
   *
   * @param req
   * @param res
   *
   * @route  {post} /:id/update
   * @layout admin
   */
  async updateAction(req, res) {
    // set website variable
    let create    = true;
    let dashboard = new Dashboard();

    // check for website model
    if (req.params.id) {
      // load by id
      create = false;
      dashboard = await Dashboard.findById(req.params.id);
    }

    // update dashboard
    dashboard.set('user', req.user);
    dashboard.set('type', req.body.type);
    dashboard.set('name', req.body.name);
    dashboard.set('public', !!req.body.public);

    // check placement
    if (req.body.placement) dashboard.set('placement', await Placement.findById(req.body.placement.id));

    // save dashboard
    await dashboard.save(req.user);

    // send alert
    req.alert('success', `Successfully ${create ? 'Created' : 'Updated'} dashboard!`);

    // return JSON
    res.json({
      state   : 'success',
      result  : await dashboard.sanitise(),
      message : 'Successfully updated dashboard',
    });
  }

  /**
   * delete action
   *
   * @param req
   * @param res
   *
   * @route   {post} /:id/remove
   * @title   Remove dashboard
   * @layout  admin
   */
  async removeAction(req, res) {
    // set website variable
    let dashboard = false;

    // check for website model
    if (req.params.id) {
      // load user
      dashboard = await Dashboard.findById(req.params.id);
    }

    // alert Removed
    req.alert('success', `Successfully removed ${dashboard.get('_id').toString()}`);

    // delete website
    await dashboard.remove(req.user);

    // return JSON
    res.json({
      state   : 'success',
      result  : null,
      message : 'Successfully removed dashboard',
    });
  }
}

/**
 * export dashboard controller
 *
 * @type {DashboardController}
 */
module.exports = DashboardController;
