const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
const { Octokit } = require("@octokit/rest")
const octokit = new Octokit({
    auth: "9f3c726967fd547c2892921b4e1fd41017d26ac6",
    userAgent: 'Cheaseed Prototype 1.0',
    timeZone: 'America/Los_Angeles',
    log: require("console-log-level")({ level: "info" }),
    request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
    }
})

//const colorMap = {"Red": "#b60205", "Blue": "#1d76db", "Yellow": "#fbca04", "Green": "#0e8a16", "Purple": "#5319e7",
//"LightBlue": "#bfd4f2", "Pink": "#e99695", "DarkBlue": "#0052cc", "Cyan": "#f9d0c4", "LightGreen": "#c2e0c6", 
//"LightPurple": "#d4c5f9"
//}
const colorMap = {
    "Critical": "b60205", "High": "1d76db", "Normal": "fbca04", "Low": "0e8a16",
    "New Feature": "5319e7", "Functional Bug": "bfd4f2", "UI Fix": "e99695", "Content Fix": "0052cc",
    "Unsure": "f9d0c4", "Build Issue": "c2e0c6", "Nit": "d4c5f9"
}

const filePath = path.join(__dirname, 'issues.csv')
let parsedData = undefined
fs.readFile(filePath, async (error, data) => {
    if (error) {
        return console.log('error reading file')
    }
     parsedData = await neatCsv(data)
})
const priorities = new Set(parsedData.map(csvIssue => {
    return csvIssue.Priority
}))
priorityMap = new Map()
priorities.forEach(function (priority) {
    priorityMap.set("Priority:" + priority, colorMap[priority])
})

const issueTypes = new Set(parsedData.map(csvIssue => {
    return csvIssue['Issue Type']
}))
issueTypesMap = new Map()
issueTypes.forEach(function (issueType) {
    issueTypesMap.set(issueType, colorMap[issueType])
})

for (let [key, value] of issueTypesMap) {
    console.log(key + ' = ' + value)
}
//const ranks = new Set(parsedData.map(csvIssue => {
//    return "Rank:" + csvIssue.Rank
//})) 

const allLabelsMap = new Map([...priorityMap, ...issueTypesMap])

for (let [key, value] of allLabelsMap) {
    console.log(key + ' = ' + value)
}
//console.log("Parsed Data = " + JSON.stringify(parsedData))
allLabelsMap.forEach(async function (color, label) {
    const data = await octokit.issues.createLabel({
        owner: 'anandsathe67',
        repo: 'GithubIssuesImport',
        name: label,
        color: color
        
    })
    console.log(data)
})
