'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.hasMany(models.Wallet)
      Account.hasOne(models.Profile)

      Account.belongsToMany(models.Company, {through: models.Investment})
      Account.hasMany(models.Investment)
      }
    checkPassword(password){
      // console.log("masuk static function");
      let result = bcrypt.compareSync(password, this.password);
      // console.log(result);
      return result
    }
    checkOTP(otp){
      
      if(this.otp === otp){
        return true
      }else{
        return false
      }
      
    }
    static async generateOTP(instance){
      let random = Math.floor(Math.random() * 9999) + 1000;
      random = random.toString()
      instance.otp = random
      await instance.save()

      console.log(instance);
      return random
    }
  }
  Account.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg: "Username cannot be empty"
        },
        notEmpty:{
          msg: "Username cannot be empty"
        },
        isAlphanumeric:{
          msg: "Username can only contain alphabet and numbers"
        },
        len:{
          args: [5,8],
          msg: "Length of username needs to be between 5 - 8 characters"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg: "Password cannot be empty"
        },
        notEmpty:{
          msg: "Password cannot be empty"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
        notNull:{
          msg: "Email cannot be empty"
        },
        notEmpty:{
          msg: "Email cannot be empty"
        },
        isEmail:{
          msg: "Please type your email correctly"
        }
      }
    },
    role: DataTypes.STRING,
    otp: DataTypes.STRING
  }, {
    sequelize,
    hooks:{
      beforeCreate(instance, option){
        let salt = bcrypt.genSaltSync(10);
        instance.password = bcrypt.hashSync(instance.password, salt);
        instance.role = "user"
      }
    },
    modelName: 'Account',
  });
  return Account;
};