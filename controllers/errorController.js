const util = require("../utilities/index.js")
const errController = {};

errController.footerErr = async function(req, res, next) {
    const nav = await util.getNav();
    const message = '<p class="notice">You found the footer error! That\'s not good, this was supposed to break...</p>';
    // The ellipsis in the render below causes an error, leading to the generic server error rather than the footer error.
    res.render(..."./errors/error", {
        title: "Footer Error",
        message,
        nav,
        errors: null
    });
}

module.exports = errController;