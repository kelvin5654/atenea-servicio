import {contentFunction} from "../../pdf/content/pdfContentArea.js"
import { appPdf } from "../../pdf/app.js"
export class ControllerArea {
    constructor(serviceArea, area) {
        this._service = serviceArea
        this._model = area
    }

    async createNewArea(area) {
        const newModel = new this._model(area, null)
        const newArea = Object.assign({}, newModel)

        const grade = await this._service.getOneData('Grades', newArea.gradeRef)

        if (grade == undefined) {
            throw "El id de este grado no existe"
        }

        // } else if (teacher.rol != 'docente') {
        //     return "Este usuario no es un docente"
        // } else if (level == undefined) {
        //     return "El id de este nivel no existe"
        // }

        const gradeRef = await this._service.getDocRef('Grades', area.gradeRef)
        // const levelRef = await this._service.getDocRef('Levels', grade.levelRef)

        newArea.gradeRef = gradeRef
        // newGrade.levelRef = levelRef

        const response = await this._service.saveData('Areas', newArea)
        return response
    }

    async updateAnAreaName(id, area) {
        const oldArea = await this._service.getOneData('Areas', id)

        if (oldArea == undefined) {
            throw "El id de esta area no existe"
        }

        oldArea.area_name = area.area_name
        delete oldArea.id

        const response = await this._service.updateData('Areas', id, oldArea)
        return response
    }

    // async updateAnArea(id, area) {
    //     const oldArea = await this._service.getOneData('Areas', id)
    //     const newModel = new this._model(area, oldArea);
    //     const newArea = Object.assign({}, newModel);
    //     const grade = await this._service.getOneData('Grades', newArea.gradeRef)

    //     if (oldArea == undefined) {
    //         return "El id de esta area no existe"
    //     } else if (grade == undefined) {
    //         return "El id de este grado no existe"
    //     }

    //     const gradeRef = await this._service.getDocRef('Grades', newArea.gradeRef)

    //     newArea.gradeRef = gradeRef

    //     const response = await this._service.updateData('Areas', id, newArea);
    //     return response;
    // }

    async deleteAnArea(id) {
        const response = await this._service.getOneData('Areas', id)
        if (response == undefined) {
            throw "Este id de area no existe"
        }
        response.enable = false
        delete response.id
        const disableArea = await this._service.updateData('Areas', id, response);
        const activities = await this._service.getData('Activities')
        for (const activity of activities) {
            if (activity.areaRef._key.path.segments.at(-1) == id) {
                activity.enable = false
                const activityId = activity.id
                delete activity.id
                const disableActivity = await this._service.updateData('Activities', activityId, activity);
            }
        }
        return disableArea
    }


    async getAllAreas() {
        const response = await this._service.getData('Areas')
        let enabledData = []
        for (const area of response) {
            area.gradeRef = await this._service.getDocByRef(area.gradeRef)
            if (area.gradeRef == undefined || area.enable == false) {
                continue
            }
            delete area.gradeRef.levelRef
            delete area.gradeRef.teacherRef
            enabledData.push(area)
        }
        return enabledData
    }

    async getOneArea(uid) {
        const response = await this._service.getOneData('Areas', uid)
        if (response == undefined || response.enable == false) {
            throw "Este id de area no existe o no esta habilitado"
        }
        response.gradeRef = await this._service.getDocByRef(response.gradeRef)
        delete response.gradeRef.levelRef
        delete response.gradeRef.teacherRef

        //Se buscan las actividades que pertenecen a esta area
        const activities = await this._service.getData('Activities')
        response.activities = {unit1 : [], unit2 : [], unit3 : [], unit4 : []}
        for (const activity of activities) {
            if (activity.areaRef._key.path.segments.at(-1) == uid && activity.enable == true) {
                delete activity.areaRef
                delete activity.scores
                const unidad = "unit"+activity.unit
                if (response.activities[unidad] == undefined) {
                    response.activities[unidad] = []
                }
                delete activity.unit
                response.activities[unidad].push(activity)
            }
        }
        return response
    }

    // async addStudent(idGrade, idStudent) {
    //     const studentModel = await this._service.getOneData('Students', idStudent)
    //     studentModel.gradeRef = await this._service.getDocRef('Grades', idGrade)
    //     const response = await this._service.updateData('Students', idStudent, studentModel);
    //     return response
    // }

    // async addCourse(idGrade, idCourse) {
    //     const courseModel = await this._service.getOneData('Courses', idCourse)
    //     courseModel.gradeRef = await this._service.getDocRef('Grades', idGrade)
    //     const response = await this._service.updateData('Courses', idCourse, courseModel);
    //     return response
    // }
    //le da el formato que debe de ir en el pdf
    styleToActivity(name){
        const activity = {text:name ,style:"tableHeader2"}
        return activity
    }
    //debemos tener 9 espacios en cada unidad, si no hay 9 actividades se debe de mandar un string vacio osea = ""
    //pero se debe de completar los 9 espacios
    addActivities(unit){
       let auxUnit = []
       const sizeUnit = unit.length 
        for(let i = 0;i<9;i++){
            if(i<sizeUnit){
                const name = unit[i].activity_name
                const activity = this.styleToActivity(name)
                auxUnit.push(activity)
            }else{
                const name = ""
                const activity = this.styleToActivity(name)
                auxUnit.push(activity)
            }

        }
        return auxUnit
        
    }

    async createInformation(idArea){
        let doc = {}
        const area = await this.getOneArea(idArea)
        const activities = area.activities
        const grade = await this._service.getOneGrade('Grades',area.gradeRef.id)
        //return activities.unit1.length
        //agregamo los datos del curso y del profesor
        doc.docente = grade.teacherRef.displayName
        doc.area = area.area_name
        doc.grado = grade.grade_name
        //creamos el espacion para las actividades
        doc.activities = {}
        doc.activities.unit1 = this.addActivities(activities.unit1)
        doc.activities.unit2 = this.addActivities(activities.unit2)
        doc.activities.unit3 = this.addActivities(activities.unit3)
        doc.activities.unit4 = this.addActivities(activities.unit4)
        return doc 
    }
    async unifyOnePdf(idArea){
        const doc = await this.createInformation(idArea)
        const data = {
            name:"Registro_Area",
            year: new Date().getFullYear()
        }
        const direction = `docs/area/${data.name}${data.year}Boletin.pdf` 
        const contentFinal = contentFunction(doc)
        return this.savePdf(contentFinal,direction,data)
    }

    savePdf(content,direction,data){
        const pdfResult = appPdf(content, direction,data)
        return pdfResult
    }
    createInformationPdf(information){
        content = {
            docente:information.docente,
            area: information.area,
            grado: information.grado,
            seccion: information.seccion
        }
    }

}