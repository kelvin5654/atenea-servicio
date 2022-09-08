export class UserRouter{
    constructor(router, controller, response, httpCode){
        this._router = router()
        this._controller = controller
        this._response = response
        this._httpcode = httpCode
        this.registerRouter()    
    }

    registerRouter(){
        this._router.post('/create-user', this.handleCreateUser.bind(this))
        this._router.get('/get-users', this.handleGetAllUsers.bind(this))
        this._router.get('/get-user/:id', this.handleGetOneUser.bind(this))
        this._router.put('/update-user/:id', this.handleUpdateuser.bind(this))
        this._router.put('/delete-user/:id', this.handleDeleteuser.bind(this))
    }
    
    async handleCreateUser(req,res){
        try {
            const user = req.body
            const result = await this._controller.createNewUser(user)
            this._response.succes(req, res, result, this._httpcode.CREATED)
        } catch (error) {
            this._response.error(req, res, error, this._httpcode.BAD_REQUEST)
        }
    }

    async handleGetAllUsers(req, res){
        try {
            const result = await this._controller.getAllUsers()
            this._response.succes(req, res, result, this._httpcode.OK)
        } catch (error) {
            this._response.error(req, res, error, this._httpcode.BAD_REQUEST)
        }
    }

    async handleGetOneUser(req, res){
        try {
            const idUser = req.params['id']
            const result = await this._controller.getOneUser(idUser)
            this._response.succes(req, res, result, this._httpcode.OK)
        } catch (error) {
            this._response.error(req, res, error, this._httpcode.BAD_REQUEST)
        }
    }

    async handleUpdateuser(req, res){
        try {
            const idUser = req.params['id']
            const infoUser = req.body
            const result = await this._controller.updateInfoUser(idUser, infoUser)
            this._response.succes(req, res, result, this._httpcode.OK)
        } catch (error) {
            this._response.error(req, res, error, this._httpcode.BAD_REQUEST)
        }
    }

    async handleDeleteuser(req, res){
        try {
            const idUser = req.params['id']
            const result = await this._controller.deleteUserController(idUser)
            this._response.succes(req, res, result, this._httpcode.OK)
        } catch (error) {
            this._response.error(req, res, error, this._httpcode.BAD_REQUEST)
        }
    }
}