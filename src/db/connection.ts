import mongoose from 'mongoose';

const url = 'mongodb://abhijeetsrivastava:abhijeet2128@ac-gvo3lxc-shard-00-00.sq9u8on.mongodb.net:27017,ac-gvo3lxc-shard-00-01.sq9u8on.mongodb.net:27017,ac-gvo3lxc-shard-00-02.sq9u8on.mongodb.net:27017/?replicaSet=atlas-f5xc5h-shard-0&ssl=true&authSource=admin';

export const connection = async()=>{
    try{
        await mongoose.connect(url)
        console.log("Succesfully connected to the db");
        
    }catch(e){
        console.log(e,"ERRRRRR");
    }

}
