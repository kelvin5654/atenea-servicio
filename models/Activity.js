export class Activity {
    constructor(activity, oldActivity) {
        this.activity_name = activity.activity_name || oldActivity.activity_name
        this.activity_value = activity.activity_value || oldActivity.activity_value
        this.areaRef = activity.areaRef || oldActivity.areaRef
        this.unit = activity.unit
        this.enable = true
        this.isTest = activity.isTest || false
    }
}