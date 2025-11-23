const userController = require('../controllers/userController');

module.exports = app => {
    app
        .route('/users')
        .get(userController.list_all_users)
        .post(userController.create_a_user);

    app
        .route('/users/:userId')
        .get(userController.read_a_user)
        .put(userController.update_a_user)
        .delete(userController.delete_a_user);

    app.route('/auth/signup').post(userController.signup);
    app.route('/auth/login').post(userController.login);
    app.route('/auth/verify-otp').post(userController.verifyOtp);
    app.route('/auth/resend-otp').post
};  