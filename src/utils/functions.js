const bcrypt = require('bcryptjs');
const validateError = (error)=>{
    console.log(error);
    switch (error.message) {
        case 'Wrong type':
            return 'review request fields';
            break;
        case 'Missing fields':
            return 'Validate fields';
            break;
        case 'Inexistent role':
                return 'Role not registered';
                break;
        case 'Missing fields':
                return 'Validate fields';
                break;
        case 'Nothing found':
            return 'No data found';
            break;
            case 'Password mismath':
                return 'Credentials mismatch';
                break;
        case 'User disabled':
            return 'User disabled';
            break;
            
        default:
            return 'Review request';
            break;
    }
};

const hashPassword = async(pass)=>{
    const salt = await bcrypt.genSalt(15);
    return await bcrypt.hash(pass, salt);
}

const validatePassword = async(password, hashedPassword)=>{
    console.log(hashedPassword);
    console.log(password);
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    validateError, hashPassword, validatePassword
}