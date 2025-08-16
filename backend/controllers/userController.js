import User from '../models/User.js'
import argon2 from 'argon2';


export async function getAllUsersHandler (req,res) {
    
    try{
        const users = await  User.find({});
        if(!users || users.length === 0){
            return res.status(404).json({ message: 'No users found' });
        }
        // Exclude sensitive fields like password and tokens
        const sanitizedUsers = users.map(user =>{
            const { username,gmail } = user.toObject();
            return { username,gmail };
        })
        return res.status(200).json(sanitizedUsers);
    }catch(error){
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


export async function deleteUserHandler(req,res){
    try{
        const userId = req.user.id;
        const password = req.body.password;
        if(!password){
            return res.status(400).json({ message: 'Password is required' });
        }
        const user = await User.findOneAndDelete({ _id: userId});
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify password
        const isPasswordValid =  await argon2.verify(user.password, password);
        if(!isPasswordValid){
            return res.status(401).json({ message: 'Invalid password' });
        }

        // User deleted successfully
        
        return res.status(200).json({ message: 'User deleted successfully' });

    }catch(error){
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}



export async function updateProfilePic(req,res){
    console.log('Updating profile picture for user:', req.user.id);
    try {
        const userId = req.user.id;
        const {photo} = req.body;

        if(!photo){
            return res.status(400).json({ message: 'Photo is required' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }

        user.profilePicture = photo;
        await user.save();

        return res.status(200).json({ message: 'Profile picture updated successfully' });

    } catch (error) {
        console.log('Error updating profile picture:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function deleteProfilepic(req,res){
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profilePicture = null;
        await user.save();

        return res.status(200).json({ message: 'Profile picture deleted successfully' });

    } catch (error) {
        console.error('Error deleting profile picture:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

