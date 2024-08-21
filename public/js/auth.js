async function isAuthenticated(req, res, next) {
    const { userId, username } = req.cookies; // `userId` is defined here if present in cookies

    if (!userId || !username) {
        return res.redirect('/signin');
    }

    console.log('Retrieved userId from cookie:', userId);

    try {
        const user = await User.findById(userId);
        if (user && user.username === username) {
            req.user = user;
            return next();
        } else {
            res.clearCookie('userId');
            res.clearCookie('username');
            return res.redirect('/signin');
        }
    } catch (err) {
        console.error('Authentication error:', err);
        res.clearCookie('userId');
        res.clearCookie('username');
        return res.redirect('/signin');
    }
}
