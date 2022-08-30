export default class AuthController {
  constructor(authServices, model, comparePassword, generateToken){
    this._services = authServices
    this._model = model
    this._comparePassword = comparePassword
    this._generateToken = generateToken
  }

  async authenticationUser(user){
    try {
      const result = await this._services.getOneUserByEmail(user)
      //si existe el email
      if (result) {
        const resultComparePassword = await this._comparePassword(user.password, result.password)
        //comprobacion de password 
        if (resultComparePassword) {
          //generar autenticacion 
          const tokenUser = this._generateToken(result.id)
          return new this._model({
            state: true, 
            name_complete: result.name_complete,
            email: result.email,
            profile_rol: result.profile_rol,
            token: tokenUser,
            message: 'Login Succesfully'
          })
        } else { // si no existe el email
          return new this._model({
            state: false, 
            name_complete: '',
            email: '',
            profile_rol: '',
            token: '',
            message: 'wrong credentials'
        })
      }
    }else{
      return new this._model({
        state: false, 
        name_complete: '',
        email: '',
        profile_rol: '',
        token: '',
        message: 'wrong credentials'
    })
    }
    } catch (error) {
      return new Error(error)
    }
  }
}