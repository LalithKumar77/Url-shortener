import jwt from 'jsonwebtoken';

function generateToken(payload,secret,expiresIn){
    return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token,secret){
    try{
        return jwt.verify(token, secret);
    }catch(err){
        return null;
    }
}

export {generateToken, verifyToken};