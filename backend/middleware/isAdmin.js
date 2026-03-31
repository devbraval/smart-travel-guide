const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Unauthorized" })
    }
    next();
}
module.exports = isAdmin;