const db = require("../models");

exports.checkUserMiddleware = async (req, res, next) => {
    const tokenHeader = req.headers["authorization"];
    if (!tokenHeader) {
        return res.status(401).send({
            message: "User not authenticated"
        });
    }
    //"Bearer asdasdasdasdasda123123"
    const token = tokenHeader.split(" ")[1];
    if (!tokenHeader.startsWith("Bearer ")) {
        return res.status(401).send({
            message: "User not authenticated"
        });
    }
    if (!token) {
        return res.status(401).send({
            message: "User not authenticated"
        });
    }
    const tokenDB = await db.tokens.findOne({
        where: {
            token: token
        }
    });
    if (!tokenDB) {
        return res.status(401).send({
            message: "User not authenticated"
        });
    }
    // eslint-disable-next-line no-undef
    if (tokenDB.createdAt < new Date(Date.now() - 1000 * 60 * 60 * 24 * process.env.DAYS_FOR_TOKEN_EXPIRATION)) {
        await db.tokens.destroy({
            where: {
                token: token
            }
        });
        return res.status(401).send({
            message: "Token expired"
        });
    }
    const user = await db.usuario.findOne({
        where: {
            id: tokenDB.usuario_id
        }
    });
    if (!user) {
        return res.status(401).send({
            message: "User not authenticated"
        });
    }

    console.log("middleware user", user.email);
    res.locals.user = user;

    next();
}
// Middleware para verificar si el usuario es administrador
exports.checkAdminMiddleware = async (req, res, next) => {
    if (!res.locals.user || !res.locals.user.esAdmin) {
        return res.status(403).send({
            message: "Acceso denegado. Solo los administradores pueden realizar esta acción."
        });
    }
    next();
}