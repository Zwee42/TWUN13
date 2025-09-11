


import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUserDocument extends Document {
    username: string;
    email: string;
    password: string;
    bio?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;

}



const UserSchema = new Schema<IUserDocument>({
    username: {
        type: String,
        required: true,

    }, 
    password: {
        type: String,
        required: true,
        select: true,
    },
})

// Password hashing middleware
UserSchema.pre<IUserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};



// 3. Create User Class with MongoDB Integration
export class User {
    [x: string]: any;
  private _id?: mongoose.Types.ObjectId;
  private _username: string;
  private _email: string;
  private _password: string;


  constructor(username: string, email: string, password: string, bio?: string, image?: string, id?: mongoose.Types.ObjectId) {
    this._username = username;
    this._email = email;
    this._password = password;

    this._id = this.id;
  }



   // Getters
  get id() { return this._id; }
  get username() { return this._username; }
  get email() { return this._email; }
  get password() { return this._password; }




  // MongoDB Operations
  public async save(): Promise<User> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.create({
      _id: this._id,
      username: this._username,
      email: this._email,
      password: this._password,
    
    });

    this._id = doc._id as mongoose.Types.ObjectId;

    return this;
  }


  
  public static async findById(id: string): Promise<User | null> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return User.fromDocument(doc);
  }
  
  public static async findByIdWithPassword(id: string) {
  const doc = await UserModel.findById(id).select('+password');
  if (!doc) return null;
  return User.fromDocument(doc);
}


  public static async findOne(emailOrUsername: string): Promise<User | null> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select('+password'); // Include password for authentication
    if (!doc) return null;
    return User.fromDocument(doc);
  }



  
  public static fromDocument(doc: IUserDocument): User {
    const user = new User(
      doc.username, 
      doc.email, 
      doc.password, 

    );

    user._id = doc._id as mongoose.Types.ObjectId;
    return user;
  }

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    const UserModel = mongoose.model<IUserDocument>('User');
    const doc = await UserModel.findById(this._id).select('+password');
    console.log(doc);
    if (!doc) return false;
    return doc.comparePassword(candidatePassword);
  }


    public toObject() {
    return {
      id: this._id?.toString(),
      name: this._username,
      email: this._email,
  
      // Never include password in toObject output
    };
  }
  
public static async findOneAndUpdate(
 userId: string, 
 updates: {
  username?: string;
  email?: string;

},
options: {new: boolean}
): Promise<User | null> {
  const UserModel = mongoose.model<IUserDocument>('User');
  
  // Validate updates
  const allowedUpdates = ['username', 'email'];
  const updatesToApply: Record<string, any> = {};


    for (const key in updates) {
    if (allowedUpdates.includes(key) && updates[key as keyof typeof updates] !== undefined) {
      updatesToApply[key] = updates[key as keyof typeof updates];
    }
  }


  const updatedDoc = await UserModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId (userId) },
    updatesToApply,
    { 
      new: true,
      runValidators: true // Ensure schema validations run
    }
  );

  if (!updatedDoc) return null;
  
  return User.fromDocument(updatedDoc);
}
}

  
// 4. Create Mongoose Model
export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
