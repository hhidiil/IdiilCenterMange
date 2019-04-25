const express = require('express')
const curriculumRouter = require('../services/curriculum.ctrl.js')
const userRouter = require('../services/user.ctrl.js')
const classRouter = require('../services/classes.ctrl.js')
const manageRouter = require('../services/manage.ctrl.js')
const fileDeal = require('../services/upload.ctrl.js')
const apiRouter = express.Router()

apiRouter.use('/curriculum', curriculumRouter)
apiRouter.use('/user', userRouter)
apiRouter.use('/classes', classRouter)
apiRouter.use('/file', fileDeal)
apiRouter.use('/manage', manageRouter)

module.exports = apiRouter
